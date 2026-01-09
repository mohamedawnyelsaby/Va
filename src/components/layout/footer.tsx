// src/components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Pi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: `/${locale}/about` },
      { label: 'Careers', href: `/${locale}/careers` },
      { label: 'Press', href: `/${locale}/press` },
      { label: 'Blog', href: `/${locale}/blog` },
    ],
    support: [
      { label: 'Help Center', href: `/${locale}/help` },
      { label: 'Contact Us', href: `/${locale}/contact` },
      { label: 'Safety', href: `/${locale}/safety` },
      { label: 'Trust & Safety', href: `/${locale}/trust` },
    ],
    discover: [
      { label: 'Hotels', href: `/${locale}/hotels` },
      { label: 'Attractions', href: `/${locale}/attractions` },
      { label: 'Restaurants', href: `/${locale}/restaurants` },
      { label: 'Cities', href: `/${locale}/cities` },
    ],
    legal: [
      { label: 'Terms of Service', href: `/${locale}/terms` },
      { label: 'Privacy Policy', href: `/${locale}/privacy` },
      { label: 'Cookie Policy', href: `/${locale}/cookies` },
      { label: 'Sitemap', href: `/${locale}/sitemap` },
    ],
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-xl font-bold text-white">Va</span>
              </div>
              <span className="text-xl font-bold">Va Travel</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted companion for global travel. Discover hotels, attractions, 
              and experiences worldwide with AI-powered recommendations and Pi Network payments.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Subscribe to our newsletter</h4>
              <div className="flex gap-2">
                <Input placeholder="Enter your email" className="max-w-xs" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Email</p>
              <a
                href="mailto:support@vatravel.com"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                support@vatravel.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Phone</p>
              <a
                href="tel:+1234567890"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                +1 (234) 567-890
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-pi/10 rounded-lg">
              <Pi className="h-5 w-5 text-pi" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Pi Network</p>
              <p className="text-sm text-muted-foreground">
                Accepted as payment
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Va Travel. All rights reserved. Made with ❤️ by Mohamed Awny
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
