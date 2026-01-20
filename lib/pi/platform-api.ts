// ============================================
// PI NETWORK PLATFORM API - PRODUCTION READY
// Complete server-side Pi Platform integration
// ============================================
// Path: lib/pi/platform-api.ts
// ============================================

import crypto from 'crypto';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// ============================================
// CONFIGURATION
// ============================================

const PI_API_URL = process.env.PI_SANDBOX === 'true'
  ? 'https://api.minepi.com'
  : 'https://api.minepi.com';

const PI_API_KEY = process.env.PI_API_KEY;
const PI_SECRET = process.env.PI_SECRET_KEY;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================
// TYPES
// ============================================

interface PiUser {
  uid: string;
  username: string;
}

interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
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
  created_at: string;
}

interface PiApiError {
  error: {
    message: string;
    type: string;
  };
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

/**
 * Verify Pi Network webhook signature
 * Uses HMAC SHA-256 for secure verification
 */
export function verifyPiSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!PI_SECRET) {
      console.error('❌ PI_SECRET not configured');
      return false;
    }

    // Create payload: timestamp.body
    const payload = `${timestamp}.${body}`;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', PI_SECRET)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

// ============================================
// HTTP CLIENT WITH RETRY LOGIC
// ============================================

/**
 * Make HTTP request with automatic retry on failure
 */
async function makeRequest<T>(
  config: AxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      console.log(`⚠️ Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      
      // Exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      await sleep(delay);
      
      return makeRequest<T>(config, retries - 1);
    }
    
    throw handleApiError(error);
  }
}

/**
 * Check if error is retryable
 */
function shouldRetry(error: any): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  
  // Retry on network errors
  if (!error.response) {
    return true;
  }
  
  // Retry on 5xx errors and 429 (rate limit)
  const status = error.response.status;
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Handle API errors
 */
function handleApiError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<PiApiError>;
    
    if (axiosError.response?.data?.error) {
      const piError = axiosError.response.data.error;
      return new Error(`Pi API Error: ${piError.message} (${piError.type})`);
    }
    
    if (axiosError.response) {
      return new Error(
        `Pi API Error: ${axiosError.response.status} ${axiosError.response.statusText}`
      );
    }
    
    if (axiosError.request) {
      return new Error('Pi API Error: No response received');
    }
  }
  
  return error instanceof Error ? error : new Error('Unknown error');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// USER VERIFICATION
// ============================================

/**
 * Verify Pi user authentication token
 * Returns user data if token is valid
 */
export async function verifyPiUser(accessToken: string): Promise<PiUser> {
  console.log('🔐 Verifying Pi user token...');
  
  try {
    const user = await makeRequest<PiUser>({
      method: 'GET',
      url: `${PI_API_URL}/v2/me`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log(`✅ User verified: ${user.username}`);
    return user;
  } catch (error) {
    console.error('❌ User verification failed:', error);
    throw new Error('Failed to verify Pi user token');
  }
}

// ============================================
// PAYMENT MANAGEMENT
// ============================================

/**
 * Get payment details from Pi Platform
 */
export async function getPayment(paymentId: string): Promise<PiPayment> {
  console.log(`📋 Fetching payment: ${paymentId}`);
  
  if (!PI_API_KEY) {
    throw new Error('PI_API_KEY not configured');
  }
  
  try {
    const payment = await makeRequest<PiPayment>({
      method: 'GET',
      url: `${PI_API_URL}/v2/payments/${paymentId}`,
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
      },
    });
    
    console.log(`✅ Payment fetched: ${payment.identifier}`);
    return payment;
  } catch (error) {
    console.error(`❌ Failed to fetch payment:`, error);
    throw new Error(`Failed to get payment: ${paymentId}`);
  }
}

/**
 * Approve payment on Pi Platform
 * Must be called before payment can be completed
 */
export async function approvePayment(paymentId: string): Promise<void> {
  console.log(`✅ Approving payment: ${paymentId}`);
  
  if (!PI_API_KEY) {
    throw new Error('PI_API_KEY not configured');
  }
  
  try {
    await makeRequest({
      method: 'POST',
      url: `${PI_API_URL}/v2/payments/${paymentId}/approve`,
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
      },
    });
    
    console.log(`✅ Payment approved successfully`);
  } catch (error) {
    console.error(`❌ Failed to approve payment:`, error);
    throw new Error(`Failed to approve payment: ${paymentId}`);
  }
}

/**
 * Complete payment on Pi Platform
 * Called after transaction is verified on blockchain
 */
export async function completePayment(
  paymentId: string,
  txid: string
): Promise<void> {
  console.log(`🎉 Completing payment: ${paymentId}`);
  console.log(`⛓️ Transaction ID: ${txid}`);
  
  if (!PI_API_KEY) {
    throw new Error('PI_API_KEY not configured');
  }
  
  try {
    await makeRequest({
      method: 'POST',
      url: `${PI_API_URL}/v2/payments/${paymentId}/complete`,
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: { txid },
    });
    
    console.log(`✅ Payment completed successfully`);
  } catch (error) {
    console.error(`❌ Failed to complete payment:`, error);
    throw new Error(`Failed to complete payment: ${paymentId}`);
  }
}

/**
 * Cancel payment on Pi Platform
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  console.log(`❌ Cancelling payment: ${paymentId}`);
  
  if (!PI_API_KEY) {
    throw new Error('PI_API_KEY not configured');
  }
  
  try {
    await makeRequest({
      method: 'POST',
      url: `${PI_API_URL}/v2/payments/${paymentId}/cancel`,
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
      },
    });
    
    console.log(`✅ Payment cancelled successfully`);
  } catch (error) {
    console.error(`❌ Failed to cancel payment:`, error);
    throw new Error(`Failed to cancel payment: ${paymentId}`);
  }
}

/**
 * Get incomplete payment for user
 * Used to find and complete interrupted payments
 */
export async function getIncompletePayment(
  paymentId: string
): Promise<PiPayment | null> {
  try {
    const payment = await getPayment(paymentId);
    
    // Check if payment is incomplete
    if (
      !payment.status.developer_completed &&
      !payment.status.cancelled &&
      !payment.status.user_cancelled
    ) {
      return payment;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get incomplete payment:', error);
    return null;
  }
}

// ============================================
// A2U PAYMENTS (APP TO USER)
// ============================================

/**
 * Create App-to-User payment
 * Used for refunds or rewards
 */
export async function createA2UPayment(
  userId: string,
  amount: number,
  memo: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  console.log(`💸 Creating A2U payment to user: ${userId}`);
  console.log(`💰 Amount: ${amount} Pi`);
  
  if (!PI_API_KEY) {
    throw new Error('PI_API_KEY not configured');
  }
  
  try {
    const response = await makeRequest<{ identifier: string }>({
      method: 'POST',
      url: `${PI_API_URL}/v2/payments`,
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        payment: {
          amount,
          memo,
          metadata,
          uid: userId,
        },
      },
    });
    
    console.log(`✅ A2U payment created: ${response.identifier}`);
    return response.identifier;
  } catch (error) {
    console.error('❌ Failed to create A2U payment:', error);
    throw new Error('Failed to create App-to-User payment');
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}

/**
 * Validate memo
 */
export function validateMemo(memo: string): boolean {
  return memo.length > 0 && memo.length <= 200;
}

/**
 * Check if Pi API is configured
 */
export function isPiConfigured(): boolean {
  return !!(PI_API_KEY && PI_SECRET);
}

/**
 * Get Pi environment
 */
export function getPiEnvironment(): 'production' | 'sandbox' {
  return process.env.PI_SANDBOX === 'true' ? 'sandbox' : 'production';
}

// ============================================
// EXPORTS
// ============================================

export type { PiUser, PiPayment, PiApiError };
