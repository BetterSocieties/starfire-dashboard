'use client';

import { useState, FormEvent } from 'react';

const EDGE_FUNCTION_URL =
  'https://qcmxbmxamrqzqifhyzbj.supabase.co/functions/v1/bs-qualification-submit';

type FormState = {
  full_name: string;
  email: string;
  company_name: string;
  role: string;
  form_prospect_type_choice: string;
  ai_use_cases: string[];
  annual_revenue_range: string;
  ai_act_deadline_target: string;
  marketing_budget_range: string;
  investor_check_size_stage: string;
  desired_outcome: string;
  timing: string;
  website: string;
};

type SubmitResult = {
  ok: boolean;
  submission_id?: string;
  fit_tier?: 'high' | 'medium' | 'low';
  cal_url?: string;
  error?: string;
  retry_after_seconds?: number;
};

const INITIAL: FormState = {
  full_name: '',
  email: '',
  company_name: '',
  role: '',
  form_prospect_type_choice: '',
  ai_use_cases: [],
  annual_revenue_range: '',
  ai_act_deadline_target: '',
  marketing_budget_range: '',
  investor_check_size_stage: '',
  desired_outcome: '',
  timing: '',
  website: '',
};

const PROSPECT_CHOICES = [
  'Compliance',
  'Founder AI startup',
  'Sponsor',
  'Investor',
  'Researcher/journalist/policymaker',
  'Accelerator',
  'Something else',
];

const AI_USE_CASE_OPTIONS = [
  'lending', 'hiring', 'credit_scoring', 'healthcare',
  'biometric_id', 'education_evaluation', 'marketing', 'ops_automation',
];

const REVENUE_OPTIONS = [
  { v: '', t: 'Select...' },
  { v: 'pre_revenue', t: 'Pre-revenue' },
  { v: '0_250k', t: 'Under EUR 250K' },
  { v: '250k_1m', t: 'EUR 250K to 1M' },
  { v: '1m_10m', t: 'EUR 1M to 10M' },
  { v: '10m_50m', t: 'EUR 10M to 50M' },
  { v: '50m_250m', t: 'EUR 50M to 250M' },
  { v: '250m_1b', t: 'EUR 250M to 1B' },
  { v: '1b_plus', t: 'EUR 1B+' },
];

const DEADLINE_OPTIONS = [
  { v: '', t: 'Select...' },
  { v: 'within_3_months', t: 'Within 3 months' },
  { v: '3_to_6_months', t: '3 to 6 months' },
  { v: '6_to_12_months', t: '6 to 12 months' },
  { v: '12_plus_months', t: '12+ months' },
  { v: 'not_sure', t: 'Not sure' },
];

const BUDGET_OPTIONS = [
  { v: '', t: 'Select...' },
  { v: '0_10k', t: 'Under EUR 10K' },
  { v: '10k_50k', t: 'EUR 10K to 50K' },
  { v: '50k_250k', t: 'EUR 50K to 250K' },
  { v: '250k_1m', t: 'EUR 250K to 1M' },
  { v: '1m_plus', t: 'EUR 1M+' },
];

const CHECK_SIZE_OPTIONS = [
  { v: '', t: 'Select...' },
  { v: '0_100k', t: 'Under EUR 100K' },
  { v: '100k_500k', t: 'EUR 100K to 500K' },
  { v: '500k_1m', t: 'EUR 500K to 1M' },
  { v: '1m_plus', t: 'EUR 1M+' },
];

const TIMING_OPTIONS = [
  { v: '', t: 'Select...' },
  { v: 'now', t: 'Now, actively searching' },
  { v: 'this_quarter', t: 'This quarter' },
  { v: 'within_6_months', t: 'Within 6 months' },
  { v: 'within_12_months', t: 'Within 12 months' },
  { v: 'just_exploring', t: 'Just exploring' },
];

export default function QualifyPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isCompliance = form.form_prospect_type_choice === 'Compliance';
  const isSponsor = form.form_prospect_type_choice === 'Sponsor';
  const isInvestor = form.form_prospect_type_choice === 'Investor';
  const isFounder = form.form_prospect_type_choice === 'Founder AI startup';

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function toggleUseCase(u: string) {
    setForm((s) => ({
      ...s,
      ai_use_cases: s.ai_use_cases.includes(u)
        ? s.ai_use_cases.filter((x) => x !== u)
        : [...s.ai_use_cases, u],
    }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    if (!form.full_name.trim()) return setErrorMsg('Full name is required.');
    if (!form.email.trim() || !form.email.includes('@')) return setErrorMsg('Valid email is required.');
    if (!form.company_name.trim()) return setErrorMsg('Company is required.');
    if (!form.role.trim()) return setErrorMsg('Role is required.');
    if (!form.form_prospect_type_choice) return setErrorMsg('Please pick a prospect type.');

    setStatus('submitting');
    try {
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: SubmitResult = await resp.json();
      if (resp.status === 429) {
        setStatus('error');
        setErrorMsg(`You recently submitted this form. Please wait ${data.retry_after_seconds ?? 300} seconds before resubmitting.`);
        return;
      }
      if (!resp.ok || !data.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setResult(data);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  if (status === 'success' && result) {
    const tier = result.fit_tier;
    const firstName = form.full_name.split(' ')[0];
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Thanks, {firstName}.</h1>
        {tier === 'high' ? (
          <>
            <p className="mt-4 text-gray-700">Your situation is exactly the kind we focus on.</p>
            <a href={result.cal_url} className="mt-6 inline-block rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
              Grab a time to discuss
            </a>
          </>
        ) : tier === 'medium' ? (
          <>
            <p className="mt-4 text-gray-700">Based on your situation, here are some resources to start with.</p>
            <a href={result.cal_url} className="mt-6 inline-block rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
              When you are ready to talk, grab a time
            </a>
          </>
        ) : (
          <>
            <p className="mt-4 text-gray-700">Based on your situation, our community is the best entry point.</p>
            <a href="https://community.bettersocieties.world" className="mt-6 inline-block rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
              Join the community
            </a>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Tell us about your situation</h1>
      <p className="mt-2 text-sm text-gray-600">A few questions so we can route you to the right next step.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px]"
        />

        <div>
          <label className="block text-sm font-medium">Full name *</label>
          <input type="text" required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Work email *</label>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Company *</label>
          <input type="text" required value={form.company_name} onChange={(e) => update('company_name', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Your role *</label>
          <input type="text" required value={form.role} onChange={(e) => update('role', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">What brings you here? *</label>
          <div className="mt-2 space-y-2">
            {PROSPECT_CHOICES.map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input type="radio" name="prospect" value={c} checked={form.form_prospect_type_choice === c} onChange={() => update('form_prospect_type_choice', c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        {(isCompliance || isFounder) && (
          <div>
            <label className="block text-sm font-medium">AI use cases (select all that apply)</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AI_USE_CASE_OPTIONS.map((u) => (
                <label key={u} className="flex items-center gap-2">
                  <input type="checkbox" checked={form.ai_use_cases.includes(u)} onChange={() => toggleUseCase(u)} />
                  <span className="text-sm">{u.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isCompliance && (
          <>
            <div>
              <label className="block text-sm font-medium">Annual revenue range</label>
              <select value={form.annual_revenue_range} onChange={(e) => update('annual_revenue_range', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
                {REVENUE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">AI Act deadline target</label>
              <select value={form.ai_act_deadline_target} onChange={(e) => update('ai_act_deadline_target', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
                {DEADLINE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          </>
        )}

        {isSponsor && (
          <div>
            <label className="block text-sm font-medium">Marketing budget range</label>
            <select value={form.marketing_budget_range} onChange={(e) => update('marketing_budget_range', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
              {BUDGET_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
            </select>
          </div>
        )}

        {isInvestor && (
          <div>
            <label className="block text-sm font-medium">Check size / stage</label>
            <select value={form.investor_check_size_stage} onChange={(e) => update('investor_check_size_stage', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
              {CHECK_SIZE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Desired outcome</label>
          <textarea value={form.desired_outcome} onChange={(e) => update('desired_outcome', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium">Timing</label>
          <select value={form.timing} onChange={(e) => update('timing', e.target.value)} className="mt-1 w-full rounded border border-gray-300 p-2">
            {TIMING_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
          </select>
        </div>

        {errorMsg && <p className="text-sm text-red-700">{errorMsg}</p>}

        <button type="submit" disabled={status === 'submitting'} className="w-full rounded bg-black p-3 text-white disabled:opacity-50">
          {status === 'submitting' ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </main>
  );
}
