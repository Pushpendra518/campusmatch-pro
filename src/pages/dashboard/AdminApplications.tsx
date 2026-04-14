import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      // Fetch student profiles
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
        <h2 className="text-2xl font-bold">All Applications</h2>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.student_profile?.full_name || "—"}</TableCell>
                    <TableCell className="font-medium">{app.internships?.title}</TableCell>
                    <TableCell>{app.internships?.company}</TableCell>
                    <TableCell className="capitalize">{app.status}</TableCell>
                    <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
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
