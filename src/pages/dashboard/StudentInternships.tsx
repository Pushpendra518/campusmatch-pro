import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, DollarSign, Calendar } from "lucide-react";

const StudentInternships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [applyId, setApplyId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: internships, isLoading } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myApps } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("internship_id").eq("student_id", user!.id);
      return data?.map((a) => a.internship_id) ?? [];
    },
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async ({ internshipId, coverLetter }: { internshipId: string; coverLetter: string }) => {
      const { error } = await supabase.from("applications").insert({ student_id: user!.id, internship_id: internshipId, cover_letter: coverLetter });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Application submitted!" });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setApplyId(null);
      setCoverLetter("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = internships?.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Browse Internships</h2>
          <p className="text-muted-foreground mt-1">Find and apply to internship opportunities.</p>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by title or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((internship) => {
              const applied = myApps?.includes(internship.id);
              return (
                <Card key={internship.id} className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{internship.title}</CardTitle>
                    <CardDescription className="font-medium">{internship.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-1">
                    {internship.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{internship.location}</div>}
                    {internship.stipend && <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-3.5 w-3.5" />{internship.stipend}</div>}
                    {internship.deadline && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{new Date(internship.deadline).toLocaleDateString()}</div>}
                    <p className="text-muted-foreground line-clamp-3 pt-1">{internship.description}</p>
                  </CardContent>
                  <CardFooter className="pt-3">
                    {applied ? (
                      <Badge variant="secondary" className="px-3 py-1">✓ Applied</Badge>
                    ) : (
                      <Button size="sm" onClick={() => setApplyId(internship.id)} className="shadow-sm">Apply Now</Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        {filtered?.length === 0 && !isLoading && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No internships found.</p>
          </div>
        )}
      </div>

      <Dialog open={!!applyId} onOpenChange={() => setApplyId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Internship</DialogTitle></DialogHeader>
          <Textarea placeholder="Write a cover letter (optional)..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyId(null)}>Cancel</Button>
            <Button onClick={() => applyMutation.mutate({ internshipId: applyId!, coverLetter })} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentInternships;
