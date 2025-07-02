-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('viewer', 'participant', 'community_leader', 'admin');
CREATE TYPE challenge_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE submission_type AS ENUM ('livestream', 'video');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation_points INTEGER DEFAULT 0,
  role user_role DEFAULT 'participant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities table
CREATE TABLE public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community memberships
CREATE TABLE public.community_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status challenge_status DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge submissions
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  submission_type submission_type NOT NULL,
  content_url TEXT NOT NULL, -- YouTube/Twitch URL or video file URL
  thumbnail_url TEXT,
  vote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Votes table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, user_id)
);

-- Reputation history
CREATE TABLE public.reputation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  related_challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50) NOT NULL, -- 'challenges_completed', 'votes_received', 'streak', etc.
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (many-to-many)
CREATE TABLE public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'challenge_reminder', 'new_challenge', 'vote_received', etc.
  is_read BOOLEAN DEFAULT false,
  related_challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  related_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_reputation ON public.profiles(reputation_points DESC);
CREATE INDEX idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX idx_community_memberships_community ON public.community_memberships(community_id);
CREATE INDEX idx_challenges_community ON public.challenges(community_id);
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_submissions_challenge ON public.submissions(challenge_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_votes ON public.submissions(vote_count DESC);
CREATE INDEX idx_votes_submission ON public.votes(submission_id);
CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Communities: Public read, leaders can update
CREATE POLICY "Communities are viewable by everyone" ON public.communities
  FOR SELECT USING (true);

CREATE POLICY "Community leaders can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = leader_id);

-- Community memberships: Users can view and manage their own memberships
CREATE POLICY "Users can view community memberships" ON public.community_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own memberships" ON public.community_memberships
  FOR ALL USING (auth.uid() = user_id);

-- Challenges: Public read, community leaders can manage
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Community leaders can manage challenges" ON public.challenges
  FOR ALL USING (
    auth.uid() IN (
      SELECT leader_id FROM public.communities WHERE id = community_id
    )
  );

-- Submissions: Public read, users can manage their own
CREATE POLICY "Submissions are viewable by everyone" ON public.submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own submissions" ON public.submissions
  FOR ALL USING (auth.uid() = user_id);

-- Votes: Users can view and manage their own votes
CREATE POLICY "Votes are viewable by everyone" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own votes" ON public.votes
  FOR ALL USING (auth.uid() = user_id);

-- Reputation history: Users can view their own history
CREATE POLICY "Users can view their own reputation history" ON public.reputation_history
  FOR SELECT USING (auth.uid() = user_id);

-- Badges: Public read
CREATE POLICY "Badges are viewable by everyone" ON public.badges
  FOR SELECT USING (true);

-- User badges: Users can view their own badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications: Users can view and manage their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for community member count
CREATE TRIGGER update_community_member_count_trigger
  AFTER INSERT OR DELETE ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Function to update submission vote count
CREATE OR REPLACE FUNCTION update_submission_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.submissions 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.submissions 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for submission vote count
CREATE TRIGGER update_submission_vote_count_trigger
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_submission_vote_count();

-- Insert default badges
INSERT INTO public.badges (name, description, requirement_type, requirement_value) VALUES
('First Challenge', 'Complete your first challenge', 'challenges_completed', 1),
('Challenge Veteran', 'Complete 5 challenges', 'challenges_completed', 5),
('Challenge Master', 'Complete 25 challenges', 'challenges_completed', 25),
('Popular Creator', 'Receive 10 votes on submissions', 'votes_received', 10),
('Community Favorite', 'Receive 50 votes on submissions', 'votes_received', 50),
('Consistent Contributor', 'Complete challenges for 4 weeks in a row', 'streak', 4);

