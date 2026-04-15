
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_type TEXT NOT NULL DEFAULT 'online',
  meeting_link TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  rating INTEGER,
  comments TEXT,
  selection_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Recruiters can view interviews they created
CREATE POLICY "Recruiters can view their interviews"
ON public.interviews FOR SELECT
USING (auth.uid() = recruiter_id);

-- Recruiters can insert interviews
CREATE POLICY "Recruiters can create interviews"
ON public.interviews FOR INSERT
WITH CHECK (auth.uid() = recruiter_id AND has_role(auth.uid(), 'recruiter'::app_role));

-- Recruiters can update their interviews (for feedback)
CREATE POLICY "Recruiters can update their interviews"
ON public.interviews FOR UPDATE
USING (auth.uid() = recruiter_id);

-- Students can view interviews for their applications
CREATE POLICY "Students can view their interviews"
ON public.interviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = interviews.application_id
    AND applications.student_id = auth.uid()
  )
);

-- Admins can view all interviews
CREATE POLICY "Admins can view all interviews"
ON public.interviews FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Faculty can view all interviews
CREATE POLICY "Faculty can view all interviews"
ON public.interviews FOR SELECT
USING (has_role(auth.uid(), 'faculty'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
