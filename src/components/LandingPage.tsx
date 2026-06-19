import React, { useState } from 'react';
import {
  LogIn,
  Award,
  BookOpen,
  GraduationCap,
  Clock,
  FileCheck,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Sparkles,
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Menu,
  X,
  FileDown
} from 'lucide-react';

interface LandingPageProps {
  loginWithGoogle: () => void;
}

export function LandingPage({ loginWithGoogle }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-violet-200/20 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200/50">
              SH
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Smart Student Hub</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#challenges" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Challenges</a>
            <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Impact & Benefits</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">FAQs</a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={loginWithGoogle}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-4 space-y-3 animate-in slide-in-from-top-5 duration-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-600 hover:text-indigo-600 py-1"
            >
              Features
            </a>
            <a
              href="#challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-600 hover:text-indigo-600 py-1"
            >
              Challenges
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-600 hover:text-indigo-600 py-1"
            >
              Impact & Benefits
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-600 hover:text-indigo-600 py-1"
            >
              FAQs
            </a>
            <hr className="border-slate-100 my-2" />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                loginWithGoogle();
              }}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Dynamic Portfolios</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Centralize, Verify & Showcase{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Your Student Achievements
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Academic excellence, certifications, leadership roles, and extracurriculars often get lost in scattered paper records. Smart Student Hub bridges this gap, enabling you to build a verified, shareable digital portfolio backed by faculty approval.
            </p>

            {/* Google Login CTA */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
              <button
                onClick={loginWithGoogle}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.726 5.726 0 0 1 8.2 12.8a5.726 5.726 0 0 1 5.79-5.8 5.672 5.672 0 0 1 4.07 1.697l3.226-3.227A10.144 10.144 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.76 0 9.96-4.05 9.96-10 0-.68-.08-1.314-.21-1.715H12.24z" />
                </svg>
                <span>Get Started with Google</span>
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200"
              >
                <span>Explore Features</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Micro-metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">Digital Verification</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1-Click</p>
                <p className="text-xs text-slate-500 font-medium">Portfolio PDF Export</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Zero</p>
                <p className="text-xs text-slate-500 font-medium">Paperwork Required</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dashboard Mockup */}
          <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none pt-10 lg:pt-0">
            <div className="relative bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800/80 aspect-[4/3] flex flex-col justify-between overflow-hidden">
              {/* Decorative light */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header inside mockup */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-800/60 px-2.5 py-0.5 rounded-md">
                  Student Dashboard Preview
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 grid grid-cols-12 gap-3 pt-3">
                {/* Mini Profile Card */}
                <div className="col-span-4 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                      JD
                    </div>
                    <div className="font-semibold text-white text-xs truncate">John Doe</div>
                    <div className="text-[9px] text-indigo-400 font-medium truncate">Computer Science</div>
                  </div>
                  <div className="border-t border-slate-700/50 pt-2 space-y-1.5">
                    <div>
                      <div className="text-[8px] text-slate-500">GPA</div>
                      <div className="text-xs font-bold text-white">9.24</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-500">Verified Credits</div>
                      <div className="text-xs font-bold text-emerald-400">18 Cr</div>
                    </div>
                  </div>
                </div>

                {/* Activity Tracker Preview Card */}
                <div className="col-span-8 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/40">
                    <span className="text-[10px] font-semibold text-slate-200">Recent Activities</span>
                    <span className="text-[8px] text-indigo-400 font-medium hover:underline cursor-pointer">View Tracker</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-2 pt-2">
                    {/* Activity Row 1 */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[9px] text-white font-medium truncate w-24">AWS Cloud Practitioner</span>
                      </div>
                      <span className="text-[8px] font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                        APPROVED
                      </span>
                    </div>

                    {/* Activity Row 2 */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[9px] text-white font-medium truncate w-24">Intro to ML (Coursera)</span>
                      </div>
                      <span className="text-[8px] font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                        APPROVED
                      </span>
                    </div>

                    {/* Activity Row 3 */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[9px] text-white font-medium truncate w-24">Summer Internship</span>
                      </div>
                      <span className="text-[8px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                        PENDING
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar of mockup */}
              <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-400">Faculty reviewer online</span>
                </div>
                <div className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors">
                  <FileDown className="w-2.5 h-2.5" />
                  <span>Download Portfolio PDF</span>
                </div>
              </div>
            </div>

            {/* Glowing accents behind preview */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-500/5 -z-10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Challenges & Solution Section */}
      <section id="challenges" className="bg-slate-100/60 py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wider">The Academic Dilemma</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Scattered Achievements vs. Unified Credibility
            </p>
            <p className="text-slate-600 leading-relaxed">
              Students excel in a wide array of activities—both academic and extracurricular. Yet, capturing and validating this growth remains an operational bottleneck.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* The Challenges Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 text-red-600">
                <XCircle className="w-7 h-7" />
                <h3 className="text-xl font-bold text-slate-900">Traditional Scattered Records</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-sm font-semibold">Scattered Achievements</strong>
                    <span className="text-slate-600 text-sm">Records are hosted in separate departmental drives, sheets, or offline files.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-sm font-semibold">Lost Paper Documents</strong>
                    <span className="text-slate-600 text-sm">Hard-copy certificates, transcripts, and credentials are easily misplaced or damaged.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-sm font-semibold">Unverified Resumes</strong>
                    <span className="text-slate-600 text-sm">Recruiters find it hard to validate students' self-reported extra-curricular claims.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-sm font-semibold">Missed Career Placements</strong>
                    <span className="text-slate-600 text-sm">Students miss out on scholarships and internships due to lack of a structured showcase.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* The Solution Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl border border-indigo-950 space-y-6">
              <div className="flex items-center space-x-3 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
                <h3 className="text-xl font-bold text-white">The Smart Student Hub Solution</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-indigo-200 block text-sm font-semibold">Centralized Digital Platform</strong>
                    <span className="text-indigo-100/80 text-sm">Document conferences, certificates, volunteering, and internships in one unified dashboard.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-indigo-200 block text-sm font-semibold">Verified Faculty Approval</strong>
                    <span className="text-indigo-100/80 text-sm">Faculty monitors evaluate uploaded proofs directly to ensure maximum credibility.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-indigo-200 block text-sm font-semibold">Dynamic Auto-Generated Portfolios</strong>
                    <span className="text-indigo-100/80 text-sm">Generate printable PDFs or shareable web links containing verified achievements with one click.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <div>
                    <strong className="text-indigo-200 block text-sm font-semibold">Real-Time Performance Dashboard</strong>
                    <span className="text-indigo-100/80 text-sm">Monitor credit calculations and academic cgpa.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wider">Features</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              A Platform Engineered for Excellence
            </p>
            <p className="text-slate-600 leading-relaxed">
              Explore the key core components built to assist students and university administrators in keeping achievement records clean, reliable, and accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature 1 */}
            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dynamic Student Dashboard</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Stay updated in real time on your overall GPA and credit-based activity milestones from one clean layout.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Activity Tracker</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Easily upload certificates, write reports, categorize hours, and submit details for online courses, internships, and extracurriculars.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Faculty Approval Panel</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Direct faculty-student communication loop. Faculty monitors can approve or reject activities instantly, ensuring profile credibility.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Auto-Generated Portfolios</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Compile your verified activities into structured markdown documents. Download as formal PDFs to support your job applications.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact & Benefits Section */}
      <section id="impact" className="bg-slate-50 py-20 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wider">Impact & Benefits</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Value Offered Across the Institution
            </p>
            <p className="text-slate-600 leading-relaxed">
              Smart Student Hub builds a holistic data network that changes how achievements are viewed, valued, and utilized by all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Impact 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Empowerment for Students</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Access a dynamic, central resume ready for job fairs, graduate school applications, and campus placements. Your verified profile proves your active, multi-disciplinary development.
              </p>
            </div>

            {/* Impact 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Faculty Productivity & Ease</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Eliminate stacks of paper forms and complex email threads. Faculty review and approve files through a web panel, making validation quick and digital.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12 space-y-4">
            <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wider">Frequently Asked Questions</h2>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">Got Questions?</p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">How are activities verified?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                When a student uploads an activity, they include a certificate or proof along with credit estimates. Designated faculty members can review these documents from their dashboard and mark them Approved or Rejected.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Can I export my portfolio to PDF?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Yes! From the student dashboard, clicking "Generate Portfolio PDF" uses AI to compile your approved achievements into a structured layout, which you can immediately save as a PDF.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">What roles are available?</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                The platform supports two main roles: <strong>Student</strong> (to track and submit achievements) and <strong>Faculty</strong> (to review, approve, and filter student entries).
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-slate-900 text-white relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Build Your Verified Portfolio?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join other students and faculty members. Log in now with your Google Account to centralize your credentials.
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={loginWithGoogle}
              className="flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-600/20 hover:-translate-y-1 hover:shadow-indigo-600/35"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.726 5.726 0 0 1 8.2 12.8a5.726 5.726 0 0 1 5.79-5.8 5.672 5.672 0 0 1 4.07 1.697l3.226-3.227A10.144 10.144 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.76 0 9.96-4.05 9.96-10 0-.68-.08-1.314-.21-1.715H12.24z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              SH
            </div>
            <span className="font-semibold text-slate-400">Smart Student Hub</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Smart Student Hub. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
