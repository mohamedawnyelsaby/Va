import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@vatravel.com';

function baseTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
    .wrap{max-width:600px;margin:0 auto;background:#fff}
    .head{background:linear-gradient(135deg,#3b82f6,#a855f7);padding:30px;text-align:center;color:#fff}
    .body{padding:40px 30px}
    .foot{background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280}
    .btn{display:inline-block;padding:12px 30px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin:20px 0;font-weight:bold}
    .box{background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;margin:16px 0;border-radius:4px}
  </style></head>
  <body><div class="wrap">
    <div class="head"><h1 style="margin:0">🌍 Va Travel</h1><p style="margin:8px 0 0;opacity:.9">Your Global Travel Companion</p></div>
    <div class="body">${content}</div>
    <div class="foot"><p>© 2026 Va Travel. All rights reserved.</p><p>Powered by Pi Network 🥧</p></div>
  </div></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SENDGRID_API_KEY not set — email skipped:', subject);
    return;
  }
  try {
    await sgMail.send({ to, from: FROM_EMAIL, subject, html });
    console.log('✅ Email sent:', subject, '→', to);
  } catch (error) {
    console.error('❌ Email failed:', subject, error);
  }
}

export async function sendBookingConfirmation(
  to: string, bookingId: string, hotelName: string, userName: string, checkIn: string, checkOut: string, amount: number
): Promise<void> {
  const html = baseTemplate(`
    <h2>🎉 Booking Confirmed!</h2>
    <p>Dear <strong>${userName}</strong>,</p>
    <p>Your booking is confirmed! Here are the details:</p>
    <div class="box">
      <p><strong>Hotel:</strong> ${hotelName}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Amount:</strong> π ${amount}</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
    </div>
    <p style="text-align:center">
      <a href="https://va-pied.vercel.app/en/dashboard" class="btn">View My Bookings</a>
    </p>
    <p>Thank you for choosing Va Travel! 🌍</p>
  `);
  await sendEmail(to, '✅ Booking Confirmed — Va Travel', html);
}

export async function sendPaymentConfirmation(
  to: string, amount: number, userName: string, txid?: string
): Promise<void> {
  const html = baseTemplate(`
    <h2>💰 Payment Successful!</h2>
    <p>Dear <strong>${userName}</strong>,</p>
    <div class="box">
      <p><strong>Amount:</strong> π ${amount}</p>
      ${txid ? `<p><strong>Transaction:</strong> ${txid.slice(0, 16)}...</p>` : ''}
      <p><strong>Cashback:</strong> π ${(amount * 0.02).toFixed(4)} credited to your wallet 🎁</p>
    </div>
    <p>Your Pi payment was processed successfully on the blockchain.</p>
  `);
  await sendEmail(to, '💳 Payment Confirmed — Va Travel', html);
}

export async function sendWelcomeEmail(to: string, userName: string): Promise<void> {
  const html = baseTemplate(`
    <h2>Welcome to Va Travel! 🌍</h2>
    <p>Dear <strong>${userName}</strong>,</p>
    <p>You've joined the world's first autonomous AI travel platform powered by Pi Network.</p>
    <div class="box">
      <p>✅ Book hotels worldwide with Pi</p>
      <p>✅ AI assistant speaks your language</p>
      <p>✅ 2% Pi cashback on every booking</p>
      <p>✅ Zero human intervention needed</p>
    </div>
    <p style="text-align:center">
      <a href="https://va-pied.vercel.app" class="btn">Start Exploring 🚀</a>
    </p>
  `);
  await sendEmail(to, '🌍 Welcome to Va Travel!', html);
}

export async function sendBookingCancellation(
  to: string, bookingId: string, userName: string
): Promise<void> {
  const html = baseTemplate(`
    <h2>Booking Cancelled</h2>
    <p>Dear <strong>${userName}</strong>,</p>
    <p>Your booking <strong>${bookingId.slice(0, 8)}...</strong> has been cancelled.</p>
    <p>If you paid with Pi, your refund will be processed within 24 hours.</p>
    <p style="text-align:center">
      <a href="https://va-pied.vercel.app/en/hotels" class="btn">Book Again</a>
    </p>
  `);
  await sendEmail(to, 'Booking Cancelled — Va Travel', html);
}

export default {
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendWelcomeEmail,
  sendBookingCancellation,
};
