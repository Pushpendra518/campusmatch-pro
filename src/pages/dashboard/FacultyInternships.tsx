import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";

const FacultyInternships = () => {
  const { data: internships, isLoading } = useQuery({
    queryKey: ["faculty-internships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Internship Listings</h2>
          <p className="text-muted-foreground mt-1">Browse current active internship opportunities.</p>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {internships?.map((i) => (
              <Card key={i.id} className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{i.title}</CardTitle>
                  <CardDescription className="font-medium">{i.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {i.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{i.location}</div>}
                  {i.stipend && <div className="flex items-center gap-2 text-muted-foreground"><span className="font-medium text-xs">₹</span>{i.stipend}</div>}
                  {i.deadline && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{new Date(i.deadline).toLocaleDateString()}</div>}
                  <p className="text-muted-foreground leading-relaxed pt-1">{i.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyInternships;
