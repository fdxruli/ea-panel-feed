// src/components/StatsOverview.tsx
import { useMemo } from 'react';
import { TrendingUp, Flame, Snowflake, Package } from 'lucide-react';
import './StatsOverview.css';

type Rating = {
  id: string;
  sabor: 'malo' | 'regular' | 'excelente';
  llegada: 'frio' | 'tibio' | 'caliente';
  empaque: 'batido' | 'bien' | 'intacto';
  comentario: string | null;
  created_at: string;
};

type StatsOverviewProps = {
  ratings: Rating[];
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function StatsOverview({ ratings }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const total = ratings.length;
    if (total === 0) return null;

    const weekStart = getWeekStart();
    const thisWeek = ratings.filter(r => new Date(r.created_at) >= weekStart);

    // Sabor score: malo=0, regular=0.5, excelente=1
    const saborScore = ratings.reduce((acc, r) => {
      if (r.sabor === 'excelente') return acc + 1;
      if (r.sabor === 'regular') return acc + 0.5;
      return acc;
    }, 0);
    const saborPct = Math.round((saborScore / total) * 100);

    // Temperatura
    const calientePct = Math.round((ratings.filter(r => r.llegada === 'caliente').length / total) * 100);
    const tibioPct = Math.round((ratings.filter(r => r.llegada === 'tibio').length / total) * 100);
    const frioPct = Math.round((ratings.filter(r => r.llegada === 'frio').length / total) * 100);

    // Empaque
    const intactoPct = Math.round((ratings.filter(r => r.empaque === 'intacto').length / total) * 100);
    const bienPct = Math.round((ratings.filter(r => r.empaque === 'bien').length / total) * 100);
    const batidoPct = Math.round((ratings.filter(r => r.empaque === 'batido').length / total) * 100);

    // Tendencia: comparar esta semana vs semana anterior
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeek = ratings.filter(r => {
      const d = new Date(r.created_at);
      return d >= prevWeekStart && d < weekStart;
    });

    const weekExcelentePct = thisWeek.length > 0
      ? Math.round((thisWeek.filter(r => r.sabor === 'excelente').length / thisWeek.length) * 100)
      : 0;
    const prevExcelentePct = prevWeek.length > 0
      ? Math.round((prevWeek.filter(r => r.sabor === 'excelente').length / prevWeek.length) * 100)
      : 0;
    const trend = weekExcelentePct - prevExcelentePct;

    return { 
      total, 
      thisWeek: thisWeek.length, 
      saborPct, 
      calientePct, 
      tibioPct,
      frioPct,
      intactoPct, 
      bienPct,
      batidoPct,
      trend, 
      weekExcelentePct 
    };
  }, [ratings]);

  if (!stats) {
    return (
      <div className="stats-empty">
        <p>Aún no hay calificaciones para mostrar estadísticas.</p>
      </div>
    );
  }

  const cards = [
    {
      id: 'total',
      label: 'Total reseñas',
      value: stats.total,
      sub: `${stats.thisWeek} esta semana`,
      icon: <TrendingUp size={16} />,
      trend: stats.trend !== 0 ? (
        <span className={`stat-trend ${stats.trend > 0 ? 'up' : 'down'}`}>
          {stats.trend > 0 ? '↑' : '↓'} {Math.abs(stats.trend)}% vs sem. ant.
        </span>
      ) : null,
      bar: null,
    },
    {
      id: 'sabor',
      label: 'Satisfacción sabor',
      value: `${stats.saborPct}%`,
      sub: `${stats.weekExcelentePct}% "brutales" esta semana`,
      icon: <Flame size={16} />,
      trend: null,
      bar: stats.saborPct,
    },
    {
      id: 'temperatura',
      label: 'Llegó caliente',
      value: `${stats.calientePct}%`,
      sub: `${stats.tibioPct}% tibio · ${stats.frioPct}% frío`,
      icon: <Snowflake size={16} />,
      trend: null,
      bar: stats.calientePct,
    },
    {
      id: 'empaque',
      label: 'Empaque intacto',
      value: `${stats.intactoPct}%`,
      sub: `${stats.bienPct}% bien · ${stats.batidoPct}% batido`,
      icon: <Package size={16} />,
      trend: null,
      bar: stats.intactoPct,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div
          className="stat-card"
          key={card.id}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="stat-header">
            <span className="stat-icon">{card.icon}</span>
            <span className="stat-label">{card.label}</span>
          </div>
          <div className="stat-value">{card.value}</div>
          {card.bar !== null && (
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{ '--bar-width': `${card.bar}%` } as React.CSSProperties}
              />
            </div>
          )}
          <div className="stat-sub">
            {card.sub}
            {card.trend}
          </div>
        </div>
      ))}
    </div>
  );
}