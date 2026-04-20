import { useState, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Calendar, Sparkles, Filter } from "lucide-react";
import { getSmartInternshipStatus, calcSkillMatch, parseStipendNumber } from "@/lib/internshipUtils";
import { cn } from "@/lib/utils";

const StudentInternships = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [stipendRange, setStipendRange] = useState("all");
  const [applyId, setApplyId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: internships, isLoading } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
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

  const studentSkills = (profile as any)?.skills ?? [];

  // Build filter option lists from data.
  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    internships?.forEach((i) => i.location && set.add(i.location));
    return Array.from(set).sort();
  }, [internships]);

  const skillOptions = useMemo(() => {
    const set = new Set<string>();
    internships?.forEach((i: any) => (i.skills ?? []).forEach((s: string) => s && set.add(s)));
    return Array.from(set).sort();
  }, [internships]);

  const filtered = useMemo(() => {
    return internships?.filter((i: any) => {
      if (i.status !== "active") return false;
      const q = search.toLowerCase();
      if (q && !(i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q))) return false;
      if (locationFilter !== "all" && i.location !== locationFilter) return false;
      if (skillFilter !== "all") {
        const skills: string[] = i.skills ?? [];
        if (!skills.map((s) => s.toLowerCase()).includes(skillFilter.toLowerCase())) return false;
      }
      if (stipendRange !== "all") {
        const n = parseStipendNumber(i.stipend);
        if (n === null) return false;
        if (stipendRange === "0-10000" && !(n <= 10000)) return false;
        if (stipendRange === "10000-25000" && !(n > 10000 && n <= 25000)) return false;
        if (stipendRange === "25000-50000" && !(n > 25000 && n <= 50000)) return false;
        if (stipendRange === "50000+" && !(n > 50000)) return false;
      }
      return true;
    });
  }, [internships, search, locationFilter, skillFilter, stipendRange]);

  const resetFilters = () => {
    setSearch("");
    setLocationFilter("all");
    setSkillFilter("all");
    setStipendRange("all");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Browse Internships</h2>
          <p className="text-muted-foreground mt-1">Find and apply to internship opportunities.</p>
        </div>

        {/* Search + Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locationOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> Skill</Label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All skills</SelectItem>
                    {skillOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><span className="text-xs">₹</span> Stipend Range</Label>
                <Select value={stipendRange} onValueChange={setStipendRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ranges</SelectItem>
                    <SelectItem value="0-10000">Up to ₹10,000</SelectItem>
                    <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
                    <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                    <SelectItem value="50000+">₹50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  <Filter className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((internship: any) => {
              const applied = myApps?.includes(internship.id);
              const smart = getSmartInternshipStatus(internship.deadline, internship.status);
              const requiredSkills: string[] = internship.skills ?? [];
              const match = calcSkillMatch(requiredSkills, studentSkills);
              const showMatch = requiredSkills.length > 0;
              return (
                <Card key={internship.id} className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{internship.title}</CardTitle>
                        <CardDescription className="font-medium">{internship.company}</CardDescription>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0", smart.className)}>{smart.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-1">
                    {internship.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{internship.location}</div>}
                    {internship.stipend && <div className="flex items-center gap-2 text-muted-foreground"><span className="font-medium text-xs">₹</span>{internship.stipend}</div>}
                    {internship.deadline && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{new Date(internship.deadline).toLocaleDateString()}</div>}
                    <p className="text-muted-foreground line-clamp-3 pt-1">{internship.description}</p>

                    {requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {requiredSkills.slice(0, 5).map((s) => {
                          const has = studentSkills.map((x: string) => x.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <Badge
                              key={s}
                              variant="outline"
                              className={cn(
                                "text-xs",
                                has
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent"
                                  : "bg-muted text-muted-foreground border-transparent",
                              )}
                            >
                              {s}
                            </Badge>
                          );
                        })}
                        {requiredSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{requiredSkills.length - 5}</Badge>
                        )}
                      </div>
                    )}

                    {showMatch && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> Skill Match</span>
                          <span className="font-semibold">{match.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              match.percent >= 70 ? "bg-emerald-500" : match.percent >= 40 ? "bg-amber-500" : "bg-destructive",
                            )}
                            style={{ width: `${match.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-3">
                    {applied ? (
                      <Badge variant="secondary" className="px-3 py-1">✓ Applied</Badge>
                    ) : smart.key === "expired" ? (
                      <Badge variant="outline" className="px-3 py-1 text-muted-foreground">Closed</Badge>
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
