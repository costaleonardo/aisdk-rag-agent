import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Initialize OpenAI embedding model for text vectorization
const embeddingModel = openai.embedding('text-embedding-ada-002');

// Split input text into chunks by sentence (periods)
const generateChunks = (input: string): string[] => {
    return input
        .trim() // Remove leading/trailing whitespace
        .split('.') // Split on periods to create sentence-based chunks
        .filter(i => i !== ''); // Remove empty strings from the array
}

// Generate embeddings for text input by chunking and vectorizing each piece
export const generateEmbeddings = async (
    value: string,
): Promise<Array<{ embedding: number[]; content: string  }>> => {
    // Break the input text into manageable chunks
    const chunks = generateChunks(value);
    
    // Generate embeddings for all chunks in parallel using AI SDK
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
    });

    // Combine each chunk with its corresponding embedding vector
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
}