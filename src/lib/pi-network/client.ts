// src/lib/pi-network/client.ts
// Complete Pi Network Frontend SDK Integration

import { logger } from '@/lib/logger';
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<{
        accessToken: string;
        user: {
          uid: string;
          username: string;
        };
      }>;
      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, any>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
      openShareDialog: (title: string, message: string) => void;
    };
  }
}

export interface PiAuthResult {
  accessToken: string;
  userId: string;
  username: string;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export class PiNetworkClient {
  private static initialized = false;
  private static readonly SANDBOX = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
  private static readonly VERSION = '2.0';

  /**
   * Initialize Pi SDK
   */
  static init(): void {
    if (typeof window === 'undefined') {
      logger.warn('PiNetworkClient: Cannot initialize on server side');
      return;
    }

    if (this.initialized) {
      return;
    }

    if (!window.Pi) {
      logger.warn('Pi SDK not available. Make sure you are in Pi Browser and the SDK is loaded.');
      return;
    }

    try {
      window.Pi.init({
        version: this.VERSION,
        sandbox: this.SANDBOX,
      });

      this.initialized = true;
      logger.log(`✅ Pi Network SDK initialized (${this.SANDBOX ? 'SANDBOX' : 'PRODUCTION'} mode)`);
    } catch (error) {
      logger.error('Failed to initialize Pi SDK:', error);
    }
  }

  /**
   * Check if Pi SDK is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Pi;
  }

  /**
   * Authenticate user with Pi Network
   */
  static async authenticate(
    scopes: string[] = ['username', 'payments']
  ): Promise<PiAuthResult> {
    this.init();

    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please open this app in Pi Browser.');
    }

    try {
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        logger.log('📝 Incomplete payment found:', payment);
        // Handle incomplete payment if needed
      });

      return {
        accessToken: auth.accessToken,
        userId: auth.user.uid,
        username: auth.user.username,
      };
    } catch (error) {
      logger.error('Pi authentication failed:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to authenticate with Pi Network'
      );
    }
  }

  /**
   * Create a Pi Network payment
   */
  static async createPayment(
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ): Promise<void> {
    this.init();

    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please open this app in Pi Browser.');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!paymentData.memo) {
      throw new Error('Payment memo is required');
    }

    return new Promise((resolve, reject) => {
      window.Pi!.createPayment(
        {
          amount: paymentData.amount,
          memo: paymentData.memo,
          metadata: paymentData.metadata || {},
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            logger.log('✅ Payment ready for server approval:', paymentId);
            try {
              await callbacks.onReadyForServerApproval(paymentId);
              resolve();
            } catch (error) {
              logger.error('Server approval failed:', error);
              reject(error);
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            logger.log('✅ Payment ready for server completion:', paymentId, txid);
            try {
              await callbacks.onReadyForServerCompletion(paymentId, txid);
            } catch (error) {
              logger.error('Server completion failed:', error);
            }
          },
          onCancel: (paymentId) => {
            logger.log('❌ Payment cancelled:', paymentId);
            callbacks.onCancel(paymentId);
            reject(new Error('Payment cancelled by user'));
          },
          onError: (error, payment) => {
            logger.error('❌ Payment error:', error, payment);
            callbacks.onError(error, payment);
            reject(error);
          },
        }
      );
    });
  }

  /**
   * Share content via Pi Network
   */
  static share(title: string, message: string): void {
    this.init();

    if (!window.Pi) {
      logger.warn('Pi SDK not available for sharing');
      return;
    }

    try {
      window.Pi.openShareDialog(title, message);
    } catch (error) {
      logger.error('Failed to open share dialog:', error);
    }
  }

  /**
   * Get Pi Network environment
   */
  static getEnvironment(): 'sandbox' | 'production' {
    return this.SANDBOX ? 'sandbox' : 'production';
  }

  /**
   * Check if running in sandbox mode
   */
  static isSandbox(): boolean {
    return this.SANDBOX;
  }
}

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined' && window.Pi) {
  PiNetworkClient.init();
}
