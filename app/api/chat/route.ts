import { createResource } from '@/lib/actions/resources';
// Import OpenAI provider from the AI SDK
import { openai } from '@ai-sdk/openai';
import {
    convertToModelMessages,  // Converts UI messages to model-compatible format
    streamText,             // Function to stream AI text responses
    tool,
    UIMessage,              // TypeScript type for UI message structure
    stepCountIs
} from 'ai';
import { z } from 'zod';

// Configure maximum duration for streaming responses (30 seconds)
// This prevents long-running requests from timing out
export const maxDuration = 30;

// POST handler for the chat API endpoint
export async function POST(req: Request) {
    // Extract the messages array from the request body
    // Messages contain the conversation history between user and assistant
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Create a streaming text response using the AI SDK
    const result = streamText({
        model: openai('gpt-4o'),  
        system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,                      // Use GPT-4o model from OpenAI
        messages: convertToModelMessages(messages),     // Convert UI messages to OpenAI format
        stopWhen: stepCountIs(5),
        tools: {
            addResource: tool({
                description: `add a resource to your knowledge base. If the user provides a random peice of knowledge, use this tool without asking for confirmation.`,
                inputSchema: z.object({
                    content: z
                        .string()
                        .describe('the content or resource to add to the knowledge base'),                    
                }),
                execute: async ({ content }) => createResource({ content }),
            }),
        },
    });

    // Return the streaming response in a format compatible with the UI
    // This enables real-time streaming of the AI's response to the frontend
    return result.toUIMessageStreamResponse();
}