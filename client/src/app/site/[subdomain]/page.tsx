import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default async function PublishedWebsite({ params }: { params: { subdomain: string } }) {
  const response = await fetch(`${API}/api/public/sites/${params.subdomain}`, { cache: 'no-store' });
  if (!response.ok) notFound();
  const { website } = await response.json();
  const pages = website.pages as { home?: { title?: string; content?: string } };
  const home = pages.home || { title: website.title, content: '' };
  return <main className="min-h-screen bg-white text-ink"><section className="cristal-bg px-6 py-24 text-center"><p className="font-bold uppercase tracking-widest text-violet">Published with Cristal</p><h1 className="mx-auto mt-4 max-w-4xl text-5xl font-black">{home.title || website.title}</h1><div className="mx-auto mt-8 max-w-2xl text-lg" dangerouslySetInnerHTML={{ __html: home.content || '' }} /></section><footer className="bg-[#171536] p-6 text-center text-sm text-white">Built with Cristal Builder · {website.subdomain}</footer></main>;
}
