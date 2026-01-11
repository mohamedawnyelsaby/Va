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

export class PiNetworkClient {
  private static initialized = false;

  static init() {
    if (typeof window === 'undefined' || this.initialized) return;

    if (!window.Pi) {
      console.warn('Pi SDK not available. Make sure you are in Pi Browser.');
      return;
    }

    window.Pi.init({
      version: '2.0',
      sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true',
    });

    this.initialized = true;
  }

  static async authenticate(scopes: string[] = ['username', 'payments']) {
    this.init();

    if (!window.Pi) {
      throw new Error('Pi SDK not available');
    }

    try {
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log('Incomplete payment found:', payment);
      });

      return {
        accessToken: auth.accessToken,
        userId: auth.user.uid,
        username: auth.user.username,
      };
    } catch (error) {
      console.error('Pi authentication failed:', error);
      throw error;
    }
  }

  static async createPayment(
    amount: number,
    memo: string,
    metadata: Record<string, any>
  ): Promise<string> {
    this.init();

    if (!window.Pi) {
      throw new Error('Pi SDK not available');
    }

    return new Promise((resolve, reject) => {
      window.Pi!.createPayment(
        {
          amount,
          memo,
          metadata,
        },
        {
          onReadyForServerApproval: (paymentId) => {
            console.log('Payment ready for approval:', paymentId);
            resolve(paymentId);
          },
          onReadyForServerCompletion: (paymentId, txid) => {
            console.log('Payment completed:', paymentId, txid);
          },
          onCancel: (paymentId) => {
            console.log('Payment cancelled:', paymentId);
            reject(new Error('Payment cancelled by user'));
          },
          onError: (error) => {
            console.error('Payment error:', error);
            reject(error);
          },
        }
      );
    });
  }

  static share(title: string, message: string) {
    this.init();

    if (!window.Pi) {
      console.warn('Pi SDK not available for sharing');
      return;
    }

    window.Pi.openShareDialog(title, message);
  }

  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Pi;
  }
}
