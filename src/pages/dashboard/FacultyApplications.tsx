import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const FacultyApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewApp, setReviewApp] = useState<any>(null);
  const [comment, setComment] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["faculty-applications"],
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, faculty_comment }: { id: string; status: string; faculty_comment: string }) => {
      const { error } = await supabase.from("applications").update({ status, faculty_comment }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Application updated" });
      queryClient.invalidateQueries({ queryKey: ["faculty-applications"] });
      setReviewApp(null);
      setComment("");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Applications</h2>
          <p className="text-muted-foreground mt-1">Approve or reject student applications with comments.</p>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Internship</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Applied</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any, i: number) => (
                  <TableRow key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium">{app.student_profile?.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{app.student_profile?.department || "—"}</TableCell>
                    <TableCell>{app.internships?.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{app.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setReviewApp(app); setComment(app.faculty_comment || ""); }}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!reviewApp} onOpenChange={() => setReviewApp(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Application</DialogTitle></DialogHeader>
          {reviewApp && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="text-sm"><span className="font-medium">Student:</span> {reviewApp.student_profile?.full_name}</p>
                <p className="text-sm"><span className="font-medium">Internship:</span> {reviewApp.internships?.title} at {reviewApp.internships?.company}</p>
                <p className="text-sm"><span className="font-medium">Cover Letter:</span> {reviewApp.cover_letter || "None"}</p>
              </div>
              <Textarea placeholder="Add your comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => updateMutation.mutate({ id: reviewApp.id, status: "rejected", faculty_comment: comment })}>
              Reject
            </Button>
            <Button onClick={() => updateMutation.mutate({ id: reviewApp.id, status: "approved", faculty_comment: comment })}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FacultyApplications;
