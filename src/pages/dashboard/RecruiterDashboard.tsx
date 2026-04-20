import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Clock, CalendarCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

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
      let applicants = 0, shortlisted = 0, pending = 0, rejected = 0, selected = 0;
      let interviewsScheduled = 0;
      if (ids.length > 0) {
        const { data: apps } = await supabase.from("applications").select("id, status").in("internship_id", ids);
        applicants = apps?.length ?? 0;
        const isStatus = (a: any, s: string) => (a.status || "").toLowerCase() === s;
        shortlisted = apps?.filter((a) => isStatus(a, "shortlisted")).length ?? 0;
        pending = apps?.filter((a) => isStatus(a, "pending")).length ?? 0;
        rejected = apps?.filter((a) => isStatus(a, "rejected")).length ?? 0;
        const appIds = apps?.map((a) => a.id) ?? [];
        if (appIds.length > 0) {
          const { data: interviews } = await supabase.from("interviews").select("id, selection_status").in("application_id", appIds);
          interviewsScheduled = interviews?.length ?? 0;
          selected = interviews?.filter((i) => (i.selection_status || "").toLowerCase() === "selected").length ?? 0;
        }
      }
      return { internships: internships?.length ?? 0, applicants, shortlisted, pending, rejected, interviewsScheduled, selected };
    },
    enabled: !!user,
  });

  const chartData = [
    { name: "Applicants", value: stats?.applicants ?? 0 },
    { name: "Shortlisted", value: stats?.shortlisted ?? 0 },
    { name: "Interviews", value: stats?.interviewsScheduled ?? 0 },
    { name: "Selected", value: stats?.selected ?? 0 },
    { name: "Rejected", value: stats?.rejected ?? 0 },
  ];
  const hasChart = chartData.some((d) => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.full_name}. Manage your postings and candidates.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="My Internships" value={stats?.internships ?? 0} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title="Total Applicants" value={stats?.applicants ?? 0} icon={Users} color="bg-violet-500/10 text-violet-600" />
          <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="Interviews" value={stats?.interviewsScheduled ?? 0} icon={CalendarCheck} color="bg-blue-500/10 text-blue-600" />
          <StatCard title="Selected" value={stats?.selected ?? 0} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-600" />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {hasChart ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No data yet — post an internship and review applicants to see analytics.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
