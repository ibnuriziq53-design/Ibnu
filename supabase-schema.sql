-- Copy and run this in your Supabase SQL Editor

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'guru', 'siswa');

-- Extend the auth.users table implicitly by creating a public.users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'siswa'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create an RPC function to delete a user securely by an admin
CREATE OR REPLACE FUNCTION delete_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Cek apakah yang menghapus adalah admin
  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    -- Hapus dari auth.users. Cascading akan menghapus data di public.users, public.students, dll.
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Tidak memiliki hak akses untuk menghapus pengguna';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pastikan search path menyertakan auth untuk penghapusan
ALTER FUNCTION delete_user(target_user_id UUID) SET search_path = public, auth;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  assigned_role public.user_role;
BEGIN
  -- Cek apakah ini user pertama
  SELECT NOT EXISTS (SELECT 1 FROM public.users) INTO is_first_user;
  
  IF is_first_user THEN
    assigned_role := 'admin'::public.user_role;
  ELSE
    assigned_role := 'siswa'::public.user_role;
  END IF;

  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id, 
    COALESCE(new.email, ''), 
    COALESCE(new.raw_user_meta_data->>'name', new.email, 'Siswa Baru'),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;
    
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Tangkap semua error agar pendaftaran (auth.users) tidak dibatalkan / gagal
  -- Boleh log error secara internal jika diperlukan
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Students table to store additional info
CREATE TABLE public.students (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);

-- Create Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow all operations for guru and admin" ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru'))
);

-- Create Exams table
CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow all operations for guru and admin" ON public.exams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru'))
);

-- Create Exam Questions mapping table
CREATE TABLE public.exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  UNIQUE(exam_id, question_id)
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to exam_questions" ON public.exam_questions FOR SELECT USING (true);
CREATE POLICY "Allow all operations for guru and admin" ON public.exam_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru'))
);

-- Create Results table
CREATE TABLE public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, exam_id)
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert results" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);
