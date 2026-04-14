
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'admin', 'faculty', 'recruiter');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  department TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create internships table
CREATE TABLE public.internships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  stipend TEXT DEFAULT '',
  deadline TIMESTAMP WITH TIME ZONE,
  type TEXT DEFAULT 'internship',
  requirements TEXT DEFAULT '',
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_letter TEXT DEFAULT '',
  faculty_comment TEXT DEFAULT '',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, internship_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all profiles if admin" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Recruiters can view student profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Faculty can view student profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Internships policies
CREATE POLICY "Anyone authenticated can view active internships" ON public.internships
  FOR SELECT TO authenticated USING (status = 'active' OR posted_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert internships" ON public.internships
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Admins can update internships" ON public.internships
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR posted_by = auth.uid());

CREATE POLICY "Admins can delete internships" ON public.internships
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Applications policies
CREATE POLICY "Students can view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications" ON public.applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Faculty can view all applications" ON public.applications
  FOR SELECT USING (public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Recruiters can view applications for their internships" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.internships
      WHERE internships.id = applications.internship_id
      AND internships.posted_by = auth.uid()
    )
  );

CREATE POLICY "Students can insert applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Admins can update applications" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Faculty can update applications" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Recruiters can update their internship applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.internships
      WHERE internships.id = applications.internship_id
      AND internships.posted_by = auth.uid()
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

CREATE POLICY "Users can upload their own resume" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resume" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');
