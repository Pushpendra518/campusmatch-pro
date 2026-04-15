import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import InterviewForm from "@/components/interviews/InterviewForm";

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Applicants</h2>
          <p className="text-muted-foreground mt-1">Review and manage candidates for your internships.</p>
        </div>
        {isLoading ? <p>Loading...</p> : applications?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No applicants yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Internship</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Resume</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Interview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any, i: number) => (
                  <TableRow key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium">{app.student_profile?.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{app.student_profile?.email}</TableCell>
                    <TableCell>{app.internships?.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{app.status}</Badge></TableCell>
                    <TableCell>
                      {app.student_profile?.resume_url ? (
                        <a href={app.student_profile.resume_url} target="_blank" rel="noreferrer" className="text-primary font-medium text-sm hover:underline">View</a>
                      ) : <span className="text-muted-foreground">—</span>}
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
                    <TableCell>
                      <InterviewForm applicationId={app.id} studentName={app.student_profile?.full_name ?? "Student"} />
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
