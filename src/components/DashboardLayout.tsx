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
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm text-sidebar-foreground truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="mr-2 h-4 w-4" />
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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Internship & Placement Portal</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
