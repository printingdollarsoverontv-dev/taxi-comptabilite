'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebug() {
      try {
        const res = await fetch('/api/debug');
        const data = await res.json();
        setDebug(data);
      } catch (error) {
        setDebug({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }
    fetchDebug();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen font-mono text-sm">
      <h1 className="text-2xl mb-6 font-bold">🔧 DEBUG INFO</h1>
      <pre className="bg-slate-800 p-4 rounded overflow-auto">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}
