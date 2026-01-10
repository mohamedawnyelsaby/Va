// src/lib/pi-network/backend.ts
// ✅ Pi Network Backend SDK - SERVER SIDE ONLY
// Package: pi-backend (npm install pi-backend)

import PiNetwork from 'pi-backend';

// DO NOT expose these values to public/frontend
const PI_API_KEY = process.env.PI_API_KEY!;
const WALLET_PRIVATE_SEED = process.env.PI_WALLET_PRIVATE_SEED!; // Starts with S

class PiBackendService {
  private static instance: PiBackendService;
  private pi: PiNetwork;

  private constructor() {
    if (!PI_API_KEY || !WALLET_PRIVATE_SEED) {
      throw new Error('Pi Network credentials not configured');
    }

    this.pi = new PiNetwork(PI_API_KEY, WALLET_PRIVATE_SEED);
    console.log('✅ Pi Backend SDK initialized');
  }

  static getInstance(): PiBackendService {
    if (!PiBackendService.instance) {
      PiBackendService.instance = new PiBackendService();
    }
    return PiBackendService.instance;
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    try {
      const payment = await this.pi.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  }

  /**
   * Approve incomplete payment (Server-Side Approval)
   */
  async approvePayment(paymentId: string) {
    try {
      await this.pi.approvePayment(paymentId);
      console.log('✅ Payment approved:', paymentId);
      return true;
    } catch (error) {
      console.error('❌ Payment approval error:', error);
      throw error;
    }
  }

  /**
   * Complete payment (Server-Side Completion)
   */
  async completePayment(paymentId: string, txid: string) {
    try {
      await this.pi.completePayment(paymentId, txid);
      console.log('✅ Payment completed:', paymentId);
      return true;
    } catch (error) {
      console.error('❌ Payment completion error:', error);
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string) {
    try {
      await this.pi.cancelPayment(paymentId);
      console.log('✅ Payment cancelled:', paymentId);
      return true;
    } catch (error) {
      console.error('❌ Payment cancellation error:', error);
      throw error;
    }
  }

  /**
   * Create A2U (App-to-User) payment
   */
  async createA2UPayment(
    userUid: string,
    amount: number,
    memo: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const paymentData = {
        amount,
        memo,
        metadata,
        uid: userUid,
      };

      const paymentId = await this.pi.createPayment(paymentData);
      console.log('✅ A2U Payment created:', paymentId);

      // Submit to blockchain
      const txid = await this.pi.submitPayment(paymentId);
      console.log('✅ A2U Payment submitted to blockchain:', txid);

      // Complete payment
      await this.pi.completePayment(paymentId, txid);
      console.log('✅ A2U Payment completed');

      return { paymentId, txid };
    } catch (error) {
      console.error('❌ A2U Payment error:', error);
      throw error;
    }
  }

  /**
   * Get incomplete payments for user
   */
  async getIncompletePayments(userUid: string) {
    try {
      const payments = await this.pi.getIncompleteServerPayments(userUid);
      return payments;
    } catch (error) {
      console.error('Get incomplete payments error:', error);
      throw error;
    }
  }
}

// Export singleton
export const piBackend = PiBackendService.getInstance();
