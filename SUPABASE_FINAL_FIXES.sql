-- ============================================
-- FINAL SUPABASE FIXES
-- Run this in your Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- FIX 1: Create conversations table
-- ============================================

DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can read their conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = ANY(participants::text[]));

-- Create index for faster queries
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX idx_conversations_property ON conversations(property_id);

-- ============================================
-- FIX 2: Update messages table
-- ============================================

-- Ensure messages table has correct structure
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- ============================================
-- FIX 3: Ensure wishlists table exists with correct structure
-- ============================================

-- Check if wishlists table exists, create if not
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;

-- Create policies
CREATE POLICY "Users can read own wishlist" ON wishlists
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can remove from wishlist" ON wishlists
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_property ON wishlists(property_id);

COMMIT;
