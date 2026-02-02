import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { tripType, destinations, startDate, endDate, budget, interests } = await req.json();

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const prompt = `
      Create a detailed travel itinerary for a ${tripType} trip to ${destinations.join(" and ")}.
      Dates: ${startDate} to ${endDate}.
      Budget: $${budget}.
      Interests: ${interests.join(", ")}.
      
      CRITICAL: This is a ${dayCount}-day trip. You MUST generate items for EVERY SINGLE DAY from day 1 to day ${dayCount}.

      Return strictly a JSON array of objects representing the schedule. 
      The JSON should adhere to this structure for each item:
      
      For Activities:
      {
        "type": "activity",
        "data": {
          "time": "HH:MM AM/PM",
          "title": "Activity Name",
          "description": "Short description",
          "location": "Location Name",
          "category": "food" | "activity" | "relax",
          "price": 25 (numeric value),
          "rating": 4.5
        },
        "day": 1
      }

      For Transport Options (provide 3 options: cab, bus, train):
      {
        "type": "transportOptions",
        "data": {
          "from": "City A",
          "to": "City B",
          "options": [
            { "type": "cab", "duration": "1h 30m", "price": 50 },
            { "type": "bus", "duration": "2h 15m", "price": 15 },
            { "type": "train", "duration": "1h 45m", "price": 30 }
          ]
        },
        "day": 2
      }

      For Meals (breakfast, lunch, dinner - include at least one per day):
      {
        "type": "meal",
        "data": {
          "mealType": "breakfast" | "lunch" | "dinner",
          "place": "Restaurant Name",
          "location": "Area/District",
          "price": 15 (numeric value)
        },
        "day": 1
      }

      REQUIREMENTS:
      - Generate 3-4 activities per day for EACH of the ${dayCount} days
      - Include 3 meals (breakfast, lunch, dinner) for EACH day
      - If multi-city, include 1 transport option set when moving between cities
      - The "day" field must range from 1 to ${dayCount}
      - DO NOT skip any days
      
      Do not wrap the response in markdown or code blocks. Just the raw JSON array.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful travel assistant." }, { role: "user", content: prompt }],
      model: "gpt-4o",
    });

    const content = completion.choices[0].message.content;

    // Basic cleanup if the model adds markdown code blocks
    const cleanContent = content?.replace(/```json/g, "").replace(/```/g, "").trim();

    const itinerary = JSON.parse(cleanContent || "[]");

    return NextResponse.json({ itinerary });
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate itinerary' }, { status: 500 });
  }
}
