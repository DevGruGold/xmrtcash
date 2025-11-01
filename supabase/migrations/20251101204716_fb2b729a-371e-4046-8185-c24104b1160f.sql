-- Drop existing function and recreate with correct signature
DROP FUNCTION IF EXISTS match_memories(vector, double precision, integer, text);

-- Create function to match memories using cosine similarity
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_context_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  context_type text,
  importance_score int,
  created_at timestamptz,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.content,
    mc.context_type,
    mc.importance_score,
    mc.created_at,
    mc.metadata,
    1 - (mc.embedding <=> query_embedding) as similarity
  FROM memory_contexts mc
  WHERE 
    (filter_context_type IS NULL OR mc.context_type = filter_context_type)
    AND mc.embedding IS NOT NULL
    AND 1 - (mc.embedding <=> query_embedding) > match_threshold
  ORDER BY mc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;