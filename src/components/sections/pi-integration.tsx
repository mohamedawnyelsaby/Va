'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pi, Zap, Shield, TrendingUp } from 'lucide-react';

export function PiIntegration({ locale }: { locale: string }) {
  return (
    <section className="py-20 bg-gradient-to-br from-pi/10 to-pi/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pi/20 px-4 py-2 rounded-full mb-4">
              <Pi className="h-5 w-5 text-pi" />
              <span className="text-pi font-semibold">Pi Network Integration</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Pay with Pi Network Cryptocurrency
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Be part of the future of travel payments. Use Pi cryptocurrency for bookings 
              and earn rewards with every transaction.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <Zap className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Transactions</h4>
                  <p className="text-sm text-muted-foreground">
                    Lightning-fast payments with minimal fees
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <Shield className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">
                    Blockchain-powered security for your peace of mind
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-pi/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pi" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Get Pi cashback on every booking you make
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-pi hover:bg-pi-dark text-white">
              <Pi className="mr-2 h-5 w-5" />
              Connect Pi Wallet
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pi/20 to-transparent rounded-3xl blur-3xl" />
            <Card className="relative">
              <CardHeader>
                <CardTitle>Pi Rewards Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Hotel Bookings</p>
                    <p className="font-bold">2% Pi Cashback</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Attractions</p>
                    <p className="font-bold">1.5% Pi Cashback</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Write Reviews</p>
                    <p className="font-bold">+1 Pi per review</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>

                <div className="flex justify-between items-center p-4 bg-pi/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Referrals</p>
                    <p className="font-bold">+10 Pi per friend</p>
                  </div>
                  <Pi className="h-8 w-8 text-pi" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
