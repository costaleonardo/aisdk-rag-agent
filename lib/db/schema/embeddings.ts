// Import nanoid for generating unique identifiers
import { nanoid } from '@/lib/utils';
// Import Drizzle ORM components for PostgreSQL schema definition
import { index, pgTable, text, varchar, vector } from 'drizzle-orm/pg-core';
// Import resources table to establish foreign key relationship
import { resources } from './resources';

/**
 * Embeddings table schema for storing vector embeddings in a RAG (Retrieval-Augmented Generation) system.
 * This table stores text content along with their corresponding vector embeddings for semantic search.
 */
export const embeddings = pgTable(
    'embeddings',
    {
        // Primary key: Unique identifier for each embedding record
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => nanoid()),
        
        // Foreign key: Links to the resources table, cascades on delete
        // When a resource is deleted, all associated embeddings are automatically removed
        resourceId: varchar('resource_id', { length: 191 }).references(
            () => resources.id,
            { onDelete: 'cascade' },
        ),
        
        // The actual text content that was processed and embedded
        // This is stored alongside the vector for context and retrieval
        content: text('content').notNull(),
        
        // Vector embedding with 1536 dimensions (standard for OpenAI text-embedding-ada-002)
        // These vectors enable semantic similarity search and retrieval
        embedding: vector('embedding', { dimensions: 1536 }).notNull(),   
    },
    // Table indexes for performance optimization
    table => ({
        // HNSW (Hierarchical Navigable Small World) index for fast vector similarity search
        // Uses cosine similarity operations for finding semantically similar content
        // This enables efficient nearest neighbor search across large embedding datasets
        embeddingIndex: index('embeddingIndex').using(
            'hnsw',
            table.embedding.op('vector_cosine_ops'),
        ),
    }),
);
