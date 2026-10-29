// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  eventCreate: vi.fn(),
  auditCreate: vi.fn(),
  bookingUpdateMany: vi.fn(),
  sendA2U: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/db', () => {
  const tx = {
    payment: { updateMany: m.updateMany },
    paymentEvent: { create: m.eventCreate },
    booking: { updateMany: m.bookingUpdateMany },
  };
  return {
    prisma: {
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
      payment: { findUnique: m.findUnique, findFirst: m.findFirst, updateMany: m.updateMany },
      paymentEvent: { create: m.eventCreate },
      auditLog: { create: m.auditCreate },
    },
  };
});
vi.mock('@/lib/pi-network/a2u', async () => {
  class A2UPostSubmitError extends Error {
    constructor(message: string, public identifier: string, public txid: string) {
      super(message);
    }
  }
  return { sendA2UPayment: m.sendA2U, A2UPostSubmitError };
});

import { RefundError, markRefundedManually, processRefund, refundIneligibleReason } from '@/lib/payments/refund';
import { A2UPostSubmitError } from '@/lib/pi-network/a2u';

const eligible = {
  id: 'p1', userId: 'u1', bookingId: 'b1', status: 'completed', amount: 10, piTxid: 'tx1',
  refundRequestedAt: new Date(), refundProcessingAt: null, refundedAt: null,
  user: { piWalletId: 'pi-uid' }, booking: { bookingCode: 'C1' },
};

beforeEach(() => {
  vi.clearAllMocks();
  m.auditCreate.mockResolvedValue({});
  m.eventCreate.mockResolvedValue({});
  m.updateMany.mockResolvedValue({ count: 1 });
  m.findFirst.mockResolvedValue(null);
  m.findUnique.mockResolvedValue(eligible);
  process.env.REFUNDS_AUTO_SEND = 'true';
});
afterEach(() => Reflect.deleteProperty(process.env, 'REFUNDS_AUTO_SEND'));

describe('refundIneligibleReason', () => {
  it('accepts a completed, requested, unprocessed payment', () => {
    expect(refundIneligibleReason(eligible)).toBeNull();
  });
  it.each([
    [{ status: 'pending' }, /Only completed/],
    [{ status: 'approved' }, /Only completed/],
    [{ status: 'cancelled' }, /Only completed/],
    [{ status: 'refunded' }, /Already refunded/],
    [{ refundedAt: new Date() }, /Already refunded/],
    [{ refundRequestedAt: null }, /No refund was requested/],
    [{ refundProcessingAt: new Date() }, /already being processed/],
    [{ piTxid: null }, /no confirmed transaction/],
    [{ amount: 0 }, /Invalid payment amount/],
    [{ amount: -5 }, /Invalid payment amount/],
  ])('rejects %j', (over, re) => {
    expect(refundIneligibleReason({ ...eligible, ...over })).toMatch(re);
  });
});

describe('processRefund', () => {
  it('is disabled unless REFUNDS_AUTO_SEND=true', async () => {
    Reflect.deleteProperty(process.env, 'REFUNDS_AUTO_SEND');
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toMatchObject({ status: 503 });
    expect(m.sendA2U).not.toHaveBeenCalled();
  });

  it('refuses an ineligible payment without moving money', async () => {
    m.findUnique.mockResolvedValue({ ...eligible, status: 'pending' });
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toMatchObject({ status: 409 });
    expect(m.sendA2U).not.toHaveBeenCalled();
  });

  it('does not send when another worker already holds the claim (no double refund)', async () => {
    m.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toMatchObject({ status: 409 });
    expect(m.sendA2U).not.toHaveBeenCalled();
  });

  it('sends once and marks the payment refunded with a full audit trail', async () => {
    m.sendA2U.mockResolvedValue({ identifier: 'i1', txid: 'refund-tx', network: 'mainnet' });
    const out = await processRefund({ paymentId: 'p1', adminId: 'a1' });
    expect(out).toMatchObject({ status: 'refunded', txid: 'refund-tx' });
    expect(m.sendA2U).toHaveBeenCalledTimes(1);
    expect(m.sendA2U.mock.calls[0][0]).toMatchObject({ uid: 'pi-uid', amount: 10 });
    expect(m.eventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ fromStatus: 'completed', toStatus: 'refunded', actor: 'admin:a1' }),
    });
    expect(m.bookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: { status: 'refunded', paymentStatus: 'refunded' },
    });
  });

  it('releases the claim when nothing reached the chain, so it can be retried', async () => {
    m.sendA2U.mockRejectedValue(new Error('Blockchain submission failed'));
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toMatchObject({ status: 502 });
    const releases = m.updateMany.mock.calls.filter((c) => c[0].data?.refundProcessingAt === null);
    expect(releases).toHaveLength(1);
  });

  it('KEEPS the claim when Pi was already sent (never sends twice)', async () => {
    m.sendA2U.mockRejectedValue(new A2UPostSubmitError('sent but not closed', 'i1', 'chain-tx'));
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toMatchObject({ status: 502 });
    const releases = m.updateMany.mock.calls.filter((c) => c[0].data?.refundProcessingAt === null);
    expect(releases).toHaveLength(0);
    expect(m.eventCreate.mock.calls[0][0].data.metadata).toMatchObject({ txid: 'chain-tx' });
  });

  it('requires the user to have a Pi wallet id', async () => {
    m.findUnique.mockResolvedValue({ ...eligible, user: { piWalletId: null } });
    await expect(processRefund({ paymentId: 'p1', adminId: 'a1' })).rejects.toBeInstanceOf(RefundError);
    expect(m.sendA2U).not.toHaveBeenCalled();
  });
});

describe('markRefundedManually', () => {
  it('records a manual refund with the support txid', async () => {
    const out = await markRefundedManually({ paymentId: 'p1', adminId: 'a1', txid: 'manual-tx-123' });
    expect(out.status).toBe('refunded');
    expect(m.eventCreate).toHaveBeenCalled();
  });

  it('rejects a txid already used for another refund', async () => {
    m.findFirst.mockResolvedValue({ id: 'other' });
    await expect(
      markRefundedManually({ paymentId: 'p1', adminId: 'a1', txid: 'manual-tx-123' })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rejects a payment that was never requested or is not completed', async () => {
    m.findUnique.mockResolvedValue({ ...eligible, refundRequestedAt: null });
    await expect(
      markRefundedManually({ paymentId: 'p1', adminId: 'a1', txid: 'manual-tx-123' })
    ).rejects.toMatchObject({ status: 409 });
    m.findUnique.mockResolvedValue({ ...eligible, status: 'failed' });
    await expect(
      markRefundedManually({ paymentId: 'p1', adminId: 'a1', txid: 'manual-tx-123' })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rejects a malformed txid', async () => {
    await expect(markRefundedManually({ paymentId: 'p1', adminId: 'a1', txid: 'x' })).rejects.toMatchObject({ status: 400 });
  });
});
