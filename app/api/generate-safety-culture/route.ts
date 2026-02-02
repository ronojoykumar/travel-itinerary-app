import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { destination } = await req.json();

    const prompt = `
      Provide essential safety tips and cultural guidance for travelers visiting ${destination}.
      
      Return ONLY a JSON object with three sections:
      {
        "safetyTips": [
          "Keep copies of important documents",
          "Be aware of common scams",
          ...
        ],
        "culturalGuidance": {
          "dos": [
            "Remove shoes before entering homes",
            "Bow when greeting",
            ...
          ],
          "donts": [
            "Don't point with your feet",
            "Avoid public displays of affection",
            ...
          ]
        },
        "emergencyNumbers": {
          "police": "110",
          "ambulance": "119",
          "fire": "119"
        }
      }
      
      Provide:
      - 5-7 practical safety tips specific to the destination
      - 4-5 cultural dos
      - 4-5 cultural don'ts
      - Accurate emergency numbers for the destination
      
      Be specific and actionable.
      Do not wrap in markdown or code blocks. Just the raw JSON.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a travel safety and cultural expert." },
        { role: "user", content: prompt }
      ],
      model: "gpt-4o",
    });

    const content = completion.choices[0].message.content?.trim() || '{}';
    const guidance = JSON.parse(content);

    return NextResponse.json(guidance);
  } catch (error) {
    console.error('Error generating safety tips:', error);
    return NextResponse.json(
      { error: 'Failed to generate safety tips' },
      { status: 500 }
    );
  }
}
