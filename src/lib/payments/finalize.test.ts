// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const tx = vi.hoisted(() => ({
  payment: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  booking: { update: vi.fn() },
  user: { update: vi.fn() },
}));

vi.mock('@/lib/db', () => ({
  prisma: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) },
}));

import { finalizePayment } from '@/lib/payments/finalize';

const params = {
  paymentId: 'pay_1',
  txid: 'tx_abc',
  requestId: 'req_1',
  allowedFrom: ['approved'],
  source: 'client' as const,
};

const payment = { id: 'pay_1', userId: 'u1', bookingId: 'b1', amount: 10, metadata: { memo: 'm' } };

beforeEach(() => {
  vi.clearAllMocks();
  tx.payment.findFirst.mockResolvedValue(null);
  tx.payment.findUnique.mockResolvedValue(payment);
  tx.payment.updateMany.mockResolvedValue({ count: 1 });
});

describe('finalizePayment', () => {
  it('confirms the booking and credits 2% cashback exactly once', async () => {
    const res = await finalizePayment(params);

    expect(res).toEqual({ finalized: true, cashback: 0.2 });
    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: { status: 'confirmed', paymentStatus: 'paid' },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { piBalance: { increment: 0.2 } },
    });
  });

  it('is a no-op for the loser of a race (status already moved): no cashback, no booking change', async () => {
    tx.payment.updateMany.mockResolvedValue({ count: 0 });

    const res = await finalizePayment(params);

    expect(res).toEqual({ finalized: false, cashback: 0 });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.booking.update).not.toHaveBeenCalled();
  });

  it('only moves the payment out of the allowed statuses (compare-and-set)', async () => {
    await finalizePayment({ ...params, allowedFrom: ['pending', 'approved'] });
    expect(tx.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 'pay_1', status: { in: ['pending', 'approved'] } },
      data: { status: 'completed', piTxid: 'tx_abc' },
    });
  });

  it('refuses a txid that already settled a different payment', async () => {
    tx.payment.findFirst.mockResolvedValue({ id: 'other_payment' });
    await expect(finalizePayment(params)).rejects.toThrow('TXID_ALREADY_USED');
    expect(tx.payment.updateMany).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('throws when the payment does not exist', async () => {
    tx.payment.findUnique.mockResolvedValue(null);
    await expect(finalizePayment(params)).rejects.toThrow('PAYMENT_NOT_FOUND');
  });

  it('does not touch a booking when the payment has none', async () => {
    tx.payment.findUnique.mockResolvedValue({ ...payment, bookingId: null });
    const res = await finalizePayment(params);
    expect(res.finalized).toBe(true);
    expect(tx.booking.update).not.toHaveBeenCalled();
  });

  it('records the cashback and source in the payment metadata', async () => {
    await finalizePayment({ ...params, source: 'webhook' });
    const call = tx.payment.update.mock.calls[0][0];
    expect(call.data.metadata).toMatchObject({
      memo: 'm',
      txid: 'tx_abc',
      cashback: 0.2,
      completedVia: 'webhook',
      requestId: 'req_1',
    });
  });
});
