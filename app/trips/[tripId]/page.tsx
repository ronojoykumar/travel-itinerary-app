'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type Trip = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string;
  end_date: string;
};

type Day = {
  id: string;
  date: string;
  day_index: number;
};

type Activity = {
  id: string;
  title: string;
  day_id: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  sort_order: number;
};

const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'] as const;

export default function TripDetailPage() {
  const { tripId } = useParams() as { tripId: string };

  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [activitiesByDay, setActivitiesByDay] = useState<
    Record<string, Activity[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add activity
  const [addingDayId, setAddingDayId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSlot, setNewSlot] =
    useState<Activity['time_slot']>('morning');

  // Edit activity
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = '/login';
        return;
      }

      const { data: tripData, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (tripErr) {
        setError(tripErr.message);
        setLoading(false);
        return;
      }

      const { data: daysData, error: daysErr } = await supabase
        .from('days')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_index');

      if (daysErr) {
        setError(daysErr.message);
        setLoading(false);
        return;
      }

      const dayIds = (daysData || []).map((d) => d.id);

      const { data: acts, error: actErr } = await supabase
        .from('activities')
        .select('*')
        .in('day_id', dayIds)
        .order('sort_order');

      if (actErr) {
        setError(actErr.message);
        setLoading(false);
        return;
      }

      const grouped: Record<string, Activity[]> = {};
      (acts || []).forEach((a) => {
        if (!grouped[a.day_id]) grouped[a.day_id] = [];
        grouped[a.day_id].push(a);
      });

      setTrip(tripData);
      setDays(daysData || []);
      setActivitiesByDay(grouped);
      setLoading(false);
    };

    load();
  }, [tripId]);

  /* ---------------- ACTIONS ---------------- */

  const createActivity = async (dayId: string) => {
    if (!newTitle) return;

    const existingCount =
      (activitiesByDay[dayId] || []).filter(
        (a) => a.time_slot === newSlot
      ).length;

    const { error } = await supabase.from('activities').insert({
      day_id: dayId,
      title: newTitle,
      time_slot: newSlot,
      sort_order: existingCount,
    });

    if (error) {
      setError(error.message);
      return;
    }

    window.location.reload();
  };

  const updateActivity = async (id: string) => {
    if (!editedTitle) return;

    const { error } = await supabase
      .from('activities')
      .update({ title: editedTitle })
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.reload();
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('Delete this activity?')) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.reload();
  };

  const moveActivity = async (
    activity: Activity,
    direction: 'up' | 'down'
  ) => {
    const list = (activitiesByDay[activity.day_id] || [])
      .filter((a) => a.time_slot === activity.time_slot)
      .sort((a, b) => a.sort_order - b.sort_order);

    const index = list.findIndex((a) => a.id === activity.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;

    const current = list[index];
    const target = list[swapIndex];

    // Update UI immediately
    setActivitiesByDay((prev) => ({
      ...prev,
      [activity.day_id]: prev[activity.day_id].map((a) => {
        if (a.id === current.id)
          return { ...a, sort_order: target.sort_order };
        if (a.id === target.id)
          return { ...a, sort_order: current.sort_order };
        return a;
      }),
    }));

    // Persist swap
    await supabase
      .from('activities')
      .update({ sort_order: target.sort_order })
      .eq('id', current.id)
      .select();

    await supabase
      .from('activities')
      .update({ sort_order: current.sort_order })
      .eq('id', target.id)
      .select();
  };

  /* ---------------- AI GENERATION ---------------- */

  const generateItinerary = async () => {
    if (!trip || days.length === 0) return;

    const res = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripName: trip.name,
        destination: trip.destination,
        days: days.length,
      }),
    });

    const data = await res.json();

    for (const day of data.days) {
      const dayRow = days.find(
        (d) => d.day_index === day.day
      );
      if (!dayRow) continue;

      const inserts: any[] = [];

      const push = (
        slot: Activity['time_slot'],
        list: string[]
      ) => {
        list.forEach((title, i) => {
          inserts.push({
            day_id: dayRow.id,
            title,
            time_slot: slot,
            sort_order: i,
          });
        });
      };

      push('morning', day.morning || []);
      push('afternoon', day.afternoon || []);
      push('evening', day.evening || []);
      push('night', day.night || []);

      if (inserts.length) {
        await supabase.from('activities').insert(inserts);
      }
    }

    window.location.reload();
  };

  /* ---------------- UI ---------------- */

  if (loading) return <p className="p-6">Loading…</p>;
  if (!trip || error)
    return <p className="p-6 text-red-600">{error}</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{trip.name}</h1>
      <p className="text-gray-600">
        {trip.start_date} → {trip.end_date}
      </p>

      <button
        onClick={generateItinerary}
        className="bg-purple-600 text-white px-4 py-2 rounded mt-4"
      >
        Generate itinerary with AI
      </button>

      {days.map((day) => (
        <div key={day.id} className="border p-4 mt-4">
          <h2 className="font-semibold">Day {day.day_index}</h2>
          <p className="text-sm text-gray-500">{day.date}</p>

          {TIME_SLOTS.map((slot) => {
            const list = (activitiesByDay[day.id] || [])
              .filter((a) => a.time_slot === slot)
              .sort((a, b) => a.sort_order - b.sort_order);

            if (!list.length) return null;

            return (
              <div key={slot} className="mt-3">
                <h3 className="capitalize text-sm font-semibold">
                  {slot}
                </h3>

                {list.map((a) => (
                  <div key={a.id} className="border p-2 mt-1">
                    {editingId === a.id ? (
                      <>
                        <input
                          value={editedTitle}
                          onChange={(e) =>
                            setEditedTitle(e.target.value)
                          }
                          className="border p-1 w-full mb-1"
                        />
                        <button
                          onClick={() => updateActivity(a.id)}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{a.title}</p>
                        <div className="flex gap-2 text-sm">
                          <button onClick={() => moveActivity(a, 'up')}>
                            ↑
                          </button>
                          <button
                            onClick={() => moveActivity(a, 'down')}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(a.id);
                              setEditedTitle(a.title);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteActivity(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {addingDayId === day.id ? (
            <>
              <input
                className="border p-2 w-full mt-2"
                placeholder="Activity"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <select
                className="border p-2 w-full mt-2"
                value={newSlot}
                onChange={(e) =>
                  setNewSlot(e.target.value as any)
                }
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                className="bg-black text-white px-3 py-1 mt-2"
                onClick={() => createActivity(day.id)}
              >
                Add
              </button>
            </>
          ) : (
            <button
              className="text-blue-600 mt-2"
              onClick={() => setAddingDayId(day.id)}
            >
              + Add activity
            </button>
          )}
        </div>
      ))}
    </main>
  );
}
