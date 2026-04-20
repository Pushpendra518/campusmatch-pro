import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAppStatusBadge } from "@/lib/internshipUtils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, className: cls } = getAppStatusBadge(status);
  return (
    <Badge variant="outline" className={cn("font-medium", cls, className)}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
