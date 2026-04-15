import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const RecruiterInternships = () => {
  const { user } = useAuth();

  const { data: internships, isLoading } = useQuery({
    queryKey: ["recruiter-internships", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").eq("posted_by", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Internships</h2>
          <p className="text-muted-foreground mt-1">View all internships you've posted.</p>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Stipend</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships?.map((i, idx) => (
                  <TableRow key={i.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>{i.company}</TableCell>
                    <TableCell className="text-muted-foreground">{i.location || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{i.stipend || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{i.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecruiterInternships;
