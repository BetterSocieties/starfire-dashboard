import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Starfire Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Signed in as {user.email}</p>
      <nav className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href="/dashboard/bs" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          Better Societies
        </a>
        <a href="/dashboard/sgtl" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          Simple Guide to Life
        </a>
        <a href="/dashboard/echo-studio" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          Echo Studio
        </a>
        <a href="/dashboard/opsfuel" className="rounded border border-gray-200 p-4 hover:bg-gray-50">
          OpsFuel
        </a>
      </nav>
    </main>
  );
}
