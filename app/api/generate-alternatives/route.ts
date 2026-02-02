import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { activity, destination, interests, budget } = await req.json();

        const prompt = `
      Generate 3 alternative activities to replace "${activity.title}" in ${destination}.
      
      Original activity details:
      - Category: ${activity.category}
      - Duration: ${activity.time}
      - Price: $${activity.price}
      
      Trip context:
      - Interests: ${interests.join(", ")}
      - Budget level: $${budget}
      
      Return ONLY a JSON array of 3 alternative activities with this structure:
      [
        {
          "title": "Activity Name",
          "description": "Brief description",
          "location": "Location name",
          "category": "food" | "activity" | "relax",
          "time": "HH:MM AM/PM",
          "price": 25 (numeric),
          "rating": 4.5
        }
      ]
      
      Make sure alternatives are:
      - Similar in price range (±30%)
      - Similar duration
      - Match the trip interests
      - Unique and different from the original
      
      Do not wrap in markdown or code blocks. Just the raw JSON array.
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a travel planning assistant." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o",
        });

        const content = completion.choices[0].message.content?.trim() || '[]';
        const alternatives = JSON.parse(content);

        return NextResponse.json({ alternatives });
    } catch (error) {
        console.error('Error generating alternatives:', error);
        return NextResponse.json(
            { error: 'Failed to generate alternatives' },
            { status: 500 }
        );
    }
}
