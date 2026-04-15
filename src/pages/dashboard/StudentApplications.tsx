import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  shortlisted: "outline",
};

const StudentApplications = () => {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["student-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, internships(title, company)")
        .eq("student_id", user!.id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
          <p className="text-muted-foreground mt-1">Track the status of your internship applications.</p>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : applications?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No applications yet. Browse internships to apply!</p>
          </div>
        ) : (
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Internship</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applied</TableHead>
                  <TableHead className="font-semibold">Faculty Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any, i: number) => (
                  <TableRow key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium">{app.internships?.title}</TableCell>
                    <TableCell>{app.internships?.company}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[app.status] || "secondary"} className="capitalize">{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{app.faculty_comment || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentApplications;
