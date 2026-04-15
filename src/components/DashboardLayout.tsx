import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Briefcase, FileText, Users, UserCircle, LogOut, PlusCircle, ClipboardList, Building2, CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const menuByRole = {
  student: [
    { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
    { title: "Internships", url: "/dashboard/student/internships", icon: Briefcase },
    { title: "My Applications", url: "/dashboard/student/applications", icon: FileText },
    { title: "Profile", url: "/dashboard/student/profile", icon: UserCircle },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Internships", url: "/dashboard/admin/internships", icon: Briefcase },
    { title: "Applications", url: "/dashboard/admin/applications", icon: ClipboardList },
    { title: "Users", url: "/dashboard/admin/users", icon: Users },
  ],
  faculty: [
    { title: "Dashboard", url: "/dashboard/faculty", icon: LayoutDashboard },
    { title: "Applications", url: "/dashboard/faculty/applications", icon: ClipboardList },
    { title: "Internships", url: "/dashboard/faculty/internships", icon: Briefcase },
  ],
  recruiter: [
    { title: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard },
    { title: "Post Internship", url: "/dashboard/recruiter/post", icon: PlusCircle },
    { title: "My Internships", url: "/dashboard/recruiter/internships", icon: Building2 },
    { title: "Applicants", url: "/dashboard/recruiter/applicants", icon: Users },
    { title: "Interviews", url: "/dashboard/recruiter/interviews", icon: CalendarCheck },
  ],
};

function AppSidebar() {
  const { profile, role, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const items = role ? menuByRole[role] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* User info */}
        <div className="p-4 pb-3">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-sidebar-foreground truncate">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
        <Separator />
        <SidebarGroup className="flex-1 py-3">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 px-4 mb-1">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-sidebar-accent"
                      activeClassName="bg-primary/10 text-primary hover:bg-primary/15"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator />
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={async () => { await signOut(); navigate("/"); }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h1 className="text-base font-semibold tracking-tight">PlaceHub</h1>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
