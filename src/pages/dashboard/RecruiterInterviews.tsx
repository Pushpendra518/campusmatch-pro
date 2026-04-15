import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import InterviewList from "@/components/interviews/InterviewList";

const RecruiterInterviews = () => {
  const { user } = useAuth();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["recruiter-interviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("recruiter_id", user!.id)
        .order("interview_date", { ascending: true });
      if (error) throw error;

      // Fetch application + student + internship details
      const appIds = [...new Set(data?.map((i) => i.application_id) ?? [])];
      if (appIds.length === 0) return [];

      const { data: apps } = await supabase
        .from("applications")
        .select("id, student_id, internship_id, internships(title, company)")
        .in("id", appIds);

      const studentIds = [...new Set(apps?.map((a) => a.student_id) ?? [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);

      return (
        data?.map((interview) => {
          const app = apps?.find((a) => a.id === interview.application_id);
          const student = profiles?.find((p) => p.user_id === app?.student_id);
          return {
            ...interview,
            student_name: student?.full_name ?? "Unknown",
            student_email: student?.email ?? "",
            internship_title: (app?.internships as any)?.title ?? "",
            company: (app?.internships as any)?.company ?? "",
          };
        }) ?? []
      );
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Interviews</h2>
        <InterviewList interviews={interviews ?? []} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default RecruiterInterviews;
