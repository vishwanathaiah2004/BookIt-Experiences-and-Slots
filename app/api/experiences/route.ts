import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const { data: experiences, error } = await supabaseClient
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching experiences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      );
    }

    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
