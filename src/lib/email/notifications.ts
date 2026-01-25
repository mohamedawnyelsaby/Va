// ============================================
// EMAIL NOTIFICATIONS SYSTEM - PRODUCTION READY
// SendGrid + Queue + Modular Templates
// ============================================

import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';

// ============================================
// CONFIG
// ============================================

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    type?: string;
  }>;
}

// ============================================
// QUEUE (SIMPLE RETRY MECHANISM)
// ============================================

interface QueueJob {
  email: EmailOptions;
  attempts?: number;
}

const emailQueue: QueueJob[] = [];
const MAX_ATTEMPTS = 3;

async function processQueue() {
  while (emailQueue.length > 0) {
    const job = emailQueue.shift()!;
    try {
      await sgMail.send({
        ...job.email,
        text: job.email.text || stripHtml(job.email.html),
      });
      console.log('✅ Email sent:', job.email.subject);
    } catch (error) {
      console.error('❌ Email failed:', job.email.subject, error);
      if (!job.attempts) job.attempts = 1;
      if (job.attempts < MAX_ATTEMPTS) {
        job.attempts++;
        emailQueue.push(job); // Retry
      }
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Va Travel</title>
        <style>
          body { font-family: Arial,sans-serif; background:#f4f4f4; margin:0; padding:0; }
          .container { max-width:600px; margin:0 auto; background:#fff; }
          .header { background:#3b82f6; padding:30px; text-align:center; color:#fff; }
          .content { padding:40px 30px; }
          .footer { background:#f9fafb; padding:20px 30px; text-align:center; font-size:12px; color:#6b7280; }
          .button { display:inline-block; padding:12px 30px; background:#3b82f6; color:#fff; text-decoration:none; border-radius:6px; margin:20px 0; }
          .success-box { background:#d1fae5; border-left:4px solid #10b981; padding:15px; margin:20px 0; }
          .warning-box { background:#fef3c7; border-left:4px solid #f59e0b; padding:15px; margin:20px 0; }
          .danger-box { background:#fee2e2; border-left:4px solid #ef4444; padding:15px; margin:20px 0; }
          .info-box { background:#f3f4f6; border-left:4px solid #3b82f6; padding:15px; margin:20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🌍 Va Travel</h1></div>
          <div class="content">${content}</div>
          <div class="footer">
            <p>© 2026 Va Travel. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function queueEmail(email: EmailOptions) {
  emailQueue.push({ email });
  processQueue();
}

// ============================================
// MODULAR EMAILS
// ============================================

export async function sendBookingConfirmation(to: string, bookingId: string, hotelName: string, userName: string) {
  const content = `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Dear ${userName}, your booking for ${hotelName} (ID: ${bookingId}) is confirmed.</p>
    <p style="text-align:center;">
      <a href="https://vatravel.com/bookings/${bookingId}" class="button">View Booking</a>
    </p>
  `;
  queueEmail({ to, subject: 'Booking Confirmed', html: baseTemplate(content) });
}

export async function sendPaymentConfirmation(to: string, amount: number, currency: string, userName: string) {
  const content = `
    <h2>Payment Confirmed! ✅</h2>
    <p>Dear ${userName}, your payment of ${amount} ${currency} was successful.</p>
  `;
  queueEmail({ to, subject: 'Payment Confirmed', html: baseTemplate(content) });
}

export async function sendWelcomeEmail(to: string, userName: string) {
  const content = `
    <h2>Welcome to Va Travel! 🌍</h2>
    <p>Dear ${userName}, thank you for joining us!</p>
  `;
  queueEmail({ to, subject: 'Welcome to Va Travel', html: baseTemplate(content) });
}

export default {
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendWelcomeEmail,
};
