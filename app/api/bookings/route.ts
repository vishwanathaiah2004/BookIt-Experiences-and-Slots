import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

function generateBookingRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      experience_id,
      slot_id,
      user_name,
      user_email,
      quantity,
      subtotal,
      taxes,
      discount,
      total_price,
      promo_code
    } = body;

    if (!experience_id || !slot_id || !user_name || !user_email || !quantity || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { data: slot, error: slotError } = await supabaseClient
      .from('available_slots')
      .select('*')
      .eq('id', slot_id)
      .maybeSingle();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Invalid slot' },
        { status: 400 }
      );
    }

    const availableSlots = slot.total_slots - slot.booked_slots;
    if (availableSlots < quantity) {
      return NextResponse.json(
        { error: 'Not enough slots available', status: 'failed' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseClient
      .from('available_slots')
      .update({ booked_slots: slot.booked_slots + quantity })
      .eq('id', slot_id)
      .eq('booked_slots', slot.booked_slots);

    if (updateError) {
      return NextResponse.json(
        { error: 'Booking conflict. Please try again.', status: 'failed' },
        { status: 409 }
      );
    }

    const bookingRef = generateBookingRef();

    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        booking_ref: bookingRef,
        experience_id,
        slot_id,
        user_name,
        user_email,
        quantity,
        subtotal,
        taxes,
        discount,
        total_price,
        promo_code,
        status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      await supabaseClient
        .from('available_slots')
        .update({ booked_slots: slot.booked_slots })
        .eq('id', slot_id);

      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking', status: 'failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
      status: 'confirmed'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', status: 'failed' },
      { status: 500 }
    );
  }
}
