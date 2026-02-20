import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { parseItineraryResponse } from '@/lib/json-parser';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildFullPrompt(params: {
  tripType: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
  dayCount: number;
}): string {
  const { tripType, destinations, startDate, endDate, budget, interests, dayCount } = params;
  return `Create a detailed travel itinerary for a ${tripType} trip to ${destinations.join(" and ")}.
Dates: ${startDate} to ${endDate} (${dayCount} days).
Budget: $${budget}.
Interests: ${interests.join(", ")}.

CRITICAL: Generate items for EVERY SINGLE DAY from day 1 to day ${dayCount}. Do NOT skip any days.

Return ONLY a raw JSON array — no markdown, no preamble, no explanation. Start your response with [ and end with ].

Each element is one of:

Activity:
{"type":"activity","data":{"time":"HH:MM AM/PM","title":"Name","description":"Short desc","location":"Place","category":"food|activity|relax","price":25,"rating":4.5},"day":1}

Transport (when moving between cities):
{"type":"transportOptions","data":{"from":"City A","to":"City B","options":[{"type":"cab","duration":"1h 30m","price":50},{"type":"bus","duration":"2h","price":15},{"type":"train","duration":"1h 45m","price":30}]},"day":2}

Meal:
{"type":"meal","data":{"mealType":"breakfast|lunch|dinner","place":"Restaurant","location":"Area","price":15},"day":1}

Rules:
- 3–4 activities per day
- 3 meals per day (breakfast, lunch, dinner)
- Transport options ONLY when changing cities
- day field: 1 to ${dayCount}`;
}

function buildSummaryPrompt(params: {
  tripType: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
  dayCount: number;
}): string {
  const { tripType, destinations, startDate, endDate, budget, interests, dayCount } = params;
  return `Create a CONDENSED travel itinerary for a ${tripType} trip to ${destinations.join(" and ")}.
Dates: ${startDate} to ${endDate} (${dayCount} days total).
Budget: $${budget}. Interests: ${interests.join(", ")}.

This trip is more than 10 days. To stay within token limits, generate:
- 2 activities per day (not 4)
- 2 meals per day (skip breakfast)
- Transport only between cities

Return ONLY a raw JSON array. No markdown, no text. Start with [ end with ].

Same schema as always:
{"type":"activity","data":{"time":"10:00 AM","title":"Name","description":"Desc","location":"Place","category":"activity","price":20,"rating":4.2},"day":1}
{"type":"meal","data":{"mealType":"lunch","place":"Restaurant","location":"Area","price":12},"day":1}

Cover ALL ${dayCount} days.`;
}

export async function POST(req: Request) {
  try {
    const { tripType, destinations, startDate, endDate, budget, interests } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Token-management: use condensed prompt for trips > 10 days
    const isLongTrip = dayCount > 10;
    const prompt = isLongTrip
      ? buildSummaryPrompt({ tripType, destinations, startDate, endDate, budget, interests, dayCount })
      : buildFullPrompt({ tripType, destinations, startDate, endDate, budget, interests, dayCount });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel itinerary generator. You ONLY output raw JSON arrays. " +
            "Never include any text before or after the JSON. Never say sorry or add explanations.",
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o",
      // Prevent runaway responses
      max_tokens: isLongTrip ? 6000 : 8000,
      // Deterministic output — less likely to hallucinate non-JSON
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content;

    // ── Defensive parsing via lib/json-parser ─────────────────────────────
    const result = parseItineraryResponse(raw);

    if (result.error === "REGEN_REQUIRED") {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({ itinerary: result.itinerary });

  } catch (error: any) {
    console.error('[generate-itinerary] Error:', error);
    return NextResponse.json(
      { error: "REGEN_REQUIRED", items: [], status: 500, message: error.message },
      { status: 500 }
    );
  }
}
