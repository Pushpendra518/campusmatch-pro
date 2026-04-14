import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, GraduationCap, Building2, Shield, BarChart3 } from "lucide-react";

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
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PlaceHub</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="outline">Login</Button></Link>
          <Link to="/register"><Button>Sign Up</Button></Link>
        </div>
      </div>
    </header>

    <section className="container mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
        Internship & Placement<br />Management System
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        A complete platform connecting students, recruiters, faculty, and placement cells — all powered by real-time data.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/register"><Button size="lg">Get Started</Button></Link>
        <Link to="/login"><Button size="lg" variant="outline">Login</Button></Link>
      </div>
    </section>

    <section className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-6">
            <f.icon className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} PlaceHub. Built with Lovable Cloud.
    </footer>
  </div>
);

export default Landing;
