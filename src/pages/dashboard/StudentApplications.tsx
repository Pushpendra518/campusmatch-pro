import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Video, MapPin, Link as LinkIcon } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  shortlisted: "outline",
};

const StudentApplications = () => {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["student-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, internships(title, company)")
        .eq("student_id", user!.id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const applicationIds = applications?.map((a) => a.id) ?? [];

  const { data: interviews } = useQuery({
    queryKey: ["student-interviews", applicationIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .in("application_id", applicationIds);
      if (error) throw error;
      return data;
    },
    enabled: applicationIds.length > 0,
  });

  const interviewByApp = (appId: string) =>
    interviews?.find((iv) => iv.application_id === appId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
          <p className="text-muted-foreground mt-1">Track the status of your internship applications.</p>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : applications?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No applications yet. Browse internships to apply!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Internship</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Applied</TableHead>
                    <TableHead className="font-semibold">Faculty Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((app: any, i: number) => (
                    <TableRow key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <TableCell className="font-medium">{app.internships?.title}</TableCell>
                      <TableCell>{app.internships?.company}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[app.status] || "secondary"} className="capitalize">{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{app.faculty_comment || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Interview Details Section */}
            {interviews && interviews.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Scheduled Interviews</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {applications?.map((app: any) => {
                    const iv = interviewByApp(app.id);
                    if (!iv) return null;
                    return (
                      <Card key={iv.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{app.internships?.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{app.internships?.company}</p>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{new Date(iv.interview_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{iv.interview_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {iv.interview_type === "online" ? (
                              <Video className="h-4 w-4 text-primary" />
                            ) : (
                              <MapPin className="h-4 w-4 text-primary" />
                            )}
                            <Badge variant="outline" className="capitalize">{iv.interview_type}</Badge>
                          </div>

                          {iv.interview_type === "online" && iv.meeting_link && (
                            <div className="flex items-center gap-2 pt-1">
                              <LinkIcon className="h-4 w-4 text-primary" />
                              <a
                                href={iv.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline truncate max-w-[200px]"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}

                          {iv.interview_type === "offline" && iv.location && (
                            <div className="flex items-center gap-2 pt-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{iv.location}</span>
                            </div>
                          )}

                          <Badge variant="secondary" className="capitalize mt-1">{iv.status}</Badge>

                          {iv.selection_status && (
                            <div className="pt-1">
                              <Badge variant={iv.selection_status === "selected" ? "default" : "destructive"} className="capitalize">
                                {iv.selection_status}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentApplications;
