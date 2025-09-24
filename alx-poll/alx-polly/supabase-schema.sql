-- ALX-AI Agents Polly - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  description text,
  options jsonb NOT NULL, -- Array of poll options as JSON
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- Optional expiration date
  is_active boolean NOT NULL DEFAULT true,
  allow_multiple_votes boolean NOT NULL DEFAULT false,
  show_results_before_voting boolean NOT NULL DEFAULT false
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option text NOT NULL, -- The option the user voted for
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure one vote per user per poll (unless multiple votes allowed)
  UNIQUE(poll_id, user_id)
);

-- Create poll_analytics table for tracking views and engagement
CREATE TABLE IF NOT EXISTS public.poll_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  view_count integer NOT NULL DEFAULT 0,
  unique_viewers integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_analytics_poll_id ON public.poll_analytics(poll_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls table
CREATE POLICY "Allow authenticated users to view active polls" ON public.polls
FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Allow users to view their own polls" ON public.polls
FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Allow authenticated users to create polls" ON public.polls
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow users to update their own polls" ON public.polls
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow users to delete their own polls" ON public.polls
FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- RLS Policies for votes table
CREATE POLICY "Allow authenticated users to view votes" ON public.votes
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to vote on polls" ON public.votes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.polls 
    WHERE id = poll_id AND is_active = true
  )
);

CREATE POLICY "Allow users to update their own votes" ON public.votes
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own votes" ON public.votes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for poll_analytics table
CREATE POLICY "Allow authenticated users to view analytics" ON public.poll_analytics
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow system to update analytics" ON public.poll_analytics
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_polls_updated_at 
  BEFORE UPDATE ON public.polls 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at 
  BEFORE UPDATE ON public.votes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_analytics_updated_at 
  BEFORE UPDATE ON public.poll_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get poll results
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid uuid)
RETURNS TABLE (
  option_text text,
  vote_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH vote_counts AS (
    SELECT 
      v.selected_option,
      COUNT(*) as votes
    FROM public.votes v
    WHERE v.poll_id = poll_uuid
    GROUP BY v.selected_option
  ),
  total_votes AS (
    SELECT COALESCE(SUM(votes), 0) as total
    FROM vote_counts
  )
  SELECT 
    vc.selected_option as option_text,
    vc.votes as vote_count,
    CASE 
      WHEN tv.total > 0 THEN ROUND((vc.votes::numeric / tv.total::numeric) * 100, 2)
      ELSE 0
    END as percentage
  FROM vote_counts vc
  CROSS JOIN total_votes tv
  ORDER BY vc.votes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can vote on poll
CREATE OR REPLACE FUNCTION can_user_vote(poll_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  poll_record public.polls%ROWTYPE;
  existing_vote_count integer;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record
  FROM public.polls
  WHERE id = poll_uuid AND is_active = true;
  
  -- Check if poll exists and is active
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has already voted (unless multiple votes allowed)
  IF NOT poll_record.allow_multiple_votes THEN
    SELECT COUNT(*) INTO existing_vote_count
    FROM public.votes
    WHERE poll_id = poll_uuid AND user_id = user_uuid;
    
    IF existing_vote_count > 0 THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment poll view count
CREATE OR REPLACE FUNCTION increment_poll_view(poll_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.poll_analytics (poll_id, view_count, unique_viewers, last_viewed_at)
  VALUES (poll_uuid, 1, 1, now())
  ON CONFLICT (poll_id) 
  DO UPDATE SET 
    view_count = poll_analytics.view_count + 1,
    last_viewed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.polls TO authenticated;
GRANT ALL ON public.votes TO authenticated;
GRANT ALL ON public.poll_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_poll_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_vote(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_poll_view(uuid) TO authenticated;

-- Insert sample data (optional - remove in production)
INSERT INTO public.polls (question, options, created_by) VALUES 
(
  'What is your favorite programming language?',
  '["JavaScript", "Python", "TypeScript", "Go", "Rust"]'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Tabs or spaces?',
  '["Tabs", "Spaces", "Both"]'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Create a view for poll statistics
CREATE OR REPLACE VIEW public.poll_stats AS
SELECT 
  p.id,
  p.question,
  p.created_by,
  p.created_at,
  p.is_active,
  COUNT(v.id) as total_votes,
  COUNT(DISTINCT v.user_id) as unique_voters,
  pa.view_count,
  pa.unique_viewers
FROM public.polls p
LEFT JOIN public.votes v ON p.id = v.poll_id
LEFT JOIN public.poll_analytics pa ON p.id = pa.poll_id
GROUP BY p.id, p.question, p.created_by, p.created_at, p.is_active, pa.view_count, pa.unique_viewers;

-- Grant access to the view
GRANT SELECT ON public.poll_stats TO authenticated;
