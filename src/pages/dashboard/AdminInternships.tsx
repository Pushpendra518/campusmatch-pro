import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const AdminInternships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", description: "", location: "", stipend: "", requirements: "", deadline: "" });

  const { data: internships, isLoading } = useQuery({
    queryKey: ["admin-internships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internships").insert({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        posted_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Internship created!" });
      queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
      setOpen(false);
      setForm({ title: "", company: "", description: "", location: "", stipend: "", requirements: "", deadline: "" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("internships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Internship deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Internships</h2>
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Internship</Button>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stipend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships?.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>{i.company}</TableCell>
                    <TableCell>{i.location || "—"}</TableCell>
                    <TableCell>{i.stipend || "—"}</TableCell>
                    <TableCell className="capitalize">{i.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(i.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Internship</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Stipend</Label><Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} /></div>
            </div>
            <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.company}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminInternships;
