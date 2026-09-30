-- ============================================================
-- TwoLyp Database Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Gardens table
CREATE TABLE IF NOT EXISTS public.gardens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '我们的花园',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Garden members (max 2 per garden)
CREATE TABLE IF NOT EXISTS public.garden_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(garden_id, user_id)
);

-- Enforce max 2 members per garden
CREATE OR REPLACE FUNCTION public.check_garden_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM public.garden_members
  WHERE garden_id = NEW.garden_id;

  IF member_count >= 2 THEN
    RAISE EXCEPTION '花园最多只允许两位成员';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_member_limit ON public.garden_members;
CREATE TRIGGER enforce_member_limit
  BEFORE INSERT ON public.garden_members
  FOR EACH ROW EXECUTE FUNCTION public.check_garden_member_limit();

-- 4. Invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ DEFAULT NULL
);

-- 5. Records table
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'daily' CHECK (category IN ('daily', 'travel', 'food', 'anniversary', 'custom')),
  custom_tags TEXT[] DEFAULT '{}',
  location_name TEXT DEFAULT '',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_journey BOOLEAN DEFAULT FALSE,
  journey_id UUID,
  recorded_at DATE DEFAULT CURRENT_DATE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Media table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  thumbnail_url TEXT,
  original_url TEXT,
  compressed_url TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#F5A623',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(garden_id, name)
);

-- 9. Anniversaries table
CREATE TABLE IF NOT EXISTS public.anniversaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT DEFAULT '',
  is_lunar BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anniversaries ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Gardens: members can read their garden
CREATE POLICY "gardens_select_member" ON public.gardens
  FOR SELECT USING (
    id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "gardens_insert_creator" ON public.gardens
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Garden members: members can read, owner can insert
CREATE POLICY "garden_members_select" ON public.garden_members
  FOR SELECT USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "garden_members_insert" ON public.garden_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invite codes: members can read, only unused codes can be selected for joining
CREATE POLICY "invite_codes_select" ON public.invite_codes
  FOR SELECT USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "invite_codes_insert" ON public.invite_codes
  FOR INSERT WITH CHECK (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

-- Records: garden members can read/write
CREATE POLICY "records_select" ON public.records
  FOR SELECT USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "records_insert" ON public.records
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "records_update" ON public.records
  FOR UPDATE USING (
    auth.uid() = author_id AND
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "records_delete" ON public.records
  FOR DELETE USING (
    auth.uid() = author_id AND
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

-- Media: garden members can read/write
CREATE POLICY "media_select" ON public.media
  FOR SELECT USING (
    record_id IN (
      SELECT id FROM public.records WHERE garden_id IN (
        SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "media_insert" ON public.media
  FOR INSERT WITH CHECK (
    record_id IN (
      SELECT id FROM public.records WHERE author_id = auth.uid()
    )
  );

-- Comments: garden members can read/write
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (
    record_id IN (
      SELECT id FROM public.records WHERE garden_id IN (
        SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Tags: garden members can read/write
CREATE POLICY "tags_select" ON public.tags
  FOR SELECT USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "tags_insert" ON public.tags
  FOR INSERT WITH CHECK (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

-- Anniversaries: garden members can read/write
CREATE POLICY "anniversaries_select" ON public.anniversaries
  FOR SELECT USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "anniversaries_insert" ON public.anniversaries
  FOR INSERT WITH CHECK (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "anniversaries_update" ON public.anniversaries
  FOR UPDATE USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

CREATE POLICY "anniversaries_delete" ON public.anniversaries
  FOR DELETE USING (
    garden_id IN (SELECT garden_id FROM public.garden_members WHERE user_id = auth.uid())
  );

-- ============================================================
-- Helper function: generate invite code
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invite_code(garden_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := upper(substring(md5(random()::text || garden_uuid::text) from 1 for 6));
  INSERT INTO public.invite_codes (garden_id, code) VALUES (garden_uuid, new_code);
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
