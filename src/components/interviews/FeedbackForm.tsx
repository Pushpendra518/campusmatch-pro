import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";

const FeedbackForm = ({ interviewId }: { interviewId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");
  const [selectionStatus, setSelectionStatus] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("interviews")
        .update({
          rating: parseInt(rating),
          comments,
          selection_status: selectionStatus,
          status: "completed",
        })
        .eq("id", interviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Feedback submitted" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      setOpen(false);
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const isValid = rating && selectionStatus;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquarePlus className="mr-1 h-4 w-4" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Interview Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Rating (1–5)</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} — {["Poor", "Below Avg", "Average", "Good", "Excellent"][n - 1]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Comments</Label>
            <Textarea placeholder="Interview observations..." value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Selection Status</Label>
            <Select value={selectionStatus} onValueChange={setSelectionStatus}>
              <SelectTrigger><SelectValue placeholder="Select decision" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => submit.mutate()} disabled={!isValid || submit.isPending} className="w-full">
            {submit.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
