import { useState, KeyboardEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

const RecruiterPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", company: "", description: "", location: "", stipend: "", requirements: "", deadline: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.map((s) => s.toLowerCase()).includes(v.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internships").insert({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        posted_by: user!.id,
        skills,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Internship posted!" });
      navigate("/dashboard/recruiter/internships");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Post New Internship</h2>
          <p className="text-muted-foreground mt-1">Create a new internship listing for students to apply.</p>
        </div>
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Internship Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Frontend Developer Intern" /></div>
            <div className="space-y-2"><Label>Company *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Tech Corp" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe the role and responsibilities..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bangalore, India" /></div>
              <div className="space-y-2"><Label>Stipend</Label><Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="₹15,000/month" /></div>
            </div>
            <div className="space-y-2"><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Skills and qualifications needed..." /></div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey}
                  placeholder="e.g. React, Node.js (Enter to add)"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 min-h-[1.5rem]">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                      aria-label={`Remove ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.title || !form.company} className="shadow-sm">
              {mutation.isPending ? "Posting..." : "Post Internship"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterPost;
