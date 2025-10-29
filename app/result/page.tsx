'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Header } from '@/components/header';

export default function Result() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'failed' | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const refParam = searchParams.get('ref');
    const errorParam = searchParams.get('error');

    if (statusParam === 'success' || statusParam === 'failed') {
      setStatus(statusParam);
      setBookingRef(refParam);
      setErrorMessage(errorParam);
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  if (!status) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg p-8 text-center shadow-md">
            {status === 'success' ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-3">Booking Confirmed</h1>
                {bookingRef && (
                  <p className="text-gray-600 mb-6">
                    Ref ID: <span className="font-mono font-semibold">{bookingRef}</span>
                  </p>
                )}
                <p className="text-gray-600 mb-8">
                  Your booking has been successfully confirmed. You will receive a confirmation email shortly.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="bg-red-100 rounded-full p-4">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-3">Booking Failed</h1>
                <p className="text-gray-600 mb-8">
                  {errorMessage || 'Unfortunately, your booking could not be completed. Please try again.'}
                </p>
              </>
            )}

            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
