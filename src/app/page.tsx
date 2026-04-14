"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Compass,
  MessageSquare,
  FileText,
  Briefcase,
  Map,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  BarChart3,
  Brain,
  Target,
  Rocket,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Career Counselor",
      description:
        "Get personalized career advice from our intelligent chatbot trained on industry data and best practices.",
      color: "from-forest to-forest-light",
      href: "/chat",
    },
    {
      icon: FileText,
      title: "Resume Analyzer",
      description:
        "Upload your resume for an instant AI-powered analysis with actionable feedback, ATS scoring, and improvement tips.",
      color: "from-emerald-500 to-green-400",
      href: "/resume",
    },
    {
      icon: Briefcase,
      title: "Job Matching",
      description:
        "Find roles that match your skills and interests with AI-powered matching and personalized job recommendations.",
      color: "from-forest-dark to-forest",
      href: "/jobs",
    },
    {
      icon: Map,
      title: "Career Roadmap",
      description:
        "Get a detailed, step-by-step roadmap for transitioning to your dream career with milestones and resources.",
      color: "from-green-600 to-emerald-500",
      href: "/roadmap",
    },
  ];

  const stats = [
    { value: "10K+", label: "Career Plans Generated", icon: TrendingUp },
    { value: "50K+", label: "Resumes Analyzed", icon: FileText },
    { value: "98%", label: "User Satisfaction", icon: Star },
    { value: "5K+", label: "Jobs Matched", icon: Briefcase },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Sign up and tell us about your skills, experience, and career goals.",
      icon: Users,
    },
    {
      step: "02",
      title: "Get AI Analysis",
      description: "Our AI analyzes your profile, resume, and preferences to provide insights.",
      icon: Brain,
    },
    {
      step: "03",
      title: "Follow Your Roadmap",
      description: "Receive personalized career roadmaps with actionable steps and milestones.",
      icon: Target,
    },
    {
      step: "04",
      title: "Land Your Dream Job",
      description: "Apply to matched jobs and ace interviews with AI-powered preparation.",
      icon: Rocket,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content:
        "CareerVista helped me transition from marketing to tech. The roadmap was incredibly detailed and the resume analyzer boosted my callbacks by 3x!",
      rating: 5,
    },
    {
      name: "David Adeyemi",
      role: "Data Scientist at Meta",
      content:
        "The AI counselor gave me guidance I couldn't get from traditional career coaches. The job matching feature found me opportunities I didn't even know existed.",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Product Manager at Stripe",
      content:
        "From updating my resume to preparing for interviews, CareerVista was my go-to platform. The career roadmap feature is an absolute game-changer.",
      rating: 5,
    },
  ];

  return (
    <div className="overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-150 h-150 rounded-full bg-forest-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-forest-50/60 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-forest-50/30 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #228B22 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-forest-50 text-forest px-4 py-2 rounded-full text-sm font-medium border border-forest-200">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Guidance
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Navigate Your{" "}
                <span className="gradient-text">Career Path</span>{" "}
                with Confidence
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Make informed career decisions with AI-powered resume analysis, personalized counseling, job matching, and detailed career roadmaps.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="xl" className="gap-2 group w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/resume">
                  <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                    <FileText className="w-4 h-4" />
                    Try Resume Analyzer
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                {["No credit card required", "Free AI analysis", "Instant results"].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                    {text}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative hidden lg:flex justify-center"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative w-full max-w-md xl:max-w-lg">
                <div className="bg-white rounded-2xl shadow-2xl border border-border/50 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-forest to-forest-light flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Career Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Your personalized overview</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Resume Score", value: "87", suffix: "/100" },
                      { label: "Matches", value: "24", suffix: " jobs" },
                      { label: "Progress", value: "65", suffix: "%" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-forest-50/50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-forest">
                          {stat.value}
                          <span className="text-sm font-normal text-forest-light">{stat.suffix}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Skills Match", value: 78 },
                      { label: "Experience", value: 92 },
                      { label: "Education", value: 85 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-forest">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-linear-to-r from-forest to-forest-light rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-border/50 p-3 sm:p-4 flex items-center gap-3 z-10"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Analysis</div>
                    <div className="text-xs text-muted-foreground">Processing complete</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-border/50 p-3 sm:p-4 flex items-center gap-3 z-10"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Job Match Found</div>
                    <div className="text-xs text-muted-foreground">95% compatibility</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-forest-50/30 border-y border-forest-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} variants={fadeUp} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-forest" />
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <div className="inline-flex items-center gap-2 bg-forest-50 text-forest px-4 py-2 rounded-full text-sm font-medium mb-6 border border-forest-200">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Everything You Need for <span className="gradient-text">Career Success</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Leverage cutting-edge AI to accelerate your career journey with our comprehensive suite of tools.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUp}>
                  <Link href={feature.href}>
                    <Card className="group h-full hover:border-forest/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 shrink-0 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold group-hover:text-forest transition-colors">{feature.title}</h3>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-forest group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-linear-to-b from-forest-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            {...fadeUp}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              How <span className="gradient-text">CareerVista</span> Works
            </h2>
            <p className="text-lg text-muted-foreground">Four simple steps to transform your career trajectory</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.step} variants={fadeUp} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-forest-200" />
                  )}
                  <div className="text-center space-y-4">
                    <div className="relative inline-flex">
                      <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-forest-100 flex items-center justify-center">
                        <Icon className="w-9 h-9 text-forest" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            {...fadeUp}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Professionals</span>
            </h2>
            <p className="text-lg text-muted-foreground">See how CareerVista has helped thousands advance their careers</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="h-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-forest to-forest-light flex items-center justify-center text-white font-semibold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-forest via-forest-light to-forest-dark p-12 lg:p-20 text-center text-white"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm border border-white/20">
                <Compass className="w-4 h-4" />
                Start Your Journey Today
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold">Ready to Transform Your Career?</h2>
              <p className="text-lg text-white/80">
                Join thousands of professionals who have accelerated their career growth with CareerVista&apos;s AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="xl" className="bg-white text-forest hover:bg-white/90 gap-2 group w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                    <MessageSquare className="w-4 h-4" />
                    Talk to AI Counselor
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
