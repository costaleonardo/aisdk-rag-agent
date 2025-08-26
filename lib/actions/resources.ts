'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    // Step 1: Validate input data using Zod schema
    const { content } = insertResourceSchema.parse(input);

    // Step 2: Insert the resource content into the database and get the created record
    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    // Step 3: Generate vector embeddings from the content for semantic search
    const embeddings = await generateEmbeddings(content);
    
    // Step 4: Store embeddings in the database, linking them to the resource
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );

    return 'Resource successfully created and embedded';
  } catch (e) {
    // Step 5: Handle errors gracefully and return meaningful messages
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};