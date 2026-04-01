import { ReactNode, Suspense } from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Suspense fallback={<aside className="sidebar"><h1>PulseML</h1><p>Loading demo role controls…</p></aside>}>
        <Sidebar />
      </Suspense>
      <main className="main">{children}</main>
    </div>
  );
}
