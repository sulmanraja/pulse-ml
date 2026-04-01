'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CreateSavedDashboardViewInput, DemoRole, IncidentFilters, SavedDashboardView } from '@pulseml/shared';
import { apiPost } from './api';
import { buildRoleHref, canSaveViews } from './demoRole';

export function SavedViewsPanel({
  currentFilters,
  initialViews,
  role
}: {
  currentFilters: IncidentFilters;
  initialViews: SavedDashboardView[];
  role: DemoRole;
}) {
  const router = useRouter();
  const [views, setViews] = useState(initialViews);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canSave = canSaveViews(role);

  const activeQueryString = useMemo(() => buildIncidentQueryString(currentFilters), [currentFilters]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Add a name before saving this view.');
      return;
    }

    setError(null);

    try {
      const payload: CreateSavedDashboardViewInput = {
        name: trimmedName,
        state: {
          incidents: currentFilters
        }
      };

      const createdView = await apiPost<SavedDashboardView, CreateSavedDashboardViewInput>('/saved-views', payload);
      setViews((existingViews) => [createdView, ...existingViews]);
      setName('');
      startTransition(() => {
        router.refresh();
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save view.');
    }
  }

  return (
    <section className="card saved-views-card">
      <div className="section-heading">
        <div>
          <h3 className="tooltip-label" title="Named filter presets for the incidents page, stored in the demo API's in-memory repository.">Saved Views</h3>
          <p className="muted section-subtitle">
            {canSave
              ? 'Store the current incident filters as a reusable demo-mode preset.'
              : 'This role can load saved views, but creating new presets is reserved for ML Engineer and Admin demo roles.'}
          </p>
        </div>
        <div className="section-chip">{canSave ? 'In-memory' : 'Read only'}</div>
      </div>

      {canSave ? (
        <form className="saved-view-form" onSubmit={handleSave}>
          <label className="filter-field">
            <span className="muted tooltip-label" title="The label used to save and later reload this exact incident filter state.">View name</span>
            <input
              className="input"
              name="name"
              placeholder="Critical payments triage"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save current view'}
          </button>
        </form>
      ) : (
        <div className="saved-views-readonly">
          <div className="muted">Switch to ML Engineer or Admin in demo mode to save new dashboard views.</div>
        </div>
      )}

      {error ? <p className="saved-view-error">{error}</p> : null}

      {views.length === 0 ? (
        <div className="saved-views-empty">
          <div className="muted">No saved views yet. Save the current filter set to create a reusable preset.</div>
        </div>
      ) : (
        <div className="saved-views-list">
          {views.map((view) => {
            const queryString = buildIncidentQueryString(view.state.incidents);
            const href = buildRoleHref('/incidents', role, queryString ? Object.fromEntries(new URLSearchParams(queryString).entries()) : undefined);
            const isActive = queryString === activeQueryString;

            return (
              <button
                key={view.id}
                type="button"
                className={`saved-view-item${isActive ? ' active' : ''}`}
                onClick={() => router.push(href)}
                disabled={isPending}
              >
                <div className="saved-view-name-row">
                  <span className="saved-view-name">{view.name}</span>
                  {isActive ? <span className="badge info">Loaded</span> : null}
                </div>
                <div className="saved-view-meta">
                  <span>{view.createdAt}</span>
                  <span>{describeIncidentFilters(view.state.incidents)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function buildIncidentQueryString(filters: IncidentFilters): string {
  const params = new URLSearchParams();
  if (filters.severity) {
    params.set('severity', filters.severity);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.modelId) {
    params.set('modelId', filters.modelId);
  }

  return params.toString();
}

function describeIncidentFilters(filters: IncidentFilters): string {
  const parts = [
    filters.severity ? `Severity: ${filters.severity}` : null,
    filters.status ? `Status: ${filters.status}` : null,
    filters.modelId ? `Model preset` : null
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'All incidents';
}
