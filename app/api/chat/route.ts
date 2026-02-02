import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages, tripData } = await req.json();

        const systemPrompt = `
      You are TripPilot, an AI travel assistant embedded inside a live trip itinerary app.
      
      You are NOT a general chatbot.
      You exist only to help the user during this specific trip.

      Your tone is: Friendly, Calm, Practical, Context-aware, Concise.
      You should feel like a knowledgeable local guide + trip coordinator.

      TRIP CONTEXT:
      Destination: ${tripData.destinations?.join(", ") || "Unknown"}
      Dates: ${tripData.startDate} to ${tripData.endDate}
      Itinerary: ${JSON.stringify(tripData.itinerary)}

      HARD CONSTRAINTS:
      1. Stay in trip scope: Only answer questions directly relevant to this trip.
      2. Use the itinerary explicitly: Anchor responses to actual days, places, or activities in the provided itinerary.
      3. Be action-oriented: Suggest what to do next, offer 2-3 concrete options.

      If a question is out of scope, politely redirect: "I can help with anything related to your trip to ${tripData.destinations?.[0] || "your destination"}. What would you like to adjust or explore?"

      Do NOT hallucinate places not in the itinerary unless explicitly framed as "nearby suggestions".
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "gpt-4o",
        });

        return NextResponse.json({
            message: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
