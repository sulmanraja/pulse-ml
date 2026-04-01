"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedDashboardViewsRepository = void 0;
const seededViews = [
    {
        id: 'view-critical-investigations',
        name: 'Critical Investigations',
        createdAt: '2026-03-31 10:20 CT',
        state: {
            incidents: {
                severity: 'critical',
                status: 'investigating'
            }
        }
    },
    {
        id: 'view-artwork-watch',
        name: 'Artwork Latency Watch',
        createdAt: '2026-03-31 10:24 CT',
        state: {
            incidents: {
                modelId: 'mdl-artwork-llm'
            }
        }
    }
];
class InMemorySavedDashboardViewsRepository {
    views = [...seededViews];
    list() {
        return [...this.views].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    }
    create(input) {
        const view = {
            id: `view-${this.views.length + 1}`,
            name: input.name,
            state: input.state,
            createdAt: formatDemoTimestamp(new Date())
        };
        this.views.unshift(view);
        return view;
    }
}
exports.savedDashboardViewsRepository = new InMemorySavedDashboardViewsRepository();
function formatDemoTimestamp(date) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const parts = Object.fromEntries(formatter
        .formatToParts(date)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} CT`;
}
