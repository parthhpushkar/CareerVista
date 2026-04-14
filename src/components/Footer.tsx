import Link from "next/link";
import { Compass, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Compass className="w-5 h-5 text-forest-300" />
              </div>
              <span className="text-xl font-bold">CareerVista</span>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed">
              AI-powered career counseling platform helping you make informed career decisions with intelligent tools and personalized guidance.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <Icon className="w-4 h-4 text-forest-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4 text-forest-200">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/chat", label: "AI Counselor" },
                { href: "/resume", label: "Resume Analyzer" },
                { href: "/jobs", label: "Job Matching" },
                { href: "/roadmap", label: "Career Roadmap" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-forest-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-forest-200">Resources</h4>
            <ul className="space-y-2.5">
              {["Career Guide", "Resume Tips", "Interview Prep", "Salary Insights", "Blog"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-forest-400 hover:text-white transition">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-forest-200">Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "Privacy Policy", "Terms of Service", "Contact", "Support"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-forest-400 hover:text-white transition">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-forest-400">
            &copy; {new Date().getFullYear()} CareerVista. All rights reserved.
          </p>
          <p className="text-sm text-forest-400">
            Built with Next.js, Tailwind CSS & AI
          </p>
        </div>
      </div>
    </footer>
  );
}
