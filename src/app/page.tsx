'use client';

import dynamic from 'next/dynamic';

const Board = dynamic(() => import('@/components/Board'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
});

export default function Home() {
  return <Board />;
}
