-- ============================================
-- SCHEMA FIXES FOR WISHLIST AND CONVERSATIONS
-- ============================================

-- FIX 1: Rename properties columns to match hook expectations
-- The properties table has 'bedrooms' and 'bathrooms' but the hooks expect 'beds' and 'baths'
ALTER TABLE properties 
  RENAME COLUMN bedrooms TO beds;

ALTER TABLE properties 
  RENAME COLUMN bathrooms TO baths;

-- FIX 2: Add missing columns in properties
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS suburb TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS coordinates JSONB,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bookings INTEGER DEFAULT 0;

-- Update existing properties to populate new fields
UPDATE properties 
SET suburb = city,
    province = state,
    coordinates = jsonb_build_object(
      'latitude', COALESCE(latitude, '0'), 
      'longitude', COALESCE(longitude, '0')
    )
WHERE suburb IS NULL OR province IS NULL OR coordinates IS NULL;

-- FIX 3: Create conversations table
DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participants TEXT[] NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add conversation_id to messages table
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Migrate existing messages to conversations
-- Create conversations for unique sender-receiver pairs
INSERT INTO conversations (participants, created_at, updated_at)
SELECT 
  ARRAY[sender_id::text, receiver_id::text] as participants,
  MIN(created_at) as created_at,
  MAX(created_at) as updated_at
FROM messages
WHERE conversation_id IS NULL
GROUP BY 
  CASE 
    WHEN sender_id < receiver_id THEN sender_id::text || receiver_id::text
    ELSE receiver_id::text || sender_id::text
  END
ON CONFLICT DO NOTHING;

-- Update messages with conversation_id
UPDATE messages m
SET conversation_id = c.id
FROM conversations c
WHERE m.conversation_id IS NULL
  AND (
    (m.sender_id::text = c.participants[1] AND m.receiver_id::text = c.participants[2])
    OR
    (m.sender_id::text = c.participants[2] AND m.receiver_id::text = c.participants[1])
  );

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
DROP POLICY IF EXISTS "conversations_select_own" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_own" ON conversations;
DROP POLICY IF EXISTS "conversations_update_own" ON conversations;

CREATE POLICY "conversations_select_own" 
  ON conversations 
  FOR SELECT 
  USING (auth.uid()::text = ANY(participants));

CREATE POLICY "conversations_insert_own" 
  ON conversations 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = ANY(participants));

CREATE POLICY "conversations_update_own" 
  ON conversations 
  FOR UPDATE 
  USING (auth.uid()::text = ANY(participants));

-- Update messages RLS policies to work with conversations
DROP POLICY IF EXISTS "messages_select_conversation" ON messages;
DROP POLICY IF EXISTS "messages_insert_conversation" ON messages;
DROP POLICY IF EXISTS "messages_update_conversation" ON messages;

CREATE POLICY "messages_select_conversation" 
  ON messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants)
    )
  );

CREATE POLICY "messages_insert_conversation" 
  ON messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants)
    )
  );

CREATE POLICY "messages_update_conversation" 
  ON messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants)
    )
  );

-- Add trigger to update conversations.updated_at when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS messages_update_conversation_time ON messages;
CREATE TRIGGER messages_update_conversation_time
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Add updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversations TO service_role;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed issues:';
  RAISE NOTICE '  1. Properties columns renamed: bedrooms → beds, bathrooms → baths';
  RAISE NOTICE '  2. Added missing columns: suburb, province, coordinates, verified, bookings';
  RAISE NOTICE '  3. Created conversations table with proper relationships';
  RAISE NOTICE '  4. Migrated existing messages to conversations';
  RAISE NOTICE '  5. Updated RLS policies for conversations and messages';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Wishlist and Conversations should now work correctly!';
END $$;
