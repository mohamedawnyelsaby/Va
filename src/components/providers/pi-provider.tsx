// src/components/providers/pi-provider.tsx
'use client';

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  useRef,
  ReactNode 
} from 'react';

// ============================================
// Types & Interfaces
// ============================================

interface PiUser {
  uid: string;
  username: string;
  accessToken?: string;
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

interface PiPayment {
  identifier: string;
  amount: number;
  memo: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'failed';
  createdAt: Date;
  txid?: string;
}

type PiSDKStatus = 
  | 'initializing'
  | 'available'
  | 'unavailable'
  | 'error';

interface PiContextType {
  // Status
  sdkStatus: PiSDKStatus;
  isAvailable: boolean;
  isInitialized: boolean;
  isSandbox: boolean;
  
  // User
  isAuthenticated: boolean;
  user: PiUser | null;
  
  // Payments
  activePayment: PiPayment | null;
  paymentHistory: PiPayment[];
  
  // Methods
  authenticate: (scopes?: string[]) => Promise<PiUser>;
  logout: () => void;
  createPayment: (data: PiPaymentData, callbacks: PiPaymentCallbacks) => Promise<void>;
  getPaymentStatus: (paymentId: string) => Promise<any>;
  
  // Utils
  share: (title: string, message: string) => void;
  openShareDialog: (title: string, message: string) => void;
}

// ============================================
// Security Constants
// ============================================

const SECURITY_CONFIG = {
  MAX_PAYMENT_AMOUNT: 1000000, // Maximum Pi amount allowed
  MIN_PAYMENT_AMOUNT: 0.01, // Minimum Pi amount
  MAX_MEMO_LENGTH: 200,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PAYMENT_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 10,
};

// ============================================
// Security Utilities
// ============================================

class SecurityManager {
  private requestTimestamps: number[] = [];
  private paymentAttempts: Map<string, number> = new Map();

  // Rate limiting
  checkRateLimit(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < SECURITY_CONFIG.RATE_LIMIT_WINDOW
    );

    if (this.requestTimestamps.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      console.warn('🚫 Rate limit exceeded');
      return false;
    }

    this.requestTimestamps.push(now);
    return true;
  }

  // Validate payment data
  validatePaymentData(data: PiPaymentData): { valid: boolean; error?: string } {
    // Amount validation
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      return { valid: false, error: 'Amount must be a valid number' };
    }

    if (data.amount < SECURITY_CONFIG.MIN_PAYMENT_AMOUNT) {
      return { valid: false, error: `Minimum payment is ${SECURITY_CONFIG.MIN_PAYMENT_AMOUNT} Pi` };
    }

    if (data.amount > SECURITY_CONFIG.MAX_PAYMENT_AMOUNT) {
      return { valid: false, error: `Maximum payment is ${SECURITY_CONFIG.MAX_PAYMENT_AMOUNT} Pi` };
    }

    // Memo validation
    if (!data.memo || typeof data.memo !== 'string') {
      return { valid: false, error: 'Memo is required' };
    }

    const cleanMemo = data.memo.trim();
    if (cleanMemo.length === 0) {
      return { valid: false, error: 'Memo cannot be empty' };
    }

    if (cleanMemo.length > SECURITY_CONFIG.MAX_MEMO_LENGTH) {
      return { valid: false, error: `Memo too long (max ${SECURITY_CONFIG.MAX_MEMO_LENGTH} characters)` };
    }

    // Check for malicious content
    if (this.containsMaliciousContent(cleanMemo)) {
      return { valid: false, error: 'Invalid memo content' };
    }

    // Metadata validation
    if (data.metadata) {
      try {
        const metadataStr = JSON.stringify(data.metadata);
        if (metadataStr.length > 1000) {
          return { valid: false, error: 'Metadata too large' };
        }
      } catch {
        return { valid: false, error: 'Invalid metadata format' };
      }
    }

    return { valid: true };
  }

  // Check for malicious content
  private containsMaliciousContent(text: string): boolean {
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /eval\(/gi,
    ];

    return maliciousPatterns.some(pattern => pattern.test(text));
  }

  // Track payment attempts to prevent abuse
  canAttemptPayment(userId: string): boolean {
    const attempts = this.paymentAttempts.get(userId) || 0;
    if (attempts >= SECURITY_CONFIG.MAX_RETRY_ATTEMPTS) {
      console.warn('🚫 Maximum payment attempts reached');
      return false;
    }
    return true;
  }

  incrementPaymentAttempts(userId: string): void {
    const current = this.paymentAttempts.get(userId) || 0;
    this.paymentAttempts.set(userId, current + 1);
    
    // Reset after timeout
    setTimeout(() => {
      this.paymentAttempts.delete(userId);
    }, SECURITY_CONFIG.RATE_LIMIT_WINDOW);
  }

  // Sanitize user input
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .substring(0, 500); // Limit length
  }
}

// ============================================
// Context
// ============================================

const PiContext = createContext<PiContextType | null>(null);

// ============================================
// Provider Component
// ============================================

export function PiProvider({ children }: { children: ReactNode }) {
  // State
  const [sdkStatus, setSdkStatus] = useState<PiSDKStatus>('initializing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [activePayment, setActivePayment] = useState<PiPayment | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PiPayment[]>([]);
  
  // Refs
  const initializationAttempts = useRef(0);
  const maxInitAttempts = 5;
  const sdkCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const securityManager = useRef(new SecurityManager());
  const paymentTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ============================================
  // SDK Initialization
  // ============================================

  useEffect(() => {
    let mounted = true;

    const initializePiSDK = () => {
      if (!mounted) return;

      // Check if we're in browser
      if (typeof window === 'undefined') {
        setSdkStatus('unavailable');
        return;
      }

      // Check if Pi SDK exists
      const Pi = (window as any).Pi;
      
      if (!Pi) {
        initializationAttempts.current++;
        
        if (initializationAttempts.current >= maxInitAttempts) {
          console.warn('⚠️ Pi SDK not available after multiple attempts');
          console.warn('💡 This app needs to be opened in Pi Browser');
          setSdkStatus('unavailable');
          if (sdkCheckInterval.current) {
            clearInterval(sdkCheckInterval.current);
          }
          return;
        }

        console.log(`⏳ Waiting for Pi SDK... (Attempt ${initializationAttempts.current}/${maxInitAttempts})`);
        return;
      }

      // Pi SDK is available!
      try {
        const isSandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
        
        Pi.init({ 
          version: "2.0",
          sandbox: isSandbox
        });

        setSdkStatus('available');
        console.log('✅ Pi Network SDK initialized successfully');
        console.log(`🌍 Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);

        // Clear interval once initialized
        if (sdkCheckInterval.current) {
          clearInterval(sdkCheckInterval.current);
        }

        // Try to restore session if exists
        restoreSession();

      } catch (error) {
        console.error('❌ Pi SDK initialization failed:', error);
        setSdkStatus('error');
      }
    };

    // Initial check
    initializePiSDK();

    // Set up interval to keep checking
    sdkCheckInterval.current = setInterval(initializePiSDK, 500);

    // Cleanup
    return () => {
      mounted = false;
      if (sdkCheckInterval.current) {
        clearInterval(sdkCheckInterval.current);
      }
      // Clear all payment timeouts
      paymentTimeouts.current.forEach(timeout => clearTimeout(timeout));
      paymentTimeouts.current.clear();
    };
  }, []);

  // ============================================
  // Session Management (Secure)
  // ============================================

  const restoreSession = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('pi_user');
      const savedTimestamp = localStorage.getItem('pi_user_timestamp');
      
      if (!savedUser || !savedTimestamp) {
        return;
      }

      // Check session timeout
      const timestamp = parseInt(savedTimestamp, 10);
      if (Date.now() - timestamp > SECURITY_CONFIG.SESSION_TIMEOUT) {
        console.log('⏰ Session expired');
        clearSession();
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Validate user data structure
      if (!userData.uid || !userData.username) {
        console.warn('⚠️ Invalid session data');
        clearSession();
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ Session restored:', userData.username);
      
    } catch (error) {
      console.error('❌ Session restore failed:', error);
      clearSession();
    }
  }, []);

  const saveSession = useCallback((userData: PiUser) => {
    try {
      // Never store access token in localStorage for security
      const safeUserData = {
        uid: userData.uid,
        username: userData.username,
      };
      
      localStorage.setItem('pi_user', JSON.stringify(safeUserData));
      localStorage.setItem('pi_user_timestamp', Date.now().toString());
      
    } catch (error) {
      console.error('❌ Session save failed:', error);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem('pi_user');
      localStorage.removeItem('pi_user_timestamp');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('❌ Session clear failed:', error);
    }
  }, []);

  // ============================================
  // Authentication (Secure)
  // ============================================

  const authenticate = useCallback(async (scopes: string[] = ['username', 'payments']): Promise<PiUser> => {
    // Check rate limit
    if (!securityManager.current.checkRateLimit()) {
      throw new Error('Too many requests. Please wait a moment.');
    }

    if (sdkStatus !== 'available') {
      throw new Error('Pi SDK is not available. Please open this app in Pi Browser.');
    }

    const Pi = (window as any).Pi;
    if (!Pi) {
      throw new Error('Pi SDK not found');
    }

    try {
      console.log('🔐 Authenticating with Pi Network...');
      
      // Validate scopes
      const validScopes = ['username', 'payments', 'wallet_address'];
      const sanitizedScopes = scopes.filter(scope => validScopes.includes(scope));
      
      if (sanitizedScopes.length === 0) {
        throw new Error('Invalid authentication scopes');
      }

      const auth = await Pi.authenticate(sanitizedScopes, (payment: any) => {
        console.log('📦 Incomplete payment found during auth:', payment);
        handleIncompletePayment(payment);
      });

      // Validate authentication response
      if (!auth?.user?.uid || !auth?.user?.username) {
        throw new Error('Invalid authentication response');
      }

      const userData: PiUser = {
        uid: securityManager.current.sanitizeString(auth.user.uid),
        username: securityManager.current.sanitizeString(auth.user.username),
        accessToken: auth.accessToken, // Keep in memory only
      };

      setUser(userData);
      setIsAuthenticated(true);
      saveSession(userData);

      console.log('✅ Authentication successful:', userData.username);
      
      // Verify with backend (critical for security)
      try {
        const verifyResponse = await fetch('/api/auth/pi/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            accessToken: auth.accessToken,
            uid: userData.uid 
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Backend verification failed');
        }

        const verifyData = await verifyResponse.json();
        console.log('✅ Backend verification successful');
        
      } catch (error) {
        console.error('❌ Backend verification failed:', error);
        // In production, you might want to logout on verification failure
        // clearSession();
        // throw new Error('Authentication verification failed');
      }

      return userData;

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      clearSession();
      throw error;
    }
  }, [sdkStatus, saveSession, clearSession]);

  const logout = useCallback(() => {
    clearSession();
    setActivePayment(null);
    setPaymentHistory([]);
    console.log('👋 Logged out from Pi Network');
  }, [clearSession]);

  // ============================================
  // Payment Management (Secure)
  // ============================================

  const createPayment = useCallback(async (
    paymentData: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ): Promise<void> => {
    // Security checks
    if (!securityManager.current.checkRateLimit()) {
      throw new Error('Too many payment requests. Please wait.');
    }

    if (sdkStatus !== 'available') {
      throw new Error('Pi SDK is not available');
    }

    if (!isAuthenticated || !user) {
      throw new Error('Please authenticate first');
    }

    if (!securityManager.current.canAttemptPayment(user.uid)) {
      throw new Error('Too many payment attempts. Please try again later.');
    }

    const Pi = (window as any).Pi;
    if (!Pi) {
      throw new Error('Pi SDK not found');
    }

    // Validate payment data
    const validation = securityManager.current.validatePaymentData(paymentData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Sanitize inputs
    const sanitizedData: PiPaymentData = {
      amount: Number(paymentData.amount.toFixed(7)), // Pi has 7 decimals
      memo: securityManager.current.sanitizeString(paymentData.memo),
      metadata: paymentData.metadata,
    };

    try {
      console.log('💳 Creating payment...', sanitizedData);

      securityManager.current.incrementPaymentAttempts(user.uid);

      const payment: PiPayment = {
        identifier: '',
        amount: sanitizedData.amount,
        memo: sanitizedData.memo,
        status: 'pending',
        createdAt: new Date(),
      };

      setActivePayment(payment);

      // Set payment timeout
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Payment timeout');
        setActivePayment(prev => prev ? { ...prev, status: 'failed' } : null);
        callbacks.onError(new Error('Payment timeout'));
      }, SECURITY_CONFIG.PAYMENT_TIMEOUT);

      await Pi.createPayment(
        sanitizedData,
        {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('📝 Payment ready for server approval:', paymentId);
            
            // Validate payment ID
            if (!paymentId || typeof paymentId !== 'string') {
              throw new Error('Invalid payment ID');
            }

            setActivePayment(prev => prev ? { 
              ...prev, 
              identifier: paymentId, 
              status: 'pending' 
            } : null);

            try {
              // Critical: Server must approve before blockchain submission
              await callbacks.onReadyForServerApproval(paymentId);
              
              setActivePayment(prev => prev ? { 
                ...prev, 
                status: 'approved' 
              } : null);
              
              console.log('✅ Server approved payment');
              
            } catch (error) {
              console.error('❌ Server approval failed:', error);
              clearTimeout(timeoutId);
              paymentTimeouts.current.delete(paymentId);
              
              setActivePayment(prev => prev ? { 
                ...prev, 
                status: 'failed' 
              } : null);
              
              throw error;
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('⛓️ Payment ready for completion:', paymentId, txid);
            
            // Clear timeout
            clearTimeout(timeoutId);
            paymentTimeouts.current.delete(paymentId);

            // Validate transaction ID
            if (!txid || typeof txid !== 'string') {
              throw new Error('Invalid transaction ID');
            }
            
            try {
              // Critical: Server must complete and verify on blockchain
              await callbacks.onReadyForServerCompletion(paymentId, txid);
              
              const completedPayment: PiPayment = {
                identifier: paymentId,
                amount: sanitizedData.amount,
                memo: sanitizedData.memo,
                status: 'completed',
                createdAt: new Date(),
                txid,
              };

              setActivePayment(completedPayment);
              setPaymentHistory(prev => [completedPayment, ...prev]);
              
              console.log('✅ Payment completed successfully!');
              
              // Clear active payment after delay
              setTimeout(() => {
                setActivePayment(null);
              }, 5000);

            } catch (error) {
              console.error('❌ Server completion failed:', error);
              setActivePayment(prev => prev ? { 
                ...prev, 
                status: 'failed' 
              } : null);
              throw error;
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled by user:', paymentId);
            clearTimeout(timeoutId);
            paymentTimeouts.current.delete(paymentId);
            
            setActivePayment(prev => prev ? { 
              ...prev, 
              status: 'cancelled' 
            } : null);
            
            callbacks.onCancel(paymentId);
            
            setTimeout(() => {
              setActivePayment(null);
            }, 3000);
          },

          onError: (error: Error, payment?: any) => {
            console.error('💥 Payment error:', error, payment);
            clearTimeout(timeoutId);
            if (payment?.identifier) {
              paymentTimeouts.current.delete(payment.identifier);
            }
            
            setActivePayment(prev => prev ? { 
              ...prev, 
              status: 'failed' 
            } : null);
            
            callbacks.onError(error, payment);
            
            setTimeout(() => {
              setActivePayment(null);
            }, 5000);
          },
        }
      );

      paymentTimeouts.current.set(payment.identifier || 'temp', timeoutId);

    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      setActivePayment(null);
      throw error;
    }
  }, [sdkStatus, isAuthenticated, user]);

  // Handle incomplete payments
  const handleIncompletePayment = useCallback((payment: any) => {
    console.log('🔄 Handling incomplete payment:', payment);
    
    try {
      // Validate incomplete payment data
      if (!payment?.identifier || !payment?.amount) {
        console.warn('⚠️ Invalid incomplete payment data');
        return;
      }

      const incompletePayment: PiPayment = {
        identifier: payment.identifier,
        amount: Number(payment.amount),
        memo: payment.memo || 'Incomplete payment',
        status: 'pending',
        createdAt: payment.created_at ? new Date(payment.created_at) : new Date(),
      };

      setActivePayment(incompletePayment);
      setPaymentHistory(prev => {
        // Prevent duplicates
        if (prev.some(p => p.identifier === incompletePayment.identifier)) {
          return prev;
        }
        return [incompletePayment, ...prev];
      });
    } catch (error) {
      console.error('❌ Failed to handle incomplete payment:', error);
    }
  }, []);

  // Get payment status from server
  const getPaymentStatus = useCallback(async (paymentId: string) => {
    if (!paymentId || typeof paymentId !== 'string') {
      throw new Error('Invalid payment ID');
    }

    try {
      const response = await fetch(`/api/payments/pi/${encodeURIComponent(paymentId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch payment status`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      throw error;
    }
  }, []);

  // ============================================
  // Utility Functions
  // ============================================

  const share = useCallback((title: string, message: string) => {
    if (sdkStatus !== 'available') {
      console.warn('⚠️ Pi SDK not available for sharing');
      return;
    }

    const Pi = (window as any).Pi;
    if (!Pi?.openShareDialog) {
      console.warn('⚠️ Share dialog not available');
      return;
    }

    try {
      // Sanitize inputs
      const safeTitle = securityManager.current.sanitizeString(title);
      const safeMessage = securityManager.current.sanitizeString(message);
      
      Pi.openShareDialog(safeTitle, safeMessage);
      console.log('📤 Share dialog opened');
    } catch (error) {
      console.error('❌ Share failed:', error);
    }
  }, [sdkStatus]);

  const openShareDialog = share;

  // ============================================
  // Context Value
  // ============================================

  const value: PiContextType = {
    // Status
    sdkStatus,
    isAvailable: sdkStatus === 'available',
    isInitialized: sdkStatus !== 'initializing',
    isSandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true',
    
    // User
    isAuthenticated,
    user,
    
    // Payments
    activePayment,
    paymentHistory,
    
    // Methods
    authenticate,
    logout,
    createPayment,
    getPaymentStatus,
    
    // Utils
    share,
    openShareDialog,
  };

  return (
    <PiContext.Provider value={value}>
      {children}
    </PiContext.Provider>
  );
}

// ============================================
// Custom Hook
// ============================================

export function usePi() {
  const context = useContext(PiContext);
  
  if (!context) {
    throw new Error('usePi must be used within PiProvider');
  }
  
  return context;
}

// ============================================
// Helper Hooks
// ============================================

export function useIsPiAvailable() {
  const { isAvailable } = usePi();
  return isAvailable;
}

export function useIsPiAuthenticated() {
  const { isAuthenticated } = usePi();
  return isAuthenticated;
}

export function usePiUser() {
  const { user } = usePi();
  return user;
}

export function usePiPayment() {
  const { createPayment } = usePi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pay = useCallback(async (
    data: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await createPayment(data, {
        ...callbacks,
        onError: (err, payment) => {
          setError(err);
          callbacks.onError(err, payment);
        },
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createPayment]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { pay, isLoading, error, reset };
}

// ============================================
// Export Types
// ============================================

export type { 
  PiUser, 
  PiPaymentData, 
  PiPaymentCallbacks, 
  PiPayment,
  PiSDKStatus,
  PiContextType 
};
