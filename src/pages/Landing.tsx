import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, GraduationCap, Building2, Shield, BarChart3, ArrowRight } from "lucide-react";

const features = [
  { icon: GraduationCap, title: "Student Portal", desc: "Browse internships, apply with one click, and track your application status in real time." },
  { icon: Building2, title: "Recruiter Hub", desc: "Post internships, review applicants, and shortlist top candidates effortlessly." },
  { icon: Users, title: "Faculty Review", desc: "Mentors can approve or reject student applications with detailed comments." },
  { icon: Shield, title: "Admin Control", desc: "Full oversight — manage users, internships, and applications from a single dashboard." },
  { icon: Briefcase, title: "Real Internships", desc: "All data is live from the database. No mock data, no static pages." },
  { icon: BarChart3, title: "Analytics", desc: "Track placement stats, application trends, and student engagement." },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">PlaceHub</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link to="/register"><Button size="sm">Sign Up <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="container mx-auto px-6 pt-20 pb-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
        <Briefcase className="h-3.5 w-3.5" /> Internship & Placement Platform
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
        Your Gateway to
        <span className="text-primary block mt-1">Career Success</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        A complete platform connecting students, recruiters, faculty, and placement cells — all powered by real-time data.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/register"><Button size="lg" className="px-8 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        <Link to="/login"><Button size="lg" variant="outline" className="px-8">Login</Button></Link>
      </div>
    </section>

    {/* Features */}
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Everything You Need</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Powerful tools for every stakeholder in the placement process.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-card/30">
      © {new Date().getFullYear()} PlaceHub. Built with Lovable Cloud.
    </footer>
  </div>
);

export default Landing;
