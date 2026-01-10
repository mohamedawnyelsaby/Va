// src/lib/pi-network/client.ts
// ✅ Pi Network SDK Integration - FRONTEND
// المكتبة الرسمية: https://sdk.minepi.com/pi-sdk.js

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<AuthResult>;
      createPayment: (
        paymentData: PaymentData,
        callbacks: PaymentCallbacks
      ) => Promise<PaymentDTO>;
      openShareDialog: (title: string, message: string) => Promise<void>;
      openUrlInSystemBrowser: (url: string) => Promise<void>;
    };
  }
}

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: 'Pi Network' | 'Pi Testnet';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction?: {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

class PiNetworkClient {
  private static instance: PiNetworkClient;
  private initialized = false;
  private authResult: AuthResult | null = null;

  private constructor() {}

  static getInstance(): PiNetworkClient {
    if (!PiNetworkClient.instance) {
      PiNetworkClient.instance = new PiNetworkClient();
    }
    return PiNetworkClient.instance;
  }

  /**
   * Initialize Pi SDK
   * Call this in _app.tsx or layout.tsx
   */
  initialize(sandbox: boolean = false): void {
    if (this.initialized) return;

    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({
        version: '2.0',
        sandbox,
      });
      this.initialized = true;
      console.log('✅ Pi SDK initialized');
    } else {
      console.error('❌ Pi SDK not loaded. Add script tag to HTML.');
    }
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticate(scopes: string[] = ['username', 'payments', 'wallet_address']): Promise<AuthResult> {
    if (!this.initialized) {
      throw new Error('Pi SDK not initialized. Call initialize() first.');
    }

    try {
      const onIncompletePaymentFound = (payment: any) => {
        console.log('Incomplete payment found:', payment);
        // Handle incomplete payment - resume or cancel
      };

      this.authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('✅ Pi Authentication successful:', this.authResult.user.username);
      return this.authResult;
    } catch (error) {
      console.error('❌ Pi Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Create a payment request
   */
  async createPayment(
    amount: number,
    memo: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentDTO> {
    if (!this.authResult) {
      throw new Error('User not authenticated. Call authenticate() first.');
    }

    const paymentData: PaymentData = {
      amount,
      memo,
      metadata,
    };

    const callbacks: PaymentCallbacks = {
      onReadyForServerApproval: (paymentId) => {
        console.log('Payment ready for approval:', paymentId);
        // Send to your backend for approval
        this.approvePayment(paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log('Payment ready for completion:', paymentId, txid);
        // Send to your backend for completion
        this.completePayment(paymentId, txid);
      },
      onCancel: (paymentId) => {
        console.log('Payment cancelled:', paymentId);
      },
      onError: (error, payment) => {
        console.error('Payment error:', error, payment);
      },
    };

    try {
      const payment = await window.Pi.createPayment(paymentData, callbacks);
      console.log('✅ Payment created:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Approve payment on server
   */
  private async approvePayment(paymentId: string): Promise<void> {
    try {
      const response = await fetch('/api/pi/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        throw new Error('Payment approval failed');
      }

      console.log('✅ Payment approved');
    } catch (error) {
      console.error('❌ Payment approval failed:', error);
      throw error;
    }
  }

  /**
   * Complete payment on server
   */
  private async completePayment(paymentId: string, txid: string): Promise<void> {
    try {
      const response = await fetch('/api/pi/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid }),
      });

      if (!response.ok) {
        throw new Error('Payment completion failed');
      }

      console.log('✅ Payment completed');
    } catch (error) {
      console.error('❌ Payment completion failed:', error);
      throw error;
    }
  }

  /**
   * Share content via Pi Browser
   */
  async share(title: string, message: string): Promise<void> {
    try {
      await window.Pi.openShareDialog(title, message);
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  /**
   * Open URL in system browser
   */
  async openUrl(url: string): Promise<void> {
    try {
      await window.Pi.openUrlInSystemBrowser(url);
    } catch (error) {
      console.error('Open URL failed:', error);
    }
  }

  /**
   * Get authenticated user
   */
  getUser(): AuthResult['user'] | null {
    return this.authResult?.user || null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.authResult?.accessToken || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authResult;
  }

  /**
   * Sign out
   */
  signOut(): void {
    this.authResult = null;
    console.log('✅ Signed out from Pi');
  }
}

// Export singleton instance
export const piClient = PiNetworkClient.getInstance();

// Export for React hooks
export const usePiNetwork = () => {
  return {
    initialize: () => piClient.initialize(process.env.NODE_ENV === 'development'),
    authenticate: () => piClient.authenticate(),
    createPayment: (amount: number, memo: string, metadata?: Record<string, any>) =>
      piClient.createPayment(amount, memo, metadata),
    share: (title: string, message: string) => piClient.share(title, message),
    openUrl: (url: string) => piClient.openUrl(url),
    getUser: () => piClient.getUser(),
    getAccessToken: () => piClient.getAccessToken(),
    isAuthenticated: () => piClient.isAuthenticated(),
    signOut: () => piClient.signOut(),
  };
};
