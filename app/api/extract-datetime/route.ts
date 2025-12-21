import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // External API URL
    const extractAPIUrl = process.env.EXTRACT_DATETIME_API_URL || 'http://3.106.197.67:8000/extract-datetime';
    
    // Create form-urlencoded data as the API expects
    const formData = new URLSearchParams();
    formData.append('text', text);

    const response = await fetch(extractAPIUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        // Try to parse JSON error response
        const errorText = await response.text();
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, use as plain text
          errorData = { error: errorText || `API error: ${response.status} ${response.statusText}` };
        }
      } catch {
        errorData = { error: `API error: ${response.status} ${response.statusText}` };
      }
      
      // Return error in consistent format
      return NextResponse.json(
        { 
          error: errorData.error || errorData.message || `API error: ${response.status} ${response.statusText}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from external API' },
        { status: 502 }
      );
    }

    // Validate response structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response format from external API' },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Error in extract-datetime API route:', error);
    
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to extraction service', message: 'The external API is unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

