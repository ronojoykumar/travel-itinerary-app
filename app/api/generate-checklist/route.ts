import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { safeParseObject } from '@/lib/json-parser';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { destinations, startDate, endDate, tripType, interests } = await req.json();

    const prompt = `
      Create a comprehensive packing checklist for an international trip to ${destinations.join(" and ")}.
      
      Trip details:
      - Type: ${tripType}
      - Dates: ${startDate} to ${endDate}
      - Interests: ${interests.join(", ")}
      
      Return ONLY a JSON object with categorized packing items:
      {
        "categories": [
          {
            "name": "Documents & Essentials",
            "items": ["Passport", "Visa", "Travel insurance", ...]
          },
          {
            "name": "Clothing",
            "items": ["Comfortable walking shoes", ...]
          },
          {
            "name": "Electronics",
            "items": ["Phone charger", "Universal adapter", ...]
          },
          {
            "name": "Health & Hygiene",
            "items": ["Medications", "Sunscreen", ...]
          },
          {
            "name": "Other",
            "items": [...]
          }
        ]
      }
      
      Consider:
      - Climate and weather for the destination
      - Trip type and activities
      - International travel requirements
      - Cultural considerations
      
      Provide 20-30 essential items total across all categories.
      Do not wrap in markdown or code blocks. Just the raw JSON.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a travel packing expert." },
        { role: "user", content: prompt }
      ],
      model: "gpt-4o",
    });

    const content = completion.choices[0].message.content ?? '';
    const { data: checklist, ok } = safeParseObject(content);
    if (!ok || !checklist) {
      return NextResponse.json({ error: 'REGEN_REQUIRED', categories: [] }, { status: 500 });
    }
    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Error generating checklist:', error);
    return NextResponse.json(
      { error: 'Failed to generate checklist' },
      { status: 500 }
    );
  }
}
