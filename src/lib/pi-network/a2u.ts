// src/lib/pi-network/a2u.ts
//
// App-to-User (A2U) payments: the app sends Pi from its own app wallet to a
// user. Implemented per Pi's official integration guide
// (https://github.com/pi-apps/pi-sdk-integration-guide):
//
//   1. POST /v2/payments            -> { identifier, recipient }
//   2. load the app wallet account  (fresh every time, never cached)
//   3. build a payment tx, memo = payment identifier
//   4. sign with the app wallet's secret seed
//   5. submit to the Pi blockchain  -> txid
//   6. POST /v2/payments/{id}/complete { txid }
//
// SAFETY DESIGN
// - Network is decided by PI_SANDBOX, and each network reads its OWN seed
//   env var (PI_TESTNET_WALLET_SEED / PI_MAINNET_WALLET_SEED). A testnet
//   deployment can never touch a mainnet seed, and vice versa. If the seed
//   for the active network is missing, this refuses to run.
// - No automatic retry on payment creation: a retried POST could create a
//   second payment, and Pi explicitly warns about double payments.
// - One A2U at a time per server instance (the blockchain needs strictly
//   increasing sequence numbers for the app wallet). Concurrent calls queue.
// - If anything fails AFTER the Pi payment was created but BEFORE a
//   transaction was submitted, the Pi payment is cancelled so it doesn't
//   sit open and block the next one.
// - The secret seed is read from the environment only and is never logged.

import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
import { logger } from '@/lib/logger';

const PI_API_URL = 'https://api.minepi.com';
const REQUEST_TIMEOUT_MS = 20_000;

export interface A2UNetworkConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl: string;
  passphrase: string;
  seedEnvName: 'PI_TESTNET_WALLET_SEED' | 'PI_MAINNET_WALLET_SEED';
}

export function getA2UNetworkConfig(): A2UNetworkConfig {
  if (process.env.PI_SANDBOX === 'true') {
    return {
      network: 'testnet',
      horizonUrl: 'https://api.testnet.minepi.com',
      passphrase: 'Pi Testnet',
      seedEnvName: 'PI_TESTNET_WALLET_SEED',
    };
  }
  return {
    network: 'mainnet',
    horizonUrl: 'https://api.mainnet.minepi.com',
    passphrase: 'Pi Network',
    seedEnvName: 'PI_MAINNET_WALLET_SEED',
  };
}

export interface SendA2UParams {
  /** The recipient's Pi user uid (what Pi's auth returns; stored as User.piWalletId). */
  uid: string;
  /** Amount of Pi to send. */
  amount: number;
  /** Shown to the user in their wallet. */
  memo: string;
  metadata?: Record<string, unknown>;
}

export interface SendA2UResult {
  identifier: string;
  txid: string;
  network: 'testnet' | 'mainnet';
}

// ---- one-at-a-time queue ----------------------------------------------
let queue: Promise<unknown> = Promise.resolve();
function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  // keep the chain alive regardless of success/failure
  queue = next.catch(() => undefined);
  return next;
}

function piHeaders(apiKey: string) {
  return { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' };
}

async function cancelPiPayment(apiKey: string, identifier: string): Promise<void> {
  try {
    await axios.post(`${PI_API_URL}/v2/payments/${identifier}/cancel`, {}, {
      headers: piHeaders(apiKey),
      timeout: REQUEST_TIMEOUT_MS,
    });
    logger.log(`[a2u] cancelled un-submitted Pi payment ${identifier}`);
  } catch (err) {
    logger.error(`[a2u] FAILED to cancel Pi payment ${identifier} — it may need manual cancellation:`, err instanceof Error ? err.message : err);
  }
}

export function sendA2UPayment(params: SendA2UParams): Promise<SendA2UResult> {
  return runExclusive(() => doSendA2UPayment(params));
}

async function doSendA2UPayment(params: SendA2UParams): Promise<SendA2UResult> {
  const cfg = getA2UNetworkConfig();

  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {throw new Error('PI_API_KEY not configured');}

  const seed = process.env[cfg.seedEnvName];
  if (!seed) {
    throw new Error(`${cfg.seedEnvName} is not configured — A2U payments are disabled on ${cfg.network}.`);
  }

  if (!params.uid || typeof params.uid !== 'string') {throw new Error('Invalid recipient uid');}
  if (!Number.isFinite(params.amount) || params.amount <= 0) {throw new Error('Invalid amount');}
  if (!params.memo || params.memo.length > 100) {throw new Error('Invalid memo');}

  let keypair: StellarSdk.Keypair;
  try {
    keypair = StellarSdk.Keypair.fromSecret(seed);
  } catch {
    // Deliberately vague: never echo anything about the seed value.
    throw new Error(`${cfg.seedEnvName} is not a valid secret seed.`);
  }

  // 1. Create the payment on Pi's side (NO automatic retry — see header).
  let identifier: string;
  let recipient: string;
  try {
    const res = await axios.post<{ identifier: string; recipient: string }>(
      `${PI_API_URL}/v2/payments`,
      { amount: params.amount, memo: params.memo, metadata: params.metadata ?? {}, uid: params.uid },
      { headers: piHeaders(apiKey), timeout: REQUEST_TIMEOUT_MS }
    );
    identifier = res.data.identifier;
    recipient = res.data.recipient;
    if (!identifier || !recipient) {throw new Error('Pi did not return identifier/recipient');}
  } catch (err) {
    const detail = axios.isAxiosError(err)
      ? `${err.response?.status ?? ''} ${JSON.stringify(err.response?.data ?? err.message)}`
      : err instanceof Error ? err.message : String(err);
    logger.error('[a2u] create payment failed:', detail);
    throw new Error(`Could not create the A2U payment on Pi: ${detail}`);
  }

  // 2-5. Build, sign and submit the blockchain transaction.
  let txid: string;
  try {
    const server = new StellarSdk.Horizon.Server(cfg.horizonUrl);
    const account = await server.loadAccount(keypair.publicKey()); // fresh every time
    const baseFee = await server.fetchBaseFee();
    const timebounds = await server.fetchTimebounds(180);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: String(baseFee),
      networkPassphrase: cfg.passphrase,
      timebounds,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: recipient,
          asset: StellarSdk.Asset.native(),
          amount: params.amount.toString(),
        })
      )
      .addMemo(StellarSdk.Memo.text(identifier)) // Pi requires the payment id as memo
      .build();

    tx.sign(keypair);
    const submitted = await server.submitTransaction(tx);
    txid = (submitted as { id?: string; hash?: string }).id ?? (submitted as { hash?: string }).hash ?? '';
    if (!txid) {throw new Error('Blockchain did not return a transaction id');}
  } catch (err) {
    // Nothing reached the chain (or we can't tell) — free up the Pi payment.
    const detail = err instanceof Error ? err.message : String(err);
    logger.error(`[a2u] blockchain submit failed for ${identifier}:`, detail);
    await cancelPiPayment(apiKey, identifier);
    throw new Error(`Blockchain submission failed: ${detail}`);
  }

  // 6. Tell Pi it's done. The money has ALREADY moved at this point, so a
  // failure here must be loud and must carry the txid so it can be completed
  // by hand — never silently swallowed, never cancelled.
  try {
    await axios.post(
      `${PI_API_URL}/v2/payments/${identifier}/complete`,
      { txid },
      { headers: piHeaders(apiKey), timeout: REQUEST_TIMEOUT_MS }
    );
  } catch (err) {
    const detail = axios.isAxiosError(err)
      ? `${err.response?.status ?? ''} ${JSON.stringify(err.response?.data ?? err.message)}`
      : err instanceof Error ? err.message : String(err);
    logger.error(`[a2u] SENT but /complete failed. identifier=${identifier} txid=${txid}:`, detail);
    throw new Error(`Pi was sent (txid ${txid}, payment ${identifier}) but marking it complete failed: ${detail}`);
  }

  logger.log(`[a2u] ✅ ${cfg.network} payment ${identifier} complete, txid ${txid}`);
  return { identifier, txid, network: cfg.network };
}
