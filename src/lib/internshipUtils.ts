// Helpers for internship status, application status, and skill matching.
// Pure UI logic — no backend changes.

export type SmartStatus = "active" | "closing-soon" | "expired";

export interface SmartStatusInfo {
  key: SmartStatus;
  label: string;
  className: string; // tailwind classes for badge
}

export const getSmartInternshipStatus = (
  deadline: string | null | undefined,
  status: string,
): SmartStatusInfo => {
  if (status !== "active") {
    return {
      key: "expired",
      label: "Inactive",
      className: "bg-muted text-muted-foreground border-transparent",
    };
  }
  if (!deadline) {
    return {
      key: "active",
      label: "Active",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent",
    };
  }
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return {
      key: "expired",
      label: "Expired",
      className: "bg-destructive/15 text-destructive border-transparent",
    };
  }
  if (diffDays <= 5) {
    return {
      key: "closing-soon",
      label: `Closing in ${diffDays}d`,
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
    };
  }
  return {
    key: "active",
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent",
  };
};

// Skill matching — case-insensitive intersection over required count.
export const calcSkillMatch = (
  required: string[] | null | undefined,
  studentSkills: string[] | null | undefined,
): { percent: number; matched: string[]; missing: string[] } => {
  const req = (required ?? []).map((s) => s.trim()).filter(Boolean);
  const have = new Set((studentSkills ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean));
  if (req.length === 0) return { percent: 0, matched: [], missing: [] };
  const matched: string[] = [];
  const missing: string[] = [];
  for (const r of req) {
    if (have.has(r.toLowerCase())) matched.push(r);
    else missing.push(r);
  }
  return { percent: Math.round((matched.length / req.length) * 100), matched, missing };
};

// Application status → colored badge classes.
export const getAppStatusBadge = (
  status: string,
): { label: string; className: string } => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "selected":
    case "approved":
      return {
        label: s === "approved" ? "Approved" : "Selected",
        className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-destructive/15 text-destructive border-transparent",
      };
    case "shortlisted":
      return {
        label: "Shortlisted",
        className: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-transparent",
      };
    case "interview":
    case "interview scheduled":
    case "interview_scheduled":
      return {
        label: "Interview Scheduled",
        className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent",
      };
    case "under review":
    case "under_review":
      return {
        label: "Under Review",
        className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-transparent",
      };
    case "applied":
      return {
        label: "Applied",
        className: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-transparent",
      };
    case "pending":
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending",
        className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
      };
  }
};

// Parse a stipend free-text string into a numeric monthly value (best-effort).
export const parseStipendNumber = (stipend: string | null | undefined): number | null => {
  if (!stipend) return null;
  const cleaned = stipend.replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1]);
};

// Days until interview (negative if past). Returns null if invalid.
export const daysUntilInterview = (
  date: string | null | undefined,
  time?: string | null,
): number | null => {
  if (!date) return null;
  const iso = time ? `${date}T${time}` : `${date}T00:00:00`;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const diff = t - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Relative time formatter (e.g. "2 hours ago").
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const yr = Math.floor(mo / 12);
  return `${yr} year${yr === 1 ? "" : "s"} ago`;
};
