import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

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

const FacultyDashboard = () => {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["faculty-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("status");
      return {
        total: data?.length ?? 0,
        pending: data?.filter((a) => a.status === "pending").length ?? 0,
        approved: data?.filter((a) => a.status === "approved").length ?? 0,
        rejected: data?.filter((a) => a.status === "rejected").length ?? 0,
      };
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.full_name}. Review student applications below.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Applications" value={stats?.total ?? 0} icon={FileText} color="bg-primary/10 text-primary" />
          <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="Approved" value={stats?.approved ?? 0} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-600" />
          <StatCard title="Rejected" value={stats?.rejected ?? 0} icon={XCircle} color="bg-red-500/10 text-red-600" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
