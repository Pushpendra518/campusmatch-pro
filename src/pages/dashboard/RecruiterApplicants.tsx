import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import InterviewForm from "@/components/interviews/InterviewForm";
import StatusBadge from "@/components/StatusBadge";
import { calcSkillMatch } from "@/lib/internshipUtils";
import { cn } from "@/lib/utils";
import { Star, ArrowUpDown } from "lucide-react";

type SortMode = "recent" | "match";

const RecruiterApplicants = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sortMode, setSortMode] = useState<SortMode>("match");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["recruiter-applicants", user?.id],
    queryFn: async () => {
      const { data: internships } = await supabase.from("internships").select("id, skills").eq("posted_by", user!.id);
      const ids = internships?.map((i) => i.id) ?? [];
      if (ids.length === 0) return [];
      const { data: apps, error } = await supabase
        .from("applications")
        .select("*, internships(title, company, skills)")
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

  const enriched = useMemo(() => {
    return (applications ?? []).map((app: any) => {
      const required: string[] = app.internships?.skills ?? [];
      const studentSkills: string[] = (app.student_profile as any)?.skills ?? [];
      const match = calcSkillMatch(required, studentSkills);
      return { ...app, _match: match };
    });
  }, [applications]);

  const sorted = useMemo(() => {
    const arr = [...enriched];
    if (sortMode === "match") {
      arr.sort((a, b) => b._match.percent - a._match.percent);
    } else {
      arr.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
    }
    return arr;
  }, [enriched, sortMode]);

  const topThreshold = 70;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Applicants</h2>
            <p className="text-muted-foreground mt-1">Review and manage candidates for your internships.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort by
            </Label>
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Skill Match (high → low)</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? <p>Loading...</p> : sorted.length === 0 ? (
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
                  <TableHead className="font-semibold">Match</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Resume</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Interview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((app: any, i: number) => {
                  const isTop = app._match.percent >= topThreshold;
                  return (
                    <TableRow
                      key={app.id}
                      className={cn(
                        i % 2 === 0 ? "bg-background" : "bg-muted/20",
                        isTop && "ring-1 ring-inset ring-emerald-500/30",
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isTop && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Top candidate" />}
                          {app.student_profile?.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{app.student_profile?.email}</TableCell>
                      <TableCell>{app.internships?.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                app._match.percent >= 70 ? "bg-emerald-500" : app._match.percent >= 40 ? "bg-amber-500" : "bg-destructive",
                              )}
                              style={{ width: `${app._match.percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums w-10 text-right">{app._match.percent}%</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
                      <TableCell>
                        {app.student_profile?.resume_url ? (
                          <a href={app.student_profile.resume_url} target="_blank" rel="noreferrer" className="text-primary font-medium text-sm hover:underline">View</a>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Select value={app.status} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <InterviewForm applicationId={app.id} studentName={app.student_profile?.full_name ?? "Student"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {sorted.length > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Top candidates have a skill match of {topThreshold}% or higher.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecruiterApplicants;
