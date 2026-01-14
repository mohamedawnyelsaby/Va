// src/lib/pi-network/service.ts
import PiNetwork from '@pi-network/sdk';

export class PiNetworkService {
  private pi: PiNetwork;
  private isInitialized = false;

  constructor() {
    this.pi = new PiNetwork({
      sandbox: process.env.NODE_ENV === 'development',
      apiKey: process.env.PI_API_KEY!,
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.pi.init();
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
      const user = await this.pi.authenticate(scopes);
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
      });
      return payment;
    } catch (error) {
      console.error('Pi Network payment creation failed:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const payment = await this.pi.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('Failed to get Pi payment:', error);
      throw error;
    }
  }

  async completePayment(paymentId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.pi.completePayment(paymentId);
    } catch (error) {
      console.error('Failed to complete Pi payment:', error);
      throw error;
    }
  }
}

export const piNetworkService = new PiNetworkService();
