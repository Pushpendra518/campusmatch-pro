import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarPlus } from "lucide-react";

interface InterviewFormProps {
  applicationId: string;
  studentName: string;
}

const InterviewForm = ({ applicationId, studentName }: InterviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");

  const schedule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("interviews").insert({
        application_id: applicationId,
        recruiter_id: user!.id,
        interview_date: date,
        interview_time: time,
        interview_type: type,
        meeting_link: type === "online" ? meetingLink : null,
        location: type === "offline" ? location : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Interview scheduled successfully" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-applicants"] });
      setOpen(false);
      setDate(""); setTime(""); setType("online"); setMeetingLink(""); setLocation("");
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const isValid = date && time && (type === "online" ? meetingLink : location);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CalendarPlus className="mr-1 h-4 w-4" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview — {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "online" && (
            <div className="space-y-2">
              <Label>Meeting Link *</Label>
              <Input placeholder="https://meet.google.com/..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
            </div>
          )}
          {type === "offline" && (
            <div className="space-y-2">
              <Label>Location / Address *</Label>
              <Input placeholder="Room 201, Block A..." value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          )}
          <Button onClick={() => schedule.mutate()} disabled={!isValid || schedule.isPending} className="w-full">
            {schedule.isPending ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewForm;
