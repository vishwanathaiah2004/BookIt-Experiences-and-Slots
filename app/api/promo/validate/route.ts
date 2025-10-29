import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { valid: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { data: promoCode, error } = await supabaseClient
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching promo code:', error);
      return NextResponse.json(
        { valid: false, error: 'Error validating promo code' },
        { status: 500 }
      );
    }

    if (!promoCode) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid promo code'
      });
    }

    let discount = 0;
    if (promoCode.discount_type === 'percentage') {
      discount = Math.round((subtotal * promoCode.discount_value) / 100);
    } else if (promoCode.discount_type === 'flat') {
      discount = Math.min(promoCode.discount_value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      discount,
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
