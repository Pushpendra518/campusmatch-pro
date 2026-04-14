import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

const RecruiterDashboard = () => {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["recruiter-stats", user?.id],
    queryFn: async () => {
      const { data: internships } = await supabase.from("internships").select("id").eq("posted_by", user!.id);
      const ids = internships?.map((i) => i.id) ?? [];
      let applicants = 0, shortlisted = 0, pending = 0;
      if (ids.length > 0) {
        const { data: apps } = await supabase.from("applications").select("status").in("internship_id", ids);
        applicants = apps?.length ?? 0;
        shortlisted = apps?.filter((a) => a.status === "shortlisted").length ?? 0;
        pending = apps?.filter((a) => a.status === "pending").length ?? 0;
      }
      return { internships: internships?.length ?? 0, applicants, shortlisted, pending };
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Recruiter Dashboard</h2>
          <p className="text-muted-foreground">Welcome, {profile?.full_name}. Manage your postings and candidates.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">My Internships</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.internships}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Applicants</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.applicants}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.pending}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Shortlisted</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.shortlisted}</div></CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
