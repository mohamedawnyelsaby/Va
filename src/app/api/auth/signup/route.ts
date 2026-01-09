// src/app/api/auth/signup/route.ts
// User Registration API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signupSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Check referral code if provided
    let referredById: string | undefined;
    if (validatedData.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: validatedData.referralCode },
      });
      
      if (referrer) {
        referredById = referrer.id;
        
        // Award referral bonus Pi
        await prisma.user.update({
          where: { id: referrer.id },
          data: { piBalance: { increment: 10 } },
        });
        
        // Create notification for referrer
        await prisma.notification.create({
          data: {
            userId: referrer.id,
            type: 'system',
            title: 'Referral Bonus!',
            message: 'You earned 10 Pi for referring a new user!',
          },
        });
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        referredById,
        piBalance: referredById ? 5 : 2, // Bonus for being referred
      },
    });

    // Create default preferences
    await prisma.preference.create({
      data: {
        userId: user.id,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'system',
        title: 'Welcome to Va Travel!',
        message: referredById 
          ? 'You received 5 Pi as a referral bonus! Start exploring amazing destinations.'
          : 'You received 2 Pi as a welcome bonus! Start exploring amazing destinations.',
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
