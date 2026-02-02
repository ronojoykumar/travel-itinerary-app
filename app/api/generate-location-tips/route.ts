import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { location, destination, interests } = await req.json();

        const prompt = `
      Provide 3 practical "good to know" tourist tips for visiting ${location} in ${destination}.
      
      User interests: ${interests.join(", ")}.
      
      Return ONLY a JSON array of 3 strings.
      Example:
      [
        "Arrive early to avoid crowds at the main gate.",
        "The best photo spot is from the observation deck on the 2nd floor.",
        "Don't forget to remove your shoes before entering the inner hall."
      ]
      
      Tips should be:
      - Short (under 15 words)
      - Actionable
      - Specific to the location
      
      Do not wrap in markdown or code blocks. Just the raw JSON array.
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a local travel guide." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o",
        });

        const content = completion.choices[0].message.content?.trim() || '[]';
        const tips = JSON.parse(content);

        return NextResponse.json({ tips });
    } catch (error) {
        console.error('Error generating location tips:', error);
        return NextResponse.json(
            { error: 'Failed to generate tips' },
            { status: 500 }
        );
    }
}
