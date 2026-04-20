import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  return (
    <main className="mx-auto max-w-3xl p-6">
      <a href="/dashboard" className="text-sm text-gray-500 hover:underline">
        Back to dashboard
      </a>
      <h1 className="mt-4 text-2xl font-semibold">Simple Guide to Life</h1>
      <div>Placeholder for Simple Guide to Life</div>
    </main>
  );
}
