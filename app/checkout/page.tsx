'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/header';

interface BookingData {
  experienceId: string;
  experienceTitle: string;
  slotId: string;
  date: string;
  time: string;
  quantity: number;
  subtotal: number;
  taxes: number;
  total: number;
}

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setBookingData(parsed);
      } catch (err) {
        console.error('Failed to parse booking data:', err);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !bookingData) return;

    setValidatingPromo(true);
    setPromoError('');

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
          subtotal: bookingData.subtotal
        })
      });

      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discount);
        setPromoApplied(true);
        setPromoError('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
        setDiscount(0);
        setPromoApplied(false);
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
      setDiscount(0);
      setPromoApplied(false);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData || !fullName.trim() || !email.trim() || !agreedToTerms) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience_id: bookingData.experienceId,
          slot_id: bookingData.slotId,
          user_name: fullName.trim(),
          user_email: email.trim(),
          quantity: bookingData.quantity,
          subtotal: bookingData.subtotal,
          taxes: bookingData.taxes,
          discount,
          total_price: finalTotal,
          promo_code: promoApplied ? promoCode.trim() : null
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push(`/result?status=success&ref=${result.booking.booking_ref}`);
      } else {
        router.push(`/result?status=failed&error=${encodeURIComponent(result.error || 'Booking failed')}`);
      }
    } catch (err) {
      router.push(`/result?status=failed&error=${encodeURIComponent('An unexpected error occurred')}`);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </>
    );
  }

  const finalTotal = bookingData.total - discount;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Checkout
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoApplied(false);
                          setPromoError('');
                        }}
                        placeholder="Enter promo code"
                        disabled={promoApplied}
                        className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim() || promoApplied || validatingPromo}
                        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {validatingPromo ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-sm text-green-600 mt-2">Promo code applied successfully!</p>
                    )}
                    {promoError && (
                      <p className="text-sm text-red-600 mt-2">{promoError}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        required
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the terms and safety policy
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!agreedToTerms || loading}
                    className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-3 rounded-md font-medium transition-colors"
                  >
                    {loading ? 'Processing...' : 'Pay and Confirm'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{bookingData.experienceTitle}</h3>
                  <p className="text-sm text-gray-600">Date: {formatDate(bookingData.date)}</p>
                  <p className="text-sm text-gray-600">Time: {bookingData.time}</p>
                  <p className="text-sm text-gray-600">Qty: {bookingData.quantity}</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{bookingData.subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">₹{bookingData.taxes}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
