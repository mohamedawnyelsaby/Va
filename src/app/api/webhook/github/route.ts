import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('📦 Received GitHub webhook:', {
      event: request.headers.get('x-github-event'),
      repository: payload.repository?.full_name,
      ref: payload.ref,
      pusher: payload.pusher?.name,
    });

    const event = request.headers.get('x-github-event');
    const branch = payload.ref?.split('/').pop();

    if (event === 'push' && branch === 'main') {
      console.log('✅ Valid push to main branch detected');
      console.log('🚀 Triggering Railway deployment...');
      
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
