// src/components/payment/payment-methods.tsx
'use client';

import { useState } from 'react';
import { CreditCard, Pi, Paypal, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { piNetworkService } from '@/lib/pi-network/service';

interface PaymentMethodsProps {
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentMethods({ amount, currency, onSuccess, onError }: PaymentMethodsProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'pi_network') {
        await handlePiPayment();
      } else if (paymentMethod === 'credit_card') {
        await handleStripePayment();
      } else if (paymentMethod === 'paypal') {
        await handlePayPalPayment();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePiPayment = async () => {
    try {
      const payment = await piNetworkService.createPayment({
        amount,
        memo: `Va Travel Booking - ${new Date().toLocaleDateString()}`,
        metadata: {
          type: 'booking',
          amount,
          currency
        }
      });

      // Show Pi Network payment interface
      await piNetworkService.completePayment(payment.identifier);

      onSuccess(payment.identifier);
      
      toast({
        title: 'Payment Successful',
        description: 'Pi Network payment completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Pi Network payment failed. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleStripePayment = async () => {
    // Implement Stripe payment
    toast({
      title: 'Coming Soon',
      description: 'Credit card payments will be available soon',
    });
  };

  const handlePayPalPayment = async () => {
    // Implement PayPal payment
    toast({
      title: 'Coming Soon',
      description: 'PayPal payments will be available soon',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-3 border p-4 rounded-lg">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex-1 flex items-center cursor-pointer">
              <CreditCard className="mr-3 h-5 w-5" />
              <div>
                <div className="font-medium">Credit Card</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border p-4 rounded-lg">
            <RadioGroupItem value="pi_network" id="pi_network" />
            <Label htmlFor="pi_network" className="flex-1 flex items-center cursor-pointer">
              <Pi className="mr-3 h-5 w-5 text-pi" />
              <div>
                <div className="font-medium">Pi Network</div>
                <div className="text-sm text-gray-500">Pay with Pi cryptocurrency</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border p-4 rounded-lg">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex-1 flex items-center cursor-pointer">
              <Paypal className="mr-3 h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">PayPal</div>
                <div className="text-sm text-gray-500">Pay with your PayPal account</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border p-4 rounded-lg">
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex-1 flex items-center cursor-pointer">
              <Wallet className="mr-3 h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Digital Wallet</div>
                <div className="text-sm text-gray-500">Apple Pay, Google Pay</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {paymentMethod === 'credit_card' && (
          <div className="space-y-4">
            <Input placeholder="Card Number" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="MM/YY" />
              <Input placeholder="CVC" />
            </div>
            <Input placeholder="Cardholder Name" />
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex justify-between mb-4">
            <div className="text-gray-600">Subtotal</div>
            <div className="font-medium">{currency} {amount.toFixed(2)}</div>
          </div>
          <div className="flex justify-between mb-4">
            <div className="text-gray-600">Service Fee</div>
            <div className="font-medium">{currency} {(amount * 0.1).toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <div>Total</div>
            <div>{currency} {(amount * 1.1).toFixed(2)}</div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing...' : `Pay ${currency} ${(amount * 1.1).toFixed(2)}`}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Your payment is secure and encrypted
        </p>
      </CardContent>
    </Card>
  );
}
