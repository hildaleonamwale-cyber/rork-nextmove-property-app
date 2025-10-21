-- ============================================
-- BOOKING SLOTS TABLE FIX
-- Adds the missing booking_slots table
-- ============================================

-- Create booking_slots table
CREATE TABLE IF NOT EXISTS booking_slots (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_slots_agent_id ON booking_slots(agent_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_date ON booking_slots(date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_booked ON booking_slots(booked);
CREATE INDEX IF NOT EXISTS idx_booking_slots_booked_by ON booking_slots(booked_by);

-- Enable RLS
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "booking_slots_select_by_agent" ON booking_slots;
DROP POLICY IF EXISTS "booking_slots_select_all" ON booking_slots;
DROP POLICY IF EXISTS "booking_slots_insert_by_agent" ON booking_slots;
DROP POLICY IF EXISTS "booking_slots_update_by_agent" ON booking_slots;
DROP POLICY IF EXISTS "booking_slots_delete_by_agent" ON booking_slots;
DROP POLICY IF EXISTS "booking_slots_service_role" ON booking_slots;

-- RLS Policies: Anyone can view booking slots (for booking purposes)
CREATE POLICY "booking_slots_select_all" ON booking_slots 
  FOR SELECT 
  USING (true);

-- Only agents can insert their own slots
CREATE POLICY "booking_slots_insert_by_agent" ON booking_slots 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Only agents can update their own slots
CREATE POLICY "booking_slots_update_by_agent" ON booking_slots 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Only agents can delete their own slots
CREATE POLICY "booking_slots_delete_by_agent" ON booking_slots 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = booking_slots.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "booking_slots_service_role" ON booking_slots 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_booking_slots_updated_at 
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON booking_slots TO service_role;
GRANT ALL ON booking_slots TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ booking_slots table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Table structure:';
  RAISE NOTICE '   - id, agent_id, date, start_time, end_time';
  RAISE NOTICE '   - booked, booked_by, booking_id, notes';
  RAISE NOTICE '   - created_at, updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS Policies configured:';
  RAISE NOTICE '   - Public can view all slots';
  RAISE NOTICE '   - Agents can CRUD their own slots';
  RAISE NOTICE '   - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Booking slots feature is ready!';
END $$;
