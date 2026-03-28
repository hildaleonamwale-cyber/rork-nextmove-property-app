-- Fix for wishlist and conversations errors

-- 1. Ensure properties table has all the required columns
-- Add missing columns if they don't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'monthly' CHECK (price_type IN ('monthly', 'sale', 'total'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS baths INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS suburb TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"latitude": 0, "longitude": 0}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bookings INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants TEXT[] NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add conversation_id to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- 4. Create index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- 5. Migrate existing messages to conversations
-- This creates a conversation for each unique sender-receiver pair
DO $$
DECLARE
  msg_record RECORD;
  conv_id UUID;
  participants_array TEXT[];
BEGIN
  FOR msg_record IN 
    SELECT DISTINCT 
      LEAST(sender_id::TEXT, receiver_id::TEXT) as user1,
      GREATEST(sender_id::TEXT, receiver_id::TEXT) as user2
    FROM messages
    WHERE conversation_id IS NULL
  LOOP
    participants_array := ARRAY[msg_record.user1, msg_record.user2];
    
    -- Check if conversation exists
    SELECT id INTO conv_id
    FROM conversations
    WHERE participants @> participants_array AND participants <@ participants_array;
    
    -- Create conversation if it doesn't exist
    IF conv_id IS NULL THEN
      INSERT INTO conversations (participants, created_at, updated_at)
      VALUES (participants_array, NOW(), NOW())
      RETURNING id INTO conv_id;
    END IF;
    
    -- Update messages with conversation_id
    UPDATE messages
    SET conversation_id = conv_id
    WHERE conversation_id IS NULL
      AND (
        (sender_id::TEXT = msg_record.user1 AND receiver_id::TEXT = msg_record.user2)
        OR (sender_id::TEXT = msg_record.user2 AND receiver_id::TEXT = msg_record.user1)
      );
  END LOOP;
END $$;

-- 6. Add user_mode column to users table for UserModeContext
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_mode TEXT DEFAULT 'client' CHECK (user_mode IN ('client', 'agent', 'admin'));

-- 7. Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS policy for conversations - users can see conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::TEXT = ANY(participants));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::TEXT = ANY(participants));

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::TEXT = ANY(participants));

-- 8. Update messages RLS to work with conversations
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid()::TEXT = ANY(participants)
    )
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid()::TEXT = ANY(participants)
    )
  );

CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid()::TEXT = ANY(participants)
    )
  );
