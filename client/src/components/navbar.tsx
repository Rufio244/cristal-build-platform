import Link from 'next/link';

export default function Navbar() {
  return <header className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-soft"><Link href="/" className="flex items-center gap-2 text-3xl font-black text-violet"><span className="crystal-mark">✦</span>Cristal</Link><div className="hidden max-w-xl flex-1 px-10 md:block"><input placeholder="⌕  Search Cristal..." className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none" /></div><nav className="flex items-center gap-4 text-xl"><Link href="/dashboard" aria-label="Dashboard">⌂</Link><Link href="/builder" aria-label="Builder">＋</Link><Link href="/community" aria-label="Community">◉</Link><span>🔔</span><span className="avatar">C</span></nav></header>;
}
