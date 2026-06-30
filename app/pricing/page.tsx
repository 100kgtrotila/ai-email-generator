import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-8 inline-block transition-colors">
            &larr; Back to Home
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl sm:leading-tight sm:tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-xl text-slate-500">
            Start for free, upgrade when you need more power and custom tones.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="flex flex-col rounded-2xl bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/60 p-8 transition-all hover:shadow-indigo-500/20">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Free</h3>
              <p className="mt-2 text-sm text-slate-500">Perfect for trying out the AI generator.</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                $0
                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
              </div>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
              {['20 AI Emails per day', '3 Standard Tones', 'Basic Email Lengths', 'Community Support'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Current Plan</Link>
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="flex flex-col rounded-2xl bg-indigo-900 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-900 p-8 relative overflow-hidden transition-all hover:shadow-indigo-500/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-indigo-500/20">
              <Sparkles className="w-64 h-64" />
            </div>
            <div className="relative z-10 mb-6">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 mb-4">
                Most Popular
              </span>
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <p className="mt-2 text-sm text-indigo-200">For power users and professionals.</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $9
                <span className="ml-1 text-xl font-medium text-indigo-200">/mo</span>
              </div>
            </div>
            <ul className="relative z-10 flex-1 space-y-4 mb-8">
              {['Unlimited AI Emails', 'All Premium Tones', 'Custom Context & Instructions', 'Priority Support'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-indigo-100">
                  <Check className="h-5 w-5 text-indigo-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="relative z-10 w-full bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg" asChild>
              <Link href="/login">Upgrade to Pro</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
