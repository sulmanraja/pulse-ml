'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildRoleHref, canAccessNavItem, demoRoleOptions, getDemoRole, getDemoRoleMeta } from './demoRole';

const links = [
  ['/', 'Overview'],
  ['/models', 'Models'],
  ['/drift', 'Drift Analysis'],
  ['/incidents', 'Incidents'],
  ['/deployments', 'Deployments']
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = getDemoRole(searchParams.get('role') ?? undefined);
  const roleMeta = getDemoRoleMeta(role);

  return (
    <aside className="sidebar">
      <h1>PulseML</h1>
      <p>Observability platform for model health, drift, incidents, and deployment correlation.</p>
      <div className="role-switcher-card">
        <label className="role-switcher-label">
          <span className="muted">Demo role</span>
          <select
            className="select"
            value={role}
            onChange={(event) => {
              const nextRole = getDemoRole(event.target.value);
              const nextParams = Object.fromEntries(searchParams.entries());
              router.push(buildRoleHref(pathname, nextRole, nextParams));
            }}
          >
            {demoRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="muted role-switcher-summary">{roleMeta.summary}</div>
      </div>
      <nav className="nav">
        {links
          .filter(([href]) => canAccessNavItem(role, href))
          .map(([href, label]) => (
            <Link key={href} href={buildRoleHref(href, role)} className={pathname === href ? 'active' : ''}>
              {label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
