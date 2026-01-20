// ============================================
// EMAIL NOTIFICATIONS SYSTEM
// Enterprise-Grade Email Service
// ============================================
// Path: lib/email/notifications.ts
// ============================================

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

// ============================================
// TYPES & INTERFACES
// ============================================

interface EmailConfig {
  from: string;
  replyTo?: string;
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

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
    contentType?: string;
  }>;
}

interface BookingEmailData {
  bookingId: string;
  userEmail: string;
  userName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  currency: string;
  confirmationNumber: string;
}

interface PaymentEmailData {
  paymentId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  piTxid?: string;
  status: string;
  bookingId?: string;
}

// ============================================
// EMAIL CONFIGURATION
// ============================================

const emailConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'Va Travel <noreply@vatravel.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@vatravel.com',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// ============================================
// TRANSPORTER SETUP
// ============================================

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });
  }
  
  return transporter;
}

// ============================================
// EMAIL SENDING
// ============================================

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      attachments: options.attachments,
    });
    
    console.log('✅ Email sent successfully:', options.subject);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

/**
 * Strip HTML for plain text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Base email template
 */
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Va Travel</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #3b82f6;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .info-box {
          background-color: #f3f4f6;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
        }
        .success-box {
          background-color: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
        }
        .warning-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
        }
        .danger-box {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌍 Va Travel</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2026 Va Travel. All rights reserved.</p>
          <p>
            <a href="https://vatravel.com/privacy" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a> |
            <a href="https://vatravel.com/terms" style="color: #3b82f6; text-decoration: none;">Terms of Service</a> |
            <a href="https://vatravel.com/contact" style="color: #3b82f6; text-decoration: none;">Contact Us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// BOOKING EMAILS
// ============================================

/**
 * Booking confirmation email
 */
export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const content = `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Dear ${data.userName},</p>
    <p>Your booking has been confirmed. Here are your booking details:</p>
    
    <div class="success-box">
      <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
    </div>
    
    <div class="info-box">
      <h3>Hotel Information</h3>
      <p><strong>Hotel:</strong> ${data.hotelName}</p>
      <p><strong>Check-in:</strong> ${new Date(data.checkIn).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Check-out:</strong> ${new Date(data.checkOut).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p><strong>Total Amount:</strong> ${data.totalAmount} ${data.currency}</p>
    </div>
    
    <p style="text-align: center;">
      <a href="https://vatravel.com/bookings/${data.bookingId}" class="button">
        View Booking Details
      </a>
    </p>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: data.userEmail,
    subject: `Booking Confirmed - ${data.hotelName}`,
    html: baseTemplate(content),
  });
}

/**
 * Booking cancellation email
 */
export async function sendBookingCancellation(data: BookingEmailData): Promise<boolean> {
  const content = `
    <h2>Booking Cancelled</h2>
    <p>Dear ${data.userName},</p>
    <p>Your booking has been cancelled as requested.</p>
    
    <div class="warning-box">
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Hotel:</strong> ${data.hotelName}</p>
    </div>
    
    <p>If you did not request this cancellation, please contact us immediately.</p>
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: data.userEmail,
    subject: `Booking Cancelled - ${data.bookingId}`,
    html: baseTemplate(content),
  });
}

// ============================================
// PAYMENT EMAILS
// ============================================

/**
 * Payment confirmation email
 */
export async function sendPaymentConfirmation(data: PaymentEmailData): Promise<boolean> {
  const content = `
    <h2>Payment Confirmed! ✅</h2>
    <p>Dear ${data.userName},</p>
    <p>Your payment has been successfully processed.</p>
    
    <div class="success-box">
      <h3>Payment Details</h3>
      <p><strong>Payment ID:</strong> ${data.paymentId}</p>
      <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      ${data.piTxid ? `<p><strong>Transaction ID:</strong> ${data.piTxid}</p>` : ''}
      ${data.bookingId ? `<p><strong>Booking ID:</strong> ${data.bookingId}</p>` : ''}
    </div>
    
    ${data.currency === 'PI' ? `
      <div class="info-box">
        <p>🎁 <strong>Cashback Reward:</strong> You've earned ${(data.amount * 0.02).toFixed(7)} Pi as cashback!</p>
        <p>The cashback will be credited to your account within 24 hours.</p>
      </div>
    ` : ''}
    
    <p style="text-align: center;">
      <a href="https://vatravel.com/payments/${data.paymentId}" class="button">
        View Payment Receipt
      </a>
    </p>
    
    <p>Thank you for your payment!</p>
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: data.userEmail,
    subject: `Payment Confirmed - ${data.amount} ${data.currency}`,
    html: baseTemplate(content),
  });
}

/**
 * Payment failed email
 */
export async function sendPaymentFailed(data: PaymentEmailData): Promise<boolean> {
  const content = `
    <h2>Payment Failed</h2>
    <p>Dear ${data.userName},</p>
    <p>Unfortunately, your payment could not be processed.</p>
    
    <div class="danger-box">
      <h3>Payment Details</h3>
      <p><strong>Payment ID:</strong> ${data.paymentId}</p>
      <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
      <p><strong>Status:</strong> Failed</p>
    </div>
    
    <div class="info-box">
      <h3>What to do next?</h3>
      <p>Please try again or use a different payment method.</p>
      <p>If the problem persists, contact our support team.</p>
    </div>
    
    <p style="text-align: center;">
      <a href="https://vatravel.com/bookings/${data.bookingId}" class="button">
        Try Again
      </a>
    </p>
    
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: data.userEmail,
    subject: `Payment Failed - Action Required`,
    html: baseTemplate(content),
  });
}

// ============================================
// AUTHENTICATION EMAILS
// ============================================

/**
 * Welcome email
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const content = `
    <h2>Welcome to Va Travel! 🌍</h2>
    <p>Dear ${userName},</p>
    <p>Thank you for joining Va Travel! We're excited to have you on board.</p>
    
    <div class="info-box">
      <h3>Get Started:</h3>
      <ul>
        <li>✈️ Search for hotels and accommodations</li>
        <li>🍽️ Book restaurants and experiences</li>
        <li>💰 Pay with Pi Network cryptocurrency</li>
        <li>🎁 Earn 2% cashback on all Pi payments</li>
      </ul>
    </div>
    
    <p style="text-align: center;">
      <a href="https://vatravel.com/explore" class="button">
        Start Exploring
      </a>
    </p>
    
    <p>If you have any questions, our support team is here to help!</p>
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Va Travel! 🌍',
    html: baseTemplate(content),
  });
}

/**
 * Password reset email
 */
export async function sendPasswordReset(
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `https://vatravel.com/reset-password?token=${resetToken}`;
  
  const content = `
    <h2>Password Reset Request</h2>
    <p>Dear ${userName},</p>
    <p>We received a request to reset your password.</p>
    
    <div class="warning-box">
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    </div>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">
        Reset Password
      </a>
    </p>
    
    <p>If you didn't request this, please ignore this email.</p>
    <p>For security, the link will expire in 1 hour.</p>
    
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: 'Password Reset Request',
    html: baseTemplate(content),
  });
}

/**
 * Email verification
 */
export async function sendEmailVerification(
  userEmail: string,
  userName: string,
  verificationToken: string
): Promise<boolean> {
  const verifyUrl = `https://vatravel.com/verify-email?token=${verificationToken}`;
  
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Dear ${userName},</p>
    <p>Please verify your email address to complete your registration.</p>
    
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">
        Verify Email
      </a>
    </p>
    
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>Va Travel Team</p>
  `;
  
  return sendEmail({
    to: userEmail,
    subject: 'Verify Your Email - Va Travel',
    html: baseTemplate(content),
  });
}

// ============================================
// SUPPORT EMAILS
// ============================================

/**
 * Contact form submission
 */
export async function sendContactFormSubmission(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const content = `
    <h2>New Contact Form Submission</h2>
    
    <div class="info-box">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <div class="info-box">
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
  `;
  
  // Send to support team
  await sendEmail({
    to: 'support@vatravel.com',
    subject: `Contact Form: ${subject}`,
    html: baseTemplate(content),
  });
  
  // Send confirmation to user
  const userContent = `
    <h2>Thank You for Contacting Us!</h2>
    <p>Dear ${name},</p>
    <p>We've received your message and will get back to you soon.</p>
    
    <div class="info-box">
      <h3>Your Message:</h3>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <p>We typically respond within 24 hours.</p>
    <p>Best regards,<br>Va Travel Support Team</p>
  `;
  
  return sendEmail({
    to: email,
    subject: 'We Received Your Message - Va Travel',
    html: baseTemplate(userContent),
  });
}

// ============================================
// BATCH EMAILS
// ============================================

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  content: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  
  for (const email of recipients) {
    const result = await sendEmail({
      to: email,
      subject,
      html: baseTemplate(content),
    });
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  
  return { success, failed };
}

// ============================================
// EMAIL QUEUE (For Production)
// ============================================

/*
For production, implement email queue with:
- Bull Queue (Redis-based)
- Rate limiting
- Retry mechanism
- Failed email tracking
- Scheduled emails

Example:
import Queue from 'bull';

const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  return sendEmail({ to, subject, html });
});

export function queueEmail(options: EmailOptions) {
  return emailQueue.add(options, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
*/

// ============================================
// EXPORTS
// ============================================

export default {
  sendEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendPaymentConfirmation,
  sendPaymentFailed,
  sendWelcomeEmail,
  sendPasswordReset,
  sendEmailVerification,
  sendContactFormSubmission,
  sendBulkEmail,
};
