'use client';

import { useCallback, useEffect, useState } from 'react';

type Joke = {
  id: number;
  type: string;
  setup: string;
  punchline: string;
};

const API_URL = 'https://official-joke-api.appspot.com/random_joke';

export default function JokesPage() {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getJoke = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to fetch a joke.');
      setJoke(await response.json());
    } catch {
      setError('We could not fetch a joke right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getJoke();
  }, [getJoke]);

  return (
    <main className="cristal-bg flex min-h-screen items-center justify-center px-5 py-16">
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-2xl md:p-12">
        <p className="font-bold uppercase tracking-[.25em] text-violet">✦ Cristal laughs</p>
        <h1 className="mt-4 text-4xl font-black text-ink md:text-5xl">Random Joke Generator</h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-600">
          Need a quick laugh? Fetch a fresh joke from the Official Joke API.
        </p>

        <div className="mt-10 min-h-48 rounded-3xl bg-[#f3efff] p-8 text-left">
          {loading && <p className="text-center font-semibold text-slate-600">Finding a good one…</p>}
          {!loading && error && <p className="text-center font-semibold text-rose-600">{error}</p>}
          {!loading && !error && joke && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-violet">{joke.type} joke</p>
              <p className="mt-4 text-2xl font-bold leading-snug text-ink">{joke.setup}</p>
              <p className="mt-6 border-l-4 border-teal-400 pl-4 text-xl leading-relaxed text-slate-700">
                {joke.punchline}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => void getJoke()}
          disabled={loading}
          className="mt-8 rounded-xl bg-gradient-to-r from-violet to-fuchsia-500 px-7 py-3 font-bold text-white transition hover:scale-105 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Get another joke'}
        </button>
      </section>
    </main>
  );
}
