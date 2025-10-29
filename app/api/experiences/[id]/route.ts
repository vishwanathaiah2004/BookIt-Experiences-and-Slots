import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: experience, error: expError } = await supabaseClient
      .from('experiences')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (expError) {
      console.error('Error fetching experience:', expError);
      return NextResponse.json(
        { error: 'Failed to fetch experience' },
        { status: 500 }
      );
    }

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    const { data: slots, error: slotsError } = await supabaseClient
      .from('available_slots')
      .select('*')
      .eq('experience_id', id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (slotsError) {
      console.error('Error fetching slots:', slotsError);
      return NextResponse.json(
        { error: 'Failed to fetch slots' },
        { status: 500 }
      );
    }

    const slotsWithAvailability = slots.map(slot => ({
      ...slot,
      available: slot.total_slots - slot.booked_slots,
      soldOut: slot.booked_slots >= slot.total_slots
    }));

    return NextResponse.json({
      ...experience,
      available_slots: slotsWithAvailability
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
