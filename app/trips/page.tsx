'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Trip = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string;
  end_date: string;
};

export default function TripsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create-trip form state
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);

  // 🔐 Auth guard + fetch user
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = '/login';
        return;
      }

      setUserId(data.user.id);
      await fetchTrips(data.user.id);
    };

    init();
  }, []);

  // Fetch trips
  const fetchTrips = async (uid: string) => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTrips(data || []);
    }

    setLoading(false);
  };

  // Create trip + auto-create days
  const createTrip = async () => {
    if (!name || !startDate || !endDate || !userId) return;

    setCreating(true);
    setError(null);

    // 1️⃣ Insert trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (tripError || !trip) {
      setError(tripError?.message || 'Failed to create trip');
      setCreating(false);
      return;
    }

    // 2️⃣ Auto-create days
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let dayIndex = 1;
    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      days.push({
        trip_id: trip.id,
        date: d.toISOString().split('T')[0],
        day_index: dayIndex,
      });
      dayIndex++;
    }

    const { error: daysError } = await supabase
      .from('days')
      .insert(days);

    if (daysError) {
      setError(daysError.message);
      setCreating(false);
      return;
    }

    // 3️⃣ Reset + refresh
    setName('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    await fetchTrips(userId);

    setCreating(false);
  };

  if (loading) {
    return <p className="p-6">Loading trips…</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-600">
        Error: {error}
      </p>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Trips</h1>

      {/* Create Trip */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-3">Create Trip</h2>

        <input
          type="text"
          placeholder="Trip name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={createTrip}
          disabled={creating || !name || !startDate || !endDate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {creating ? 'Creating…' : 'Create Trip'}
        </button>
      </div>

      {/* Trips List */}
      {trips.length === 0 ? (
        <p className="text-gray-600">No trips yet.</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li
              key={trip.id}
              className="border p-4 rounded cursor-pointer hover:bg-gray-50"
              onClick={() =>
                window.location.href = `/trips/${trip.id}`
              }
            >
              <h2 className="font-semibold">{trip.name}</h2>
              {trip.destination && (
                <p className="text-sm text-gray-600">
                  {trip.destination}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {trip.start_date} → {trip.end_date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
