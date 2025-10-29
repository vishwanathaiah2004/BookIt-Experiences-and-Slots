'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Header } from '@/components/header';
import { ExperienceWithSlots, SlotAvailability } from '@/lib/database.types';

export default function ExperienceDetails() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceWithSlots | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchExperience() {
      try {
        const response = await fetch(`/api/experiences/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch experience');
        }
        const data = await response.json();
        setExperience(data);

        if (data.available_slots && data.available_slots.length > 0) {
          const uniqueDates = Array.from(new Set(data.available_slots.map((s: SlotAvailability) => s.date))) as string[];
          setSelectedDate(uniqueDates[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchExperience();
  }, [params.id]);

  const availableDates = experience?.available_slots
    ? Array.from(new Set(experience.available_slots.map(s => s.date))).sort()
    : [];

  const slotsForSelectedDate = (experience?.available_slots || [])
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(slot => ({
      ...slot,
      available: slot.total_slots - slot.booked_slots,
      soldOut: slot.booked_slots >= slot.total_slots
    })) as SlotAvailability[];

  const subtotal = experience ? experience.price * quantity : 0;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const handleConfirm = () => {
    if (!selectedSlot || !experience) return;

    const bookingData = {
      experienceId: experience.id,
      experienceTitle: experience.title,
      slotId: selectedSlot.id,
      date: selectedSlot.date,
      time: selectedSlot.time,
      quantity,
      subtotal,
      taxes,
      total
    };

    router.push(`/checkout?data=${encodeURIComponent(JSON.stringify(bookingData))}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading experience...</p>
        </div>
      </>
    );
  }

  if (error || !experience) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Experience not found'}
          </div>
        </div>
      </>
    );
  }

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
            Details
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="relative h-96">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />
                  {experience.guide_name && (
                    <div className="absolute bottom-4 left-4 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {experience.guide_name}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
                  <p className="text-gray-600 mb-6">{experience.description}</p>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Choose date</h2>
                    <div className="flex flex-wrap gap-2">
                      {availableDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          className={`px-4 py-2 rounded-md border ${
                            selectedDate === date
                              ? 'bg-yellow-400 border-yellow-400 font-medium'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {formatDate(date)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Choose time</h2>
                    <div className="flex flex-wrap gap-3">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => !slot.soldOut && setSelectedSlot(slot)}
                          disabled={slot.soldOut}
                          className={`px-4 py-2 rounded-md border min-w-[120px] ${
                            slot.soldOut
                              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                              : selectedSlot?.id === slot.id
                              ? 'bg-yellow-400 border-yellow-400 font-medium'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-sm">{slot.time}</div>
                          <div className="text-xs text-gray-600">
                            {slot.soldOut ? 'Sold out' : `${slot.available} left`}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      All times are in IST (GMT +5:30)
                    </p>
                  </div>

                  {experience.about && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">About</h2>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-md">
                        {experience.about}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border-2 border-blue-400 p-6 sticky top-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Starts at</span>
                    <span className="font-bold text-xl">₹{experience.price}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 border rounded hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-100"
                        disabled={!selectedSlot || quantity >= selectedSlot.available}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm pb-4 border-b">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">₹{taxes}</span>
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedSlot}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed py-3 rounded-md font-medium transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
