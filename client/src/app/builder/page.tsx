'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
type Block = { id: number; type: 'hero' | 'text' | 'image' | 'button'; text: string };
const defaults: Block[] = [
  { id: 1, type: 'hero', text: 'Build something remarkable' },
  { id: 2, type: 'text', text: 'Tell your story with a beautiful Cristal website.' },
  { id: 3, type: 'button', text: 'Get started' },
];

export default function BuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>(defaults);
  const [selected, setSelected] = useState(1);
  const [websiteId, setWebsiteId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setWebsiteId(localStorage.getItem('cristalWebsiteId') || '');
  }, []);

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= blocks.length) return;
    const copy = [...blocks];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setBlocks(copy);
  };

  const add = (type: Block['type']) => {
    const block: Block = {
      id: Date.now(),
      type,
      text: type === 'hero' ? 'A new headline' : type === 'image' ? 'Image placeholder' : type === 'button' ? 'Click me' : 'New content block',
    };
    setBlocks((current) => [...current, block]);
    setSelected(block.id);
  };

  async function save() {
    const token = localStorage.getItem('cristalToken');
    if (!token || !websiteId) {
      setNotice('เข้าสู่ระบบและสร้างเว็บไซต์จากหน้า AI ก่อนบันทึก Canvas');
      return;
    }
    setNotice('กำลังบันทึก...');
    const response = await fetch(`${API}/api/websites/${websiteId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: { home: { title: 'Home', blocks } } }),
    });
    setNotice(response.ok ? 'บันทึก Canvas แล้ว' : 'บันทึกไม่สำเร็จ');
  }

  return <main className="min-h-screen bg-slate-100 p-4 text-ink md:p-8"><div className="mx-auto max-w-7xl"><header className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow"><div><p className="text-xs font-bold uppercase tracking-widest text-violet">Cristal AI</p><h1 className="text-2xl font-black">Visual Canvas ✦</h1></div><button onClick={save} className="rounded-xl bg-violet px-5 py-2 font-bold text-white">Save changes</button></header><div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]"><aside className="rounded-2xl bg-white p-4 shadow"><h2 className="font-black">Blocks</h2>{(['hero', 'text', 'image', 'button'] as Block['type'][]).map((type) => <button key={type} onClick={() => add(type)} className="mt-3 block w-full rounded-xl bg-slate-100 p-3 text-left font-semibold capitalize hover:bg-purple-100">＋ {type}</button>)}</aside><section className="min-h-[650px] rounded-2xl bg-white p-8 shadow"><div className="mx-auto max-w-2xl space-y-4">{blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setSelected(block.id)} onClick={() => setSelected(block.id)} className={`cursor-pointer rounded-2xl border-2 p-6 transition ${selected === block.id ? 'border-violet bg-purple-50' : 'border-transparent bg-slate-50 hover:border-purple-200'}`}><p className="mb-2 text-xs font-bold uppercase text-violet">{block.type}</p>{block.type === 'image' ? <div className="flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-purple-200 to-teal-100 text-3xl">▧</div> : <p className={block.type === 'hero' ? 'text-4xl font-black' : block.type === 'button' ? 'inline-block rounded-xl bg-violet px-4 py-2 font-bold text-white' : 'text-lg'}>{block.text}</p>}<div className="mt-3 flex gap-2 text-xs text-slate-500"><button onClick={(event) => { event.stopPropagation(); move(index, -1); }}>↑ Move up</button><button onClick={(event) => { event.stopPropagation(); move(index, 1); }}>↓ Move down</button></div></div>)}</div></section><aside className="rounded-2xl bg-white p-4 shadow"><h2 className="font-black">Inspector</h2>{blocks.filter((block) => block.id === selected).map((block) => <div key={block.id} className="mt-4"><label className="text-sm font-bold">Content</label><textarea value={block.text} onChange={(event) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, text: event.target.value } : item))} className="mt-2 h-28 w-full rounded-xl bg-slate-100 p-3" /><p className="mt-4 text-xs text-slate-500">Website ID: {websiteId || 'not selected'}</p></div>)}{notice && <p className="mt-5 text-sm font-bold text-violet">{notice}</p>}</aside></div></div></main>;
}
