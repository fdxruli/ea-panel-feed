// src/components/DashboardNav.tsx
import './DashboardNav.css';

export type DashboardTab = 'resumen' | 'calificaciones' | 'preguntas';

type NavItem = {
  id: DashboardTab;
  label: string;
  badge?: number;
};

type DashboardNavProps = {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  badges?: Partial<Record<DashboardTab, number>>;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'resumen',         label: 'Resumen' },
  { id: 'calificaciones',  label: 'Calificaciones' },
  { id: 'preguntas',       label: 'Preguntas WA' },
];

export function DashboardNav({ active, onChange, badges = {} }: DashboardNavProps) {
  return (
    <nav className="dash-nav" role="tablist" aria-label="Secciones del dashboard">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          className={`dash-nav-btn ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          <span className="dash-nav-label">{item.label}</span>
          {badges[item.id] !== undefined && badges[item.id]! > 0 && (
            <span className="dash-nav-badge">{badges[item.id]}</span>
          )}
        </button>
      ))}
    </nav>
  );
}