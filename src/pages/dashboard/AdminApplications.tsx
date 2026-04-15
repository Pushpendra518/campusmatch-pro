import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data: apps, error } = await supabase
        .from("applications")
        .select("*, internships(title, company)")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const studentIds = [...new Set(apps?.map((a) => a.student_id) ?? [])];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", studentIds);
      return apps?.map((a) => ({ ...a, student_profile: profiles?.find((p) => p.user_id === a.student_id) })) ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Applications</h2>
          <p className="text-muted-foreground mt-1">Review and manage all student applications.</p>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Internship</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applied</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any, i: number) => (
                  <TableRow key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium">{app.student_profile?.full_name || "—"}</TableCell>
                    <TableCell>{app.internships?.title}</TableCell>
                    <TableCell className="text-muted-foreground">{app.internships?.company}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{app.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select value={app.status} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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

export default AdminApplications;
