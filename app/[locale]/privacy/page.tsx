// ============================================
// PRIVACY POLICY PAGE
// GDPR & CCPA Compliant Privacy Policy
// ============================================
// Path: app/[locale]/privacy/page.tsx
// ============================================

import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Va Travel',
  description: 'Learn how Va Travel protects your privacy and handles your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last Updated: January 21, 2026
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              At Va Travel, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              We are committed to protecting your personal data and complying with GDPR, CCPA, and other
              applicable privacy regulations worldwide.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Account credentials (encrypted passwords)</li>
              <li>Payment information (processed securely via Stripe and Pi Network)</li>
              <li>Booking details and travel preferences</li>
              <li>Pi Network wallet information (when you choose to use Pi payments)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>Location Data</h3>
            <ul>
              <li>City and country (for local recommendations)</li>
              <li>GPS data (only with your permission, for map features)</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We use your information to:</p>
            <ul>
              <li>Provide, operate, and maintain our services</li>
              <li>Process bookings and payments</li>
              <li>Send booking confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Improve and personalize your experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>AES-256 encryption for sensitive data</li>
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure password hashing with bcrypt</li>
              <li>Regular security audits and penetration testing</li>
              <li>Two-factor authentication (2FA) available</li>
              <li>SOC 2 Type II compliance (in progress)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Under GDPR and CCPA, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("Right to be Forgotten")</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
              <li><strong>Objection:</strong> Opt-out of certain processing activities</li>
              <li><strong>Withdraw Consent:</strong> Revoke permission at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at <strong>privacy@vatravel.com</strong>
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Personalize content and advertisements</li>
              <li>Enhance security and prevent fraud</li>
            </ul>
            <p>
              You can control cookies through your browser settings. For more details, see our{' '}
              <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>We work with trusted third-party providers:</p>
            <ul>
              <li><strong>Payment Processing:</strong> Stripe, Pi Network</li>
              <li><strong>Analytics:</strong> Google Analytics</li>
              <li><strong>Email Services:</strong> Resend</li>
              <li><strong>Cloud Infrastructure:</strong> Vercel, Railway</li>
              <li><strong>Database:</strong> PostgreSQL (encrypted)</li>
            </ul>
            <p>
              These providers have their own privacy policies and are required to protect your data.
            </p>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Your data may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place, including:
            </p>
            <ul>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Data Processing Agreements with all vendors</li>
              <li>Compliance with Privacy Shield principles</li>
            </ul>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Our services are not directed to children under 13 (or 16 in the EU).
              We do not knowingly collect personal information from children.
              If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
            <p>
              Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>If you have questions about this Privacy Policy, contact us:</p>
            <ul>
              <li><strong>Email:</strong> privacy@vatravel.com</li>
              <li><strong>Support:</strong> support@vatravel.com</li>
              <li><strong>Address:</strong> Va Travel Inc., [Your Address]</li>
            </ul>
            <p>
              <strong>Data Protection Officer:</strong> dpo@vatravel.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
