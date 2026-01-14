// src/lib/pi-network/service.ts
export class PiNetworkService {
  private pi: any;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      this.pi = (window as any).Pi;
    }
  }

  async initialize(): Promise<void> {
    try {
      if (!this.pi) {
        throw new Error('Pi SDK not loaded. Make sure you are running in Pi Browser.');
      }
      this.isInitialized = true;
      console.log('Pi Network SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Pi Network SDK:', error);
      throw error;
    }
  }

  async authenticate(scopes: string[] = ['username', 'payments']): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    try {
      const user = await this.pi.authenticate(scopes, (payment: any) => {
        console.log('Payment callback:', payment);
      });
      return user;
    } catch (error) {
      console.error('Pi Network authentication failed:', error);
      throw error;
    }
  }

  async createPayment(options: {
    amount: number;
    memo: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    try {
      const payment = await this.pi.createPayment({
        amount: options.amount,
        memo: options.memo,
        metadata: options.metadata || {},
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment ready for approval:', paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
        },
        onError: (error: any, payment: any) => {
          console.error('Payment error:', error, payment);
        },
      });
      return payment;
    } catch (error) {
      console.error('Pi Network payment creation failed:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    const response = await fetch(`/api/pi/payments/${paymentId}`);
    return response.json();
  }

  async completePayment(paymentId: string): Promise<void> {
    await fetch(`/api/pi/payments/${paymentId}/complete`, {
      method: 'POST',
    });
  }
}

export const piNetworkService = new PiNetworkService();
