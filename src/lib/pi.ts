export async function initPi() {
  if (typeof window === 'undefined') return;
  if (!window.Pi) return;

  await window.Pi.init({
    version: '2.0',
    sandbox: true
  });
}

export async function loginWithPi() {
  if (!window.Pi) throw new Error('Pi SDK not found');

  const scopes = ['username', 'payments'];
  const auth = await window.Pi.authenticate(scopes);

  return auth;
}

export async function payWithPi(amount: number, memo: string) {
  if (!window.Pi) throw new Error('Pi SDK not found');

  return await window.Pi.createPayment({
    amount,
    memo
  });
}
