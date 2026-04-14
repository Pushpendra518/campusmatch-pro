import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";

const StudentDashboard = () => {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["student-stats", user?.id],
    queryFn: async () => {
      const { data: apps } = await supabase.from("applications").select("status").eq("student_id", user!.id);
      const { count: internshipCount } = await supabase.from("internships").select("*", { count: "exact", head: true }).eq("status", "active");
      return {
        total: apps?.length ?? 0,
        pending: apps?.filter((a) => a.status === "pending").length ?? 0,
        shortlisted: apps?.filter((a) => a.status === "shortlisted").length ?? 0,
        internships: internshipCount ?? 0,
      };
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {profile?.full_name || "Student"}!</h2>
          <p className="text-muted-foreground">Here's your placement overview.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.internships ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.total ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.pending ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.shortlisted ?? 0}</div></CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
