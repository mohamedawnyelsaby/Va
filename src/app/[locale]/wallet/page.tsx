'use client';
import { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pi, History, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function WalletPage() {
  const { isAvailable, isAuthenticated, user, authenticate, paymentHistory, activePayment } = usePi();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try { await authenticate(['username', 'payments']); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const NotAvailable = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 pb-8 text-center">
          <Pi className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-2">Pi Browser Required</h2>
          <p className="text-muted-foreground">Please open Va Travel in Pi Browser.</p>
        </CardContent>
      </Card>
    </div>
  );

  const NotLoggedIn = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 pb-8 text-center">
          <Pi className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-4">Connect Pi Wallet</h2>
          <Button onClick={handleLogin} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
            <Pi className="mr-2 h-5 w-5" />{loading ? 'Connecting...' : 'Login with Pi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Pi Wallet</h1>
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-yellow-500 flex items-center justify-center">
                <Pi className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{user?.username}</p>
                <p className="text-sm text-muted-foreground">Pi Network User</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Payment History</CardTitle></CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No payments yet</p>
              </div>
            ) : paymentHistory.map((p) => (
              <div key={p.identifier} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {p.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-500" /> : p.status === 'cancelled' ? <XCircle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-yellow-500" />}
                  <div>
                    <p className="font-medium">{p.memo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-bold text-yellow-600">pi {p.amount}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
