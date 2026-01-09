'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PiNetwork } from '@minepi/minepi-sdk';
import { useToast } from '@/components/ui/use-toast';

interface PiContextType {
  pi: PiNetwork | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  makePayment: (amount: number, memo: string) => Promise<any>;
  checkPayment: (paymentId: string) => Promise<any>;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

interface PiProviderProps {
  children: ReactNode;
}

export function PiProvider({ children }: PiProviderProps) {
  const [pi, setPi] = useState<PiNetwork | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const initializePi = async () => {
      try {
        const piNetwork = new PiNetwork({
          apiKey: process.env.NEXT_PUBLIC_PI_API_KEY || '',
          sandbox: process.env.NODE_ENV === 'development',
        });

        await piNetwork.init();
        setPi(piNetwork);
        setIsInitialized(true);

        // Check if user is already authenticated
        const auth = piNetwork.auth();
        if (auth.isAuthenticated()) {
          const user = auth.user();
          setUser(user);
          setIsAuthenticated(true);

          // Get user balance
          const wallet = piNetwork.wallet();
          const userBalance = await wallet.getBalance();
          setBalance(userBalance);
        }
      } catch (error) {
        console.error('Failed to initialize Pi Network:', error);
        toast({
          title: 'Pi Network Error',
          description: 'Failed to initialize Pi Network SDK. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initializePi();
  }, [toast]);

  const connect = async () => {
    if (!pi) {
      toast({
        title: 'Pi Network Not Initialized',
        description: 'Please wait for Pi Network to initialize.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const auth = pi.auth();
      await auth.authenticate(['username', 'payments', 'wallet_address']);

      const user = auth.user();
      setUser(user);
      setIsAuthenticated(true);

      // Get user balance
      const wallet = pi.wallet();
      const userBalance = await wallet.getBalance();
      setBalance(userBalance);

      toast({
        title: 'Pi Network Connected',
        description: 'Successfully connected to Pi Network wallet.',
      });
    } catch (error) {
      console.error('Failed to connect to Pi Network:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Pi Network. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const disconnect = async () => {
    if (!pi) return;

    try {
      const auth = pi.auth();
      await auth.logout();

      setUser(null);
      setIsAuthenticated(false);
      setBalance(0);

      toast({
        title: 'Pi Network Disconnected',
        description: 'Successfully disconnected from Pi Network.',
      });
    } catch (error) {
      console.error('Failed to disconnect from Pi Network:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Pi Network.',
        variant: 'destructive',
      });
    }
  };

  const makePayment = async (amount: number, memo: string) => {
    if (!pi || !isAuthenticated) {
      throw new Error('Pi Network not connected');
    }

    try {
      const payments = pi.payments();
      const payment = await payments.createPayment({
        amount,
        memo,
        metadata: { timestamp: Date.now() },
      });

      toast({
        title: 'Payment Created',
        description: 'Please approve the payment in your Pi Network app.',
      });

      return payment;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  };

  const checkPayment = async (paymentId: string) => {
    if (!pi) {
      throw new Error('Pi Network not initialized');
    }

    try {
      const payments = pi.payments();
      const payment = await payments.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('Failed to check payment:', error);
      throw error;
    }
  };

  const value: PiContextType = {
    pi,
    isInitialized,
    isAuthenticated,
    user,
    balance,
    connect,
    disconnect,
    makePayment,
    checkPayment,
  };

  return <PiContext.Provider value={value}>{children}</PiContext.Provider>;
}

export const usePi = () => {
  const context = useContext(PiContext);
  if (context === undefined) {
    throw new Error('usePi must be used within a PiProvider');
  }
  return context;
};
