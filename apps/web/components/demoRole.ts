import { DemoRole } from '@pulseml/shared';

export const demoRoleOptions: Array<{
  value: DemoRole;
  label: string;
  summary: string;
}> = [
  {
    value: 'ml-engineer',
    label: 'ML Engineer',
    summary: 'Balanced view across model health, drift, and incidents.'
  },
  {
    value: 'data-scientist',
    label: 'Data Scientist',
    summary: 'Focus on model behavior, drift signals, and analysis workflows.'
  },
  {
    value: 'platform-engineer',
    label: 'Platform Engineer',
    summary: 'Focus on incidents, deployments, and operational reliability.'
  },
  {
    value: 'admin',
    label: 'Admin',
    summary: 'See the full demo surface and role-aware controls.'
  }
];

export function getDemoRole(value?: string): DemoRole {
  return demoRoleOptions.find((option) => option.value === value)?.value ?? 'ml-engineer';
}

export function getDemoRoleMeta(role: DemoRole) {
  return demoRoleOptions.find((option) => option.value === role) ?? demoRoleOptions[0];
}

export function buildRoleHref(
  pathname: string,
  role: DemoRole,
  params?: Record<string, string | undefined>
) {
  const searchParams = new URLSearchParams();
  searchParams.set('role', role);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (key === 'role') {
        continue;
      }

      if (value) {
        searchParams.set(key, value);
      }
    }
  }

  return `${pathname}?${searchParams.toString()}`;
}

export function canAccessNavItem(role: DemoRole, pathname: string) {
  if (role === 'admin') {
    return true;
  }

  if (role === 'data-scientist') {
    return ['/', '/models', '/drift'].includes(pathname);
  }

  if (role === 'platform-engineer') {
    return ['/', '/incidents', '/deployments'].includes(pathname);
  }

  return ['/', '/models', '/drift', '/incidents'].includes(pathname);
}

export function canSaveViews(role: DemoRole) {
  return role === 'ml-engineer' || role === 'admin';
}
