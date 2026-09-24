'use client';

import { useState } from 'react';

type Website = {
  id: string;
  title: string;
  subdomain: string;
  status: 'Published' | 'Draft';
  views: string;
  lastEdited: string;
};

const initialWebsites: Website[] = [
  { id: '1', title: 'CoffeeShop Landing', subdomain: 'coffeebloom.cristal.page', status: 'Published', views: '3.2k', lastEdited: 'Oct 5, 2024' },
  { id: '2', title: 'Designer Portfolio', subdomain: 'lunadesign.cristal.page', status: 'Draft', views: '842', lastEdited: 'Oct 4, 2024' },
];

export default function DashboardPage() {
  const [websites] = useState(initialWebsites);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-3xl font-bold text-transparent">💎 Cristal Builder Dashboard</h1>
        <button className="rounded-xl bg-purple-600 px-5 py-2.5 font-semibold shadow-lg shadow-purple-900/30 transition hover:bg-purple-500">+ Build New Website with AI</button>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard label="Active Websites" value="5" hint="+2 this month" />
        <StatCard label="AI Credits Left" value="1240" color="text-purple-400" />
        <StatCard label="Total Visitors" value="12.4k" color="text-indigo-400" />
        <StatCard label="Current Plan" value="Pro (499 THB/month)" color="text-amber-400" small />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Your Websites</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-slate-800 text-sm text-slate-400"><th className="px-4 py-3">Website</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Last Edited</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody>{websites.map((site) => <tr key={site.id} className="border-b border-slate-800/50 transition hover:bg-slate-800/30"><td className="px-4 py-4 font-medium"><p>{site.title}</p><span className="text-xs text-slate-400">{site.subdomain}</span></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${site.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{site.status}</span></td><td className="px-4 py-4">{site.views}</td><td className="px-4 py-4 text-sm text-slate-400">{site.lastEdited}</td><td className="px-4 py-4 text-right"><button className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-medium transition hover:bg-slate-700">Edit</button></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, hint, color = 'text-white', small = false }: { label: string; value: string; hint?: string; color?: string; small?: boolean }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">{label}</p><h3 className={`${small ? 'text-lg' : 'text-3xl'} mt-2 font-bold ${color}`}>{value} {hint && <span className="text-xs font-normal text-green-400">{hint}</span>}</h3></div>;
}
