DO $$
DECLARE
  admin_uid uuid;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1;
  
  IF admin_uid IS NULL THEN
    RAISE NOTICE 'Admin account not found, skipping cleanup';
    RETURN;
  END IF;

  DELETE FROM public.interviews WHERE recruiter_id != admin_uid
    OR application_id IN (SELECT id FROM public.applications WHERE student_id != admin_uid);
  DELETE FROM public.applications WHERE student_id != admin_uid;
  DELETE FROM public.internships WHERE posted_by IS DISTINCT FROM admin_uid;
  DELETE FROM public.user_roles WHERE user_id != admin_uid;
  DELETE FROM public.profiles WHERE user_id != admin_uid;
  DELETE FROM auth.users WHERE id != admin_uid;
END $$;