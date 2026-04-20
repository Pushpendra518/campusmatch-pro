import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { daysUntilInterview } from "@/lib/internshipUtils";
import { Timer } from "lucide-react";

interface Props {
  date: string | null | undefined;
  time?: string | null;
  className?: string;
}

const InterviewCountdown = ({ date, time, className }: Props) => {
  const days = daysUntilInterview(date, time);
  if (days === null) return null;

  let label: string;
  let cls: string;

  if (days < 0) {
    label = "Past";
    cls = "bg-muted text-muted-foreground border-transparent";
  } else if (days === 0) {
    label = "Today";
    cls = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent";
  } else if (days === 1) {
    label = "Tomorrow";
    cls = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent";
  } else if (days <= 7) {
    label = `In ${days} days`;
    cls = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent";
  } else {
    label = `In ${days} days`;
    cls = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent";
  }

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cls, className)}>
      <Timer className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default InterviewCountdown;
