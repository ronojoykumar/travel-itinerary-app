import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { originalItinerary, swappedActivities, newBudget, originalBudget, pace } = await req.json();

        const budgetDiff = newBudget - originalBudget;
        const budgetDirection = budgetDiff > 0 ? 'increased' : budgetDiff < 0 ? 'decreased' : 'unchanged';

        const prompt = `
      Rejig this travel itinerary based on user customizations.
      
      Original budget: $${originalBudget}
      New budget: $${newBudget} (${budgetDirection} by $${Math.abs(budgetDiff)})
      Trip pace: ${pace || 'moderate'}
      
      User has swapped these activities (DO NOT CHANGE THESE):
      ${JSON.stringify(swappedActivities, null, 2)}
      
      Original itinerary:
      ${JSON.stringify(originalItinerary, null, 2)}
      
      Instructions:
      1. PRESERVE all swapped activities exactly as provided
      2. If budget decreased: Replace meals with cheaper options (reduce meal prices by ~20-30%)
      3. If budget increased: Upgrade meals to nicer restaurants (increase meal prices by ~20-30%)
      4. If pace is "relaxed": Reduce number of activities per day, add more relax time
      5. If pace is "packed": Add more activities if budget allows
      6. Keep the same day structure and types (activity, meal, transportOptions)
      
      Return the COMPLETE updated itinerary as a JSON array with the same structure as the original.
      Do not wrap in markdown or code blocks. Just the raw JSON array.
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a travel itinerary optimizer." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o",
        });

        const content = completion.choices[0].message.content?.trim() || '[]';
        const updatedItinerary = JSON.parse(content);

        return NextResponse.json({ itinerary: updatedItinerary });
    } catch (error) {
        console.error('Error rejigging itinerary:', error);
        return NextResponse.json(
            { error: 'Failed to rejig itinerary' },
            { status: 500 }
        );
    }
}
