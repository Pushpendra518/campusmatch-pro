import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const RecruiterPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", company: "", description: "", location: "", stipend: "", requirements: "", deadline: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internships").insert({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        posted_by: user!.id,
      });
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
        <h2 className="text-2xl font-bold mb-6">Post New Internship</h2>
        <Card>
          <CardHeader><CardTitle>Internship Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Company *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Stipend</Label><Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} /></div>
            </div>
            <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.title || !form.company}>
              {mutation.isPending ? "Posting..." : "Post Internship"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterPost;
