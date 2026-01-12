// src/app/api/webhook/github/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Get the payload from GitHub
    const payload = await request.json();
    
    console.log('📦 Received GitHub webhook:', {
      event: request.headers.get('x-github-event'),
      repository: payload.repository?.full_name,
      ref: payload.ref,
      pusher: payload.pusher?.name,
    });

    // Verify it's a push event to main branch
    const event = request.headers.get('x-github-event');
    const branch = payload.ref?.split('/').pop();

    if (event === 'push' && branch === 'main') {
      console.log('✅ Valid push to main branch detected');
      
      // Log the deployment trigger
      console.log('🚀 Triggering Railway deployment...');
      
      // Railway will automatically handle the deployment
      // This endpoint just confirms receipt
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Webhook received successfully',
          branch,
          commits: payload.commits?.length || 0,
        },
        { status: 200 }
      );
    }

    // Other events or branches
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook received but no action needed',
        event,
        branch,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'GitHub Webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
