import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Shield, BellRing, BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Detection',
    description: 'Monitor transactions as they happen and identify suspicious behavior instantly.'
  },
  {
    icon: BrainCircuit,
    title: 'Behavioral Analysis',
    description: 'Compare spending patterns against trusted history and customer baselines.'
  },
  {
    icon: Shield,
    title: 'ML Risk Scoring',
    description: 'Combine rules, anomaly checks, and model probability to assess fraud risk.'
  },
  {
    icon: BellRing,
    title: 'Transaction Alerts',
    description: 'Alert users and operators when a decision requires review or intervention.'
  }
];

const steps = ['Transaction', 'Real-Time Processing', 'Behavioral Analysis', 'Rules + ML', 'Risk Score', 'Approved / Review / Blocked'];

export default function LandingPage() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">FinXGuard</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/user/login" className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-400">User Login</Link>
            <Link to="/admin/login" className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400">Admin Login</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
        {state?.logoutError && (
          <div role="alert" className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            You have been signed out on this device, but the server could not revoke the session: {state.logoutError}
          </div>
        )}
        <section className="py-2 md:py-4">
          <div className="max-w-[1100px] space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 text-[9px] text-emerald-300">✓</span>
              Real-Time Fraud Protection
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[980px] text-[clamp(3.5rem,6vw,8rem)] font-black leading-[0.9] tracking-[-0.06em] text-slate-200">
                Protect Every Transaction
                <span className="mt-2 block text-slate-400">Before Fraud Becomes<br />Loss</span>
              </h1>
            </div>

            <p className="max-w-[780px] text-[1.05rem] leading-[1.7] text-slate-300 md:text-[1.2rem]">
              FinXGuard combines behavioral analysis, fraud rules, and machine-learning risk scoring to evaluate
              transactions in real time.
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link to="/user/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-slate-950 transition hover:bg-emerald-400">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-6 py-3.5 text-base font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-400">
                Explore Protection
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mt-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group rounded-2xl border border-sky-700/40 bg-[#041b2b]/90 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40">
                <div className="mb-4 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{title}</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[28px] border border-sky-700/40 bg-[#071d2d] p-6 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-emerald-400">Built for real-time financial protection</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">Trusted fraud defense controls</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              'Real-Time Processing',
              'Behavioral Analysis',
              'Rule-Based Detection',
              'Machine Learning',
              'Audit Ledger',
              'Role-Based Access'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-sky-700/50 bg-[#031827] px-4 py-3 text-sm text-slate-200 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.05)]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[28px] border border-sky-700/40 bg-[#071d2d] p-5 md:mt-16 md:p-8">
          <div className="mb-6 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-emerald-400 md:text-xs">How it works</p>
            <h2 className="mx-auto mt-4 max-w-4xl text-[clamp(2rem,3.5vw,3.5rem)] font-bold leading-tight tracking-[-0.045em] text-white">
              From payment event to final
              <span className="block">decision</span>
            </h2>
          </div>

          <div className="mx-auto max-w-5xl space-y-2.5 md:space-y-3">
            {steps.map((step) => (
              <div
                key={step}
                className="flex min-h-14 items-center justify-center rounded-xl border border-sky-700/45 bg-[#031827] px-4 py-3 text-center text-base font-medium tracking-[-0.015em] text-slate-200 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.05)] md:min-h-16 md:text-lg"
              >
                {step}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        </div>
      </footer>
    </div>
  );
}
