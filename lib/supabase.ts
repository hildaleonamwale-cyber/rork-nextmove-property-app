import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rrmahskolpeylywgwbow.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybWFoc2tvbHBleWx5d2d3Ym93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjg4MTUsImV4cCI6MjA3NjUwNDgxNX0.vvaqSGlM5v2xkROuHYgWWFNIorJ9lZ-mwl91MFP6L6o";

export const supabase = createClient(supabaseUrl, supabaseKey);
