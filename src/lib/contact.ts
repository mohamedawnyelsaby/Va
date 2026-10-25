// src/lib/contact.ts
//
// Single source for the public contact addresses. They were hard-coded in five
// places as @vatravel.com addresses. If that domain is not yours, customer mail
// (booking details!) goes to someone else, so make them configurable:
//   NEXT_PUBLIC_SUPPORT_EMAIL, NEXT_PUBLIC_CAREERS_EMAIL, NEXT_PUBLIC_PRESS_EMAIL
// (Vercel -> Settings -> Environment Variables, then redeploy).

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@vatravel.com';
export const CAREERS_EMAIL = process.env.NEXT_PUBLIC_CAREERS_EMAIL || SUPPORT_EMAIL;
export const PRESS_EMAIL = process.env.NEXT_PUBLIC_PRESS_EMAIL || SUPPORT_EMAIL;
