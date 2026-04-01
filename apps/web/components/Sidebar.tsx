'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'Overview'],
  ['/models', 'Models'],
  ['/drift', 'Drift Analysis'],
  ['/incidents', 'Incidents'],
  ['/deployments', 'Deployments']
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <h1>PulseML</h1>
      <p>Observability platform for model health, drift, incidents, and deployment correlation.</p>
      <nav className="nav">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
