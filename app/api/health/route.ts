/**
 * Health Check API Route
 * Simplified health check for deployment health probes
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Ultra-lightweight health check without service dependencies
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || undefined) || 'json';
    
    const healthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'ready',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development'
    };

    if (format === 'simple') {
      return NextResponse.json(
        {
          status: healthResponse.status,
          timestamp: healthResponse.timestamp,
        },
        { 
          status: 200,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          }
        }
      );
    }

    return NextResponse.json(healthResponse, { 
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check service error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

// Support for HEAD requests (common for health checks)
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    }
  });
}