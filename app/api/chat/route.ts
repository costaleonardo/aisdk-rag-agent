// Import OpenAI provider from the AI SDK
import { openai } from '@ai-sdk/openai';
import {
    convertToModelMessages,  // Converts UI messages to model-compatible format
    streamText,             // Function to stream AI text responses
    UIMessage              // TypeScript type for UI message structure
} from 'ai';

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
        model: openai('gpt-4o'),                        // Use GPT-4o model from OpenAI
        messages: convertToModelMessages(messages),     // Convert UI messages to OpenAI format
    });

    // Return the streaming response in a format compatible with the UI
    // This enables real-time streaming of the AI's response to the frontend
    return result.toUIMessageStreamResponse();
}