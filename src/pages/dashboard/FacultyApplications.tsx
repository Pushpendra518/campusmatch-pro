import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
      const { data, error } = await supabase
        .from("applications")
        .select("*, internships(title, company), profiles!applications_student_id_fkey(full_name, email, department)")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
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
        <h2 className="text-2xl font-bold">Review Applications</h2>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.profiles?.full_name}</TableCell>
                    <TableCell>{app.profiles?.department || "—"}</TableCell>
                    <TableCell>{app.internships?.title}</TableCell>
                    <TableCell className="capitalize">{app.status}</TableCell>
                    <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
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
              <p><strong>Student:</strong> {reviewApp.profiles?.full_name}</p>
              <p><strong>Internship:</strong> {reviewApp.internships?.title} at {reviewApp.internships?.company}</p>
              <p><strong>Cover Letter:</strong> {reviewApp.cover_letter || "None"}</p>
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
