import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Faculty Dashboard</h2>
          <p className="text-muted-foreground">Welcome, {profile?.full_name}. Review student applications below.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Applications</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.pending}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.approved}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Rejected</CardTitle><XCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.rejected}</div></CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
