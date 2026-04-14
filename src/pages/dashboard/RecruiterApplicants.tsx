import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const RecruiterApplicants = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["recruiter-applicants", user?.id],
    queryFn: async () => {
      const { data: internships } = await supabase.from("internships").select("id").eq("posted_by", user!.id);
      const ids = internships?.map((i) => i.id) ?? [];
      if (ids.length === 0) return [];
      const { data: apps, error } = await supabase
        .from("applications")
        .select("*, internships(title, company)")
        .in("internship_id", ids)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const studentIds = [...new Set(apps?.map((a) => a.student_id) ?? [])];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", studentIds);
      return apps?.map((a) => ({ ...a, student_profile: profiles?.find((p) => p.user_id === a.student_id) })) ?? [];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-applicants"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Applicants</h2>
        {isLoading ? <p>Loading...</p> : applications?.length === 0 ? (
          <p className="text-muted-foreground">No applicants yet.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.student_profile?.full_name}</TableCell>
                    <TableCell>{app.student_profile?.email}</TableCell>
                    <TableCell>{app.internships?.title}</TableCell>
                    <TableCell className="capitalize">{app.status}</TableCell>
                    <TableCell>
                      {app.student_profile?.resume_url ? (
                        <a href={app.student_profile.resume_url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">View</a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={app.status} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
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

export default RecruiterApplicants;
