import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Building2 } from "lucide-react";

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

const AdminDashboard = () => {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: students },
        { count: internships },
        { count: applications },
        { count: recruiters },
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("internships").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "recruiter"),
      ]);
      return { students: students ?? 0, internships: internships ?? 0, applications: applications ?? 0, recruiters: recruiters ?? 0 };
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.full_name}. Here's the system overview.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats?.students ?? 0} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard title="Internships" value={stats?.internships ?? 0} icon={Briefcase} color="bg-violet-500/10 text-violet-600" />
          <StatCard title="Applications" value={stats?.applications ?? 0} icon={FileText} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="Recruiters" value={stats?.recruiters ?? 0} icon={Building2} color="bg-emerald-500/10 text-emerald-600" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
