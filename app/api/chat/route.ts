import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const agent1 = ({ prompt }: { prompt: string }) => {
  return openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'response_data',
        strict: false,
        schema: {
          type: 'object',
          properties: {
            initial_query: {
              type: 'string',
            },
            my_analysis: {
              type: 'string',
            },
          },
          required: [],
        },
      },
    },
    messages: [
      { role: 'user', content: prompt },
      {
        role: 'assistant',
        content:
          'You are a helpful assistant that returns a succint responses about ideas expressed in a user prompt. The initial query in your response should be the user&apos;s prompt exactly. do not change it.',
      },
    ],
  });
};

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing prompt:', prompt);

    const response = await agent1({ prompt });
    return new Response(response.choices[0].message.content);
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
