import { useAuth } from "@workspace/replit-auth-web"
import { Link } from "wouter"
import { BookOpenCheck, FileText, CheckSquare, BrainCircuit, Presentation, CalendarDays, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { ModeToggle } from "@/components/mode-toggle"

export default function Landing() {
  const { isAuthenticated, login } = useAuth()

  const features = [
    { icon: FileText, title: "Lesson Plan", description: "Structured step-by-step plans tailored to your year level." },
    { icon: BookOpenCheck, title: "Worksheet", description: "Engaging practice activities with progressive difficulty." },
    { icon: CheckSquare, title: "Assessment", description: "Rubrics and tests aligned to curriculum standards." },
    { icon: BrainCircuit, title: "Classroom Activity", description: "Interactive group tasks and discussion prompts." },
    { icon: Presentation, title: "PowerPoint Outline", description: "Slide-by-slide content breakdowns ready to format." },
    { icon: CalendarDays, title: "Curriculum Planner", description: "Term overviews and sequence mapping." },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <BookOpenCheck className="w-6 h-6" />
            <span>AITeacher</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <Button onClick={() => login()} variant="default">Sign In</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Create Professional Teaching Resources in <span className="text-primary">Under 60 Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop spending your weekends planning. A precision tool built for time-poor Australian teachers—fast, confident, and genuinely useful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => login()} className="w-full sm:w-auto text-base gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/50 py-24 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need, instantly.</h2>
              <p className="text-muted-foreground">Select from six core resource types designed specifically for the classroom.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Card key={i} className="border-none shadow-sm bg-background hover-elevate">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Three steps to get your weekend back.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10" />
            {[
              { step: "1", title: "Choose Resource", desc: "Select the exact type of material you need." },
              { step: "2", title: "Enter Details", desc: "Provide subject, year level, and specific topic context." },
              { step: "3", title: "Generate Instantly", desc: "Copy, save, and use immediately in your classroom." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-6 shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <BookOpenCheck className="w-5 h-5 text-primary" />
            <span>AITeacher</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary transition-colors">Features</span>
            <span className="cursor-pointer hover:text-primary transition-colors">How it Works</span>
            <span className="cursor-pointer hover:text-primary transition-colors">FAQ</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
