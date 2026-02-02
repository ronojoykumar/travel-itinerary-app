import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { itinerary, budgetChange, paceChange, destination } = await req.json();

        const prompt = `
      Analyze this travel itinerary and provide 2-3 personalized AI suggestions.
      
      Destination: ${destination}
      Budget change: ${budgetChange > 0 ? `Increased by $${budgetChange}` : budgetChange < 0 ? `Decreased by $${Math.abs(budgetChange)}` : 'No change'}
      Pace change: ${paceChange || 'No change'}
      
      Current itinerary has ${itinerary.length} items.
      
      Return ONLY a JSON array of 2-3 suggestions with this structure:
      [
        {
          "title": "Suggestion title",
          "description": "Detailed explanation of the suggestion",
          "icon": "lightbulb" | "trending-up" | "heart" | "star"
        }
      ]
      
      Suggestions should be:
      - Actionable and specific
      - Based on budget/pace changes
      - Enhance the trip experience
      - Examples: "Add a cooking class", "Consider a day trip to nearby city", "Book accommodation early for better rates"
      
      Do not wrap in markdown or code blocks. Just the raw JSON array.
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a travel planning assistant providing personalized suggestions." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o",
        });

        const content = completion.choices[0].message.content?.trim() || '[]';
        const suggestions = JSON.parse(content);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json(
            { error: 'Failed to generate suggestions' },
            { status: 500 }
        );
    }
}
