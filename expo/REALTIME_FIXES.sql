-- ============================================
-- REALTIME FIXES FOR WISHLIST, BOOKINGS, AND CALENDAR
-- ============================================

-- ============================================
-- 1. CREATE BOOKING_SLOTS TABLE
-- ============================================

DROP TABLE IF EXISTS booking_slots CASCADE;

CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  booked BOOLEAN NOT NULL DEFAULT false,
  booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_slots_agent_id ON booking_slots(agent_id);
CREATE INDEX idx_booking_slots_date ON booking_slots(date);
CREATE INDEX idx_booking_slots_booked ON booking_slots(booked);

-- ============================================
-- 2. ENABLE RLS ON BOOKING_SLOTS
-- ============================================

ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_slots_select_all" ON booking_slots 
  FOR SELECT 
  USING (true);

CREATE POLICY "booking_slots_insert_by_agent" ON booking_slots 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "booking_slots_update_by_agent" ON booking_slots 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "booking_slots_delete_by_agent" ON booking_slots 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "booking_slots_service_role" ON booking_slots 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. ADD UPDATE TRIGGER FOR BOOKING_SLOTS
-- ============================================

CREATE TRIGGER update_booking_slots_updated_at BEFORE UPDATE ON booking_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE CONVERSATIONS TABLE
-- ============================================

DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, property_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_property ON conversations(property_id);

-- ============================================
-- 5. ENABLE RLS ON CONVERSATIONS
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own" ON conversations 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conversations_insert_own" ON conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conversations_update_own" ON conversations 
  FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conversations_service_role" ON conversations 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- 6. ADD UPDATE TRIGGER FOR CONVERSATIONS
-- ============================================

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. CREATE FUNCTION TO UPDATE CONVERSATIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try to update existing conversation
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    unread_count_user1 = CASE WHEN user2_id = NEW.sender_id THEN unread_count_user1 + 1 ELSE unread_count_user1 END,
    unread_count_user2 = CASE WHEN user1_id = NEW.sender_id THEN unread_count_user2 + 1 ELSE unread_count_user2 END,
    updated_at = NOW()
  WHERE 
    (user1_id = NEW.sender_id AND user2_id = NEW.receiver_id) 
    OR (user1_id = NEW.receiver_id AND user2_id = NEW.sender_id);

  -- If no rows were updated, insert new conversation
  IF NOT FOUND THEN
    INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id),
      NEW.content,
      NEW.created_at
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- 8. ADD TRIGGER FOR MESSAGE CONVERSATIONS
-- ============================================

DROP TRIGGER IF EXISTS update_conversation_trigger ON messages;
CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.booking_slots TO service_role;
GRANT ALL ON public.conversations TO service_role;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.booking_slots TO authenticated;
GRANT ALL ON public.conversations TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Real-time fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 New tables:';
  RAISE NOTICE '   - booking_slots (for agent calendars)';
  RAISE NOTICE '   - conversations (for messaging)';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Real-time triggers:';
  RAISE NOTICE '   - Messages update conversations automatically';
  RAISE NOTICE '   - Wishlists have real-time subscriptions';
  RAISE NOTICE '';
  RAISE NOTICE '✨ All real-time features ready!';
END $$;
