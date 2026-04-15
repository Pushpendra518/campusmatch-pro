import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

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
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.full_name}. Manage your postings and candidates.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My Internships" value={stats?.internships ?? 0} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title="Total Applicants" value={stats?.applicants ?? 0} icon={Users} color="bg-violet-500/10 text-violet-600" />
          <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="Shortlisted" value={stats?.shortlisted ?? 0} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-600" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
