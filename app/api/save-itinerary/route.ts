import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { userId, tripData, accessToken } = await req.json();

        if (!userId || !tripData) {
            return NextResponse.json({ error: 'Missing userId or tripData' }, { status: 400 });
        }

        // Create an authenticated Supabase client using the user's access token
        // This satisfies RLS policies (auth.uid() = user_id)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {},
                },
            }
        );

        const { data, error } = await supabase
            .from('saved_itineraries')
            .insert({
                user_id: userId,
                destinations: tripData.destinations,
                start_date: tripData.startDate,
                end_date: tripData.endDate,
                trip_type: tripData.tripType,
                budget: tripData.budget,
                interests: tripData.interests || [],
                itinerary: tripData.itinerary,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error saving itinerary:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (error: any) {
        console.error('Error in save-itinerary route:', error);
        return NextResponse.json({ error: error.message || 'Failed to save itinerary' }, { status: 500 });
    }
}
