import axios from 'axios';

const PI_API_URL = process.env.PI_SANDBOX === 'true' 
  ? 'https://api.minepi.com'
  : 'https://api.minepi.com';

const PI_API_KEY = process.env.PI_API_KEY;

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

export class PiBackend {
  static async verifyToken(accessToken: string): Promise<PiUser> {
    try {
      const response = await axios.get(`${PI_API_URL}/v2/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to verify Pi token:', error);
      throw new Error('Invalid Pi access token');
    }
  }

  static async approvePayment(paymentId: string): Promise<void> {
    try {
      await axios.post(
        `${PI_API_URL}/v2/payments/${paymentId}/approve`,
        {},
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to approve payment:', error);
      throw new Error('Payment approval failed');
    }
  }

  static async completePayment(
    paymentId: string,
    txid: string
  ): Promise<void> {
    try {
      await axios.post(
        `${PI_API_URL}/v2/payments/${paymentId}/complete`,
        { txid },
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to complete payment:', error);
      throw new Error('Payment completion failed');
    }
  }

  static async cancelPayment(paymentId: string): Promise<void> {
    try {
      await axios.post(
        `${PI_API_URL}/v2/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      throw new Error('Payment cancellation failed');
    }
  }

  static async getPayment(paymentId: string): Promise<PiPayment> {
    try {
      const response = await axios.get(
        `${PI_API_URL}/v2/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get payment:', error);
      throw new Error('Failed to retrieve payment details');
    }
  }

  static async getIncompletePayment(
    paymentId: string
  ): Promise<PiPayment | null> {
    try {
      const payment = await this.getPayment(paymentId);

      if (
        !payment.status.developer_completed &&
        !payment.status.cancelled
      ) {
        return payment;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  static async createA2UPayment(
    userId: string,
    amount: number,
    memo: string,
    metadata: Record<string, any>
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${PI_API_URL}/v2/payments`,
        {
          payment: {
            amount,
            memo,
            metadata,
            uid: userId,
          },
        },
        {
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.identifier;
    } catch (error) {
      console.error('Failed to create A2U payment:', error);
      throw new Error('A2U payment creation failed');
    }
  }
}
