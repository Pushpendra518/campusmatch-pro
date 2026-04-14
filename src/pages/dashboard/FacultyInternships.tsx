import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, DollarSign, Calendar } from "lucide-react";

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
        <h2 className="text-2xl font-bold">Internship Listings</h2>
        {isLoading ? <p>Loading...</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {internships?.map((i) => (
              <Card key={i.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{i.title}</CardTitle>
                  <CardDescription>{i.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {i.location && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{i.location}</div>}
                  {i.stipend && <div className="flex items-center gap-2"><DollarSign className="h-3 w-3" />{i.stipend}</div>}
                  {i.deadline && <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />{new Date(i.deadline).toLocaleDateString()}</div>}
                  <p className="text-muted-foreground">{i.description}</p>
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
