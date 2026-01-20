// ============================================
// PI PAYMENT HANDLER
// Business logic for Pi Network payments
// ============================================
// Path: lib/pi/payment-handler.ts
// ============================================

import { prisma } from '@/lib/db';
import { approvePayment, completePayment, getPayment } from './platform-api';

// ============================================
// TYPES
// ============================================

interface PaymentApprovalResult {
  success: boolean;
  paymentId: string;
  error?: string;
}

interface PaymentCompletionResult {
  success: boolean;
  paymentId: string;
  bookingId?: string;
  cashback?: number;
  error?: string;
}

// ============================================
// PAYMENT APPROVAL FLOW
// ============================================

/**
 * Handle payment approval
 * Called when payment is ready for server approval
 */
export async function handlePiPaymentApproval(
  piPaymentId: string,
  userId: string
): Promise<PaymentApprovalResult> {
  try {
    console.log(`💳 Approving payment: ${piPaymentId}`);

    // Get payment from Pi Platform
    const piPayment = await getPayment(piPaymentId);

    // Verify payment belongs to user
    if (piPayment.user_uid !== userId) {
      throw new Error('Payment user mismatch');
    }

    // Find payment in our database
    const dbPayment = await prisma.payment.findFirst({
      where: {
        piPaymentId: piPaymentId,
        userId: userId,
      },
      include: {
        booking: true,
      },
    });

    if (!dbPayment) {
      throw new Error('Payment not found in database');
    }

    // Verify amount matches
    if (Math.abs(piPayment.amount - dbPayment.amount) > 0.0001) {
      throw new Error('Payment amount mismatch');
    }

    // Approve on Pi Platform
    await approvePayment(piPaymentId);

    // Update payment status in database
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'approved',
        metadata: {
          ...(dbPayment.metadata as object),
          approvedAt: new Date().toISOString(),
          piPaymentData: piPayment,
        },
      },
    });

    // Update booking status
    if (dbPayment.booking) {
      await prisma.booking.update({
        where: { id: dbPayment.booking.id },
        data: {
          paymentStatus: 'processing',
        },
      });
    }

    console.log(`✅ Payment approved: ${piPaymentId}`);

    return {
      success: true,
      paymentId: dbPayment.id,
    };
  } catch (error) {
    console.error('❌ Payment approval failed:', error);
    
    return {
      success: false,
      paymentId: piPaymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// PAYMENT COMPLETION FLOW
// ============================================

/**
 * Handle payment completion
 * Called when payment is ready for server completion
 */
export async function handlePiPaymentCompletion(
  piPaymentId: string,
  txid: string,
  userId: string
): Promise<PaymentCompletionResult> {
  try {
    console.log(`🎉 Completing payment: ${piPaymentId}`);
    console.log(`⛓️ Transaction: ${txid}`);

    // Find payment in database
    const dbPayment = await prisma.payment.findFirst({
      where: {
        piPaymentId: piPaymentId,
        userId: userId,
      },
      include: {
        booking: true,
        user: true,
      },
    });

    if (!dbPayment) {
      throw new Error('Payment not found');
    }

    // Verify payment is approved
    if (dbPayment.status !== 'approved') {
      throw new Error('Payment not approved');
    }

    // Complete on Pi Platform
    await completePayment(piPaymentId, txid);

    // Update payment in database
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'completed',
        piTxid: txid,
        metadata: {
          ...(dbPayment.metadata as object),
          completedAt: new Date().toISOString(),
          txid,
        },
      },
    });

    // Update booking
    if (dbPayment.booking) {
      await prisma.booking.update({
        where: { id: dbPayment.booking.id },
        data: {
          status: 'confirmed',
          paymentStatus: 'paid',
        },
      });
    }

    // Calculate and credit cashback (2%)
    const cashback = dbPayment.amount * 0.02;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        piBalance: {
          increment: cashback,
        },
      },
    });

    console.log(`✅ Payment completed successfully`);
    console.log(`🎁 Cashback: ${cashback} Pi`);

    return {
      success: true,
      paymentId: dbPayment.id,
      bookingId: dbPayment.booking?.id,
      cashback,
    };
  } catch (error) {
    console.error('❌ Payment completion failed:', error);
    
    return {
      success: false,
      paymentId: piPaymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// PAYMENT VALIDATION
// ============================================

/**
 * Validate payment before processing
 */
export async function validatePayment(
  piPaymentId: string,
  userId: string,
  expectedAmount: number
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Get payment from Pi Platform
    const piPayment = await getPayment(piPaymentId);

    // Check user
    if (piPayment.user_uid !== userId) {
      return { valid: false, error: 'User mismatch' };
    }

    // Check amount
    if (Math.abs(piPayment.amount - expectedAmount) > 0.0001) {
      return { valid: false, error: 'Amount mismatch' };
    }

    // Check direction
    if (piPayment.direction !== 'user_to_app') {
      return { valid: false, error: 'Invalid payment direction' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export { PaymentApprovalResult, PaymentCompletionResult };
