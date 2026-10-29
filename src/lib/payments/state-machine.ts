// src/lib/payments/state-machine.ts
//
// The ONLY definition of which payment status changes are legal, plus the
// helper that applies one atomically and records it in PaymentEvent.
//
//   pending ──► created ──► approved ──► completed ──► refunded
//      │           │            │
//      └───────────┴────────────┴──► cancelled | failed        (terminal)
//
// - `created`  : the Pi payment exists and is linked (piPaymentId bound).
// - `pending` may go straight to `approved` (the current client flow).
// - cancelled / failed / refunded are terminal.
// - Only a `completed` payment can be refunded.

import type { Prisma } from '@prisma/client';

export const PAYMENT_STATUSES = [
  'pending',
  'created',
  'approved',
  'completed',
  'refunded',
  'cancelled',
  'failed',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  pending: ['created', 'approved', 'cancelled', 'failed'],
  created: ['approved', 'cancelled', 'failed'],
  approved: ['completed', 'cancelled', 'failed'],
  completed: ['refunded'],
  refunded: [],
  cancelled: [],
  failed: [],
};

/** Statuses in which a payment still "holds" its booking (no second one allowed). */
export const ACTIVE_STATUSES: readonly PaymentStatus[] = ['pending', 'created', 'approved', 'completed'];

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: string, to: string): boolean {
  if (!isPaymentStatus(from) || !isPaymentStatus(to)) {return false;}
  return TRANSITIONS[from].includes(to);
}

export function isActiveStatus(status: string): boolean {
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

export class InvalidPaymentTransitionError extends Error {
  constructor(public readonly from: string, public readonly to: string) {
    super(`Invalid payment transition: ${from} -> ${to}`);
    this.name = 'InvalidPaymentTransitionError';
  }
}

export function assertTransition(from: string, to: string): void {
  if (!canTransition(from, to)) {
    throw new InvalidPaymentTransitionError(from, to);
  }
}

export interface TransitionParams {
  paymentId: string;
  /** Statuses the payment is allowed to be in right now. Every one must be able to reach `to`. */
  from: readonly PaymentStatus[];
  to: PaymentStatus;
  actor: string;
  reason?: string;
  /** Extra columns to write in the same atomic update (e.g. piTxid). */
  data?: Prisma.PaymentUpdateManyMutationInput;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Atomic compare-and-set. Returns true only for the single caller whose update
 * matched; a concurrent or repeated call returns false and writes no event.
 * Must run inside a transaction (pass the tx client) so the status change and
 * its audit row commit together.
 */
export async function transitionPayment(
  tx: Prisma.TransactionClient,
  params: TransitionParams
): Promise<boolean> {
  const { paymentId, from, to, actor, reason, data, metadata } = params;

  for (const f of from) {assertTransition(f, to);}

  const res = await tx.payment.updateMany({
    where: { id: paymentId, status: { in: [...from] } },
    data: { ...(data ?? {}), status: to },
  });
  if (res.count === 0) {return false;}

  await tx.paymentEvent.create({
    data: {
      paymentId,
      fromStatus: from.length === 1 ? from[0] : null,
      toStatus: to,
      actor,
      reason: reason ?? null,
      ...(metadata !== undefined ? { metadata } : {}),
    },
  });
  return true;
}
