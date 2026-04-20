import { useState, useEffect, KeyboardEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Sparkles, FolderGit2, FileText, X, Plus } from "lucide-react";

const StudentProfile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  // Projects stored locally in browser (no schema column for it under current scope).
  const [projects, setProjects] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setDepartment(profile.department || "");
      setSkills(((profile as any).skills as string[]) || []);
    }
    if (user) {
      const stored = localStorage.getItem(`projects_${user.id}`);
      if (stored) setProjects(stored);
    }
  }, [profile, user]);

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

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, department, skills } as any)
      .eq("user_id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (user) localStorage.setItem(`projects_${user.id}`, projects);
      toast({ title: "Profile updated!" });
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload error", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(path);
    await supabase.from("profiles").update({ resume_url: publicUrl }).eq("user_id", user.id);
    toast({ title: "Resume uploaded!" });
    await refreshProfile();
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your personal information, skills, projects and resume.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 pb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label className="text-xs text-muted-foreground">Press Enter or comma to add a skill</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={onSkillKey}
                placeholder="e.g. React, Python, SQL"
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[2rem]">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills added yet.</p>
              ) : (
                skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1 text-sm">
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FolderGit2 className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs text-muted-foreground">List your notable projects (one per line)</Label>
            <Textarea
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              rows={5}
              placeholder={"Portfolio Website — React, Tailwind\nML Spam Classifier — Python, scikit-learn"}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-lg">Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
            {profile?.resume_url ? (
              <div className="space-y-2">
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Open resume in new tab →
                </a>
                {profile.resume_url.toLowerCase().endsWith(".pdf") && (
                  <div className="rounded-lg border overflow-hidden">
                    <iframe
                      src={profile.resume_url}
                      title="Resume preview"
                      className="w-full h-[420px]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="shadow-sm">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
