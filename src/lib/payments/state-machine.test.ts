// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import {
  PAYMENT_STATUSES,
  canTransition,
  assertTransition,
  isActiveStatus,
  transitionPayment,
  InvalidPaymentTransitionError,
} from '@/lib/payments/state-machine';

describe('payment state machine', () => {
  it('allows the legal lifecycle', () => {
    expect(canTransition('pending', 'created')).toBe(true);
    expect(canTransition('pending', 'approved')).toBe(true);
    expect(canTransition('created', 'approved')).toBe(true);
    expect(canTransition('approved', 'completed')).toBe(true);
    expect(canTransition('completed', 'refunded')).toBe(true);
  });

  it('allows cancelling or failing anything that is not completed yet', () => {
    for (const from of ['pending', 'created', 'approved']) {
      expect(canTransition(from, 'cancelled')).toBe(true);
      expect(canTransition(from, 'failed')).toBe(true);
    }
  });

  it.each(['refunded', 'cancelled', 'failed'])('%s is terminal', (status) => {
    for (const to of PAYMENT_STATUSES) {expect(canTransition(status, to)).toBe(false);}
  });

  it('rejects skipping or reversing states', () => {
    expect(canTransition('pending', 'completed')).toBe(false);
    expect(canTransition('pending', 'refunded')).toBe(false);
    expect(canTransition('approved', 'pending')).toBe(false);
    expect(canTransition('completed', 'cancelled')).toBe(false);
    expect(canTransition('completed', 'failed')).toBe(false);
    expect(canTransition('completed', 'approved')).toBe(false);
  });

  it('rejects unknown statuses', () => {
    expect(canTransition('weird', 'completed')).toBe(false);
    expect(canTransition('pending', 'weird')).toBe(false);
    expect(() => assertTransition('completed', 'pending')).toThrow(InvalidPaymentTransitionError);
  });

  it('only pending/created/approved/completed hold a booking', () => {
    for (const s of ['pending', 'created', 'approved', 'completed']) {expect(isActiveStatus(s)).toBe(true);}
    for (const s of ['refunded', 'cancelled', 'failed']) {expect(isActiveStatus(s)).toBe(false);}
  });
});

describe('transitionPayment', () => {
  const makeTx = (count: number) => ({
    payment: { updateMany: vi.fn().mockResolvedValue({ count }) },
    paymentEvent: { create: vi.fn().mockResolvedValue({}) },
  });

  it('updates atomically and records an audit event', async () => {
    const tx = makeTx(1);
    const ok = await transitionPayment(tx as never, {
      paymentId: 'p1', from: ['approved'], to: 'completed', actor: 'webhook', data: { piTxid: 'tx' },
    });
    expect(ok).toBe(true);
    expect(tx.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: { in: ['approved'] } },
      data: { piTxid: 'tx', status: 'completed' },
    });
    expect(tx.paymentEvent.create).toHaveBeenCalledWith({
      data: { paymentId: 'p1', fromStatus: 'approved', toStatus: 'completed', actor: 'webhook', reason: null },
    });
  });

  it('writes nothing when another caller already moved the payment (duplicate)', async () => {
    const tx = makeTx(0);
    const ok = await transitionPayment(tx as never, {
      paymentId: 'p1', from: ['approved'], to: 'completed', actor: 'user:1',
    });
    expect(ok).toBe(false);
    expect(tx.paymentEvent.create).not.toHaveBeenCalled();
  });

  it('throws before touching the database on an illegal transition', async () => {
    const tx = makeTx(1);
    await expect(
      transitionPayment(tx as never, { paymentId: 'p1', from: ['completed'], to: 'cancelled', actor: 'x' })
    ).rejects.toThrow(InvalidPaymentTransitionError);
    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });
});
