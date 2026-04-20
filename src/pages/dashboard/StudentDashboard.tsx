import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

const StudentDashboard = () => {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["student-stats", user?.id],
    queryFn: async () => {
      const { data: apps } = await supabase.from("applications").select("status").eq("student_id", user!.id);
      const { count: internshipCount } = await supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "active");
      const isStatus = (a: any, s: string) => (a.status || "").toLowerCase() === s;
      return {
        total: apps?.length ?? 0,
        pending: apps?.filter((a) => isStatus(a, "pending")).length ?? 0,
        shortlisted: apps?.filter((a) => isStatus(a, "shortlisted")).length ?? 0,
        rejected: apps?.filter((a) => isStatus(a, "rejected")).length ?? 0,
        internships: internshipCount ?? 0,
      };
    },
    enabled: !!user,
  });

  const chartData = [
    { name: "Pending", value: stats?.pending ?? 0, color: "hsl(38 92% 50%)" },
    { name: "Shortlisted", value: stats?.shortlisted ?? 0, color: "hsl(262 83% 58%)" },
    { name: "Rejected", value: stats?.rejected ?? 0, color: "hsl(0 72% 51%)" },
  ];
  const hasChartData = chartData.some((d) => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {profile?.full_name || "Student"}! 👋</h2>
          <p className="text-muted-foreground mt-1">Here's your placement overview.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Available Internships" value={stats?.internships ?? 0} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title="My Applications" value={stats?.total ?? 0} icon={FileText} color="bg-blue-500/10 text-blue-600" />
          <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="Shortlisted" value={stats?.shortlisted ?? 0} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-600" />
          <StatCard title="Rejected" value={stats?.rejected ?? 0} icon={XCircle} color="bg-destructive/10 text-destructive" />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Application Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {hasChartData ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Apply to internships to see your breakdown.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
