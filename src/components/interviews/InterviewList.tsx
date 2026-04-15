import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import FeedbackForm from "./FeedbackForm";

interface Interview {
  id: string;
  application_id: string;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  meeting_link?: string | null;
  location?: string | null;
  status: string;
  rating?: number | null;
  comments?: string | null;
  selection_status?: string | null;
  student_name: string;
  student_email: string;
  internship_title: string;
  company: string;
}

interface InterviewListProps {
  interviews: Interview[];
  isLoading: boolean;
}

const statusColor = (s: string) => {
  if (s === "completed") return "default";
  if (s === "cancelled") return "destructive";
  return "secondary";
};

const InterviewList = ({ interviews, isLoading }: InterviewListProps) => {
  if (isLoading) return <p>Loading interviews...</p>;
  if (interviews.length === 0) return <p className="text-muted-foreground">No interviews scheduled yet.</p>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Internship</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">{i.student_name}</TableCell>
              <TableCell>{i.internship_title} ({i.company})</TableCell>
              <TableCell>{new Date(i.interview_date).toLocaleDateString()}</TableCell>
              <TableCell>{i.interview_time}</TableCell>
              <TableCell className="capitalize">{i.interview_type}</TableCell>
              <TableCell>
                {i.interview_type === "online" && i.meeting_link ? (
                  <a href={i.meeting_link} target="_blank" rel="noreferrer" className="text-primary underline text-sm">Join Link</a>
                ) : i.location ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={statusColor(i.status)} className="capitalize">{i.status}</Badge>
              </TableCell>
              <TableCell>
                {i.rating ? (
                  <span className="text-sm">⭐ {i.rating}/5 — <span className="capitalize">{i.selection_status}</span></span>
                ) : (
                  <FeedbackForm interviewId={i.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterviewList;
