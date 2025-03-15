import { Message } from 'ai';
import OpenAI from 'openai';

// Initialize the OpenAI client with Deepseek base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const runtime = 'edge';

// Define critic personalities
const CRITIC_PERSONALITIES = {
  1: 'You are a pragmatic and analytical critic. Focus on practical implications and logical consistency.',
  2: 'You are an innovative and forward-thinking critic. Focus on potential opportunities and novel approaches.',
  3: 'You are a detail-oriented and cautious critic. Focus on potential risks and edge cases.',
  4: 'You are an empathetic and user-focused critic. Focus on human impact and accessibility.',
  5: 'You are a visionary and big-picture critic. Focus on long-term implications and strategic alignment.',
  6: "You are a devil's advocate critic. Challenge assumptions and present alternative viewpoints.",
};

// Define a type for Deepseek's delta response which includes reasoning_content
interface DeepseekDelta {
  content?: string;
  reasoning_content?: string;
  // Use a more specific type for additional properties
  [key: string]: string | undefined;
}

export async function POST(req: Request) {
  try {
    const { prompt, criticNumber, previousResponses } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing critic ${criticNumber} with prompt:`, prompt);

    // Build the context from previous responses
    const previousContext = previousResponses
      ? `Previous critics have said:\n${previousResponses
          .map((r: Message, i: number) => `Critic ${i + 1}: ${r.content}`)
          .join('\n')}\n\n`
      : '';

    // Get the personality for this critic
    const personality =
      CRITIC_PERSONALITIES[criticNumber as keyof typeof CRITIC_PERSONALITIES] || CRITIC_PERSONALITIES[1];

    // Create the full prompt with personality and context
    const fullPrompt = `${personality}\n\n${previousContext}Please analyze the following idea:\n${prompt} and return response in one sentence`;

    // Create a streaming response using the Deepseek Reasoner
    const stream = await openai.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: fullPrompt }],
      stream: true,
    });

    // Create a ReadableStream to handle Deepseek's specific response format
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of stream) {
            // Handle Deepseek's specific response format
            if (chunk.choices && chunk.choices[0].delta) {
              // Use type assertion for Deepseek's delta format
              const delta = chunk.choices[0].delta as DeepseekDelta;

              // Create a response object with both content types
              const response = {
                content: delta.content || '',
                reasoning: delta.reasoning_content || '',
                criticNumber: criticNumber,
              };

              // Only send if there's actual content
              if (response.content || response.reasoning) {
                controller.enqueue(encoder.encode(JSON.stringify(response) + '\n'));
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return a streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
