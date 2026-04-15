import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

const StudentProfile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setDepartment(profile.department || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, department }).eq("user_id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
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
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your personal information and resume.</p>
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
            <div className="space-y-2">
              <Label>Resume</Label>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-sm text-primary font-medium hover:underline">
                  View current resume →
                </a>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving} className="shadow-sm">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
