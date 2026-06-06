import { useMemo, useState } from 'react';
import { 
  TrendingUp, Flame, Snowflake, Clock, CheckCircle, AlertTriangle, MessageCircle 
} from 'lucide-react';
import './StatsOverview.css';
import type { Rating, Incident, Question } from '../types/schema';

type StatsOverviewProps = {
  ratings: Rating[];
  incidentes: Incident[];
  questions: Question[];
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function StatsOverview({ ratings, incidentes, questions }: StatsOverviewProps) {
  const [compareWeek, setCompareWeek] = useState(false);

  const stats = useMemo(() => {
    const totalRatings = ratings.length;
    const totalIncidentes = incidentes.length;
    const totalQuestions = questions.length;

    if (totalRatings === 0 && totalIncidentes === 0 && totalQuestions === 0) return null;

    const weekStart = getWeekStart();
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    // -- Ratings Metrics --
    const thisWeekRatings = ratings.filter(r => new Date(r.created_at) >= weekStart);
    const prevWeekRatings = ratings.filter(r => {
      const d = new Date(r.created_at);
      return d >= prevWeekStart && d < weekStart;
    });

    const saborScore = ratings.reduce((acc, r) => {
      if (r.sabor === 'excelente') return acc + 1;
      if (r.sabor === 'regular') return acc + 0.5;
      return acc;
    }, 0);
    const saborPct = totalRatings > 0 ? Math.round((saborScore / totalRatings) * 100) : 0;

    const calientePct = totalRatings > 0 ? Math.round((ratings.filter(r => r.llegada === 'caliente').length / totalRatings) * 100) : 0;
    const tibioPct = totalRatings > 0 ? Math.round((ratings.filter(r => r.llegada === 'tibio').length / totalRatings) * 100) : 0;
    const frioPct = totalRatings > 0 ? Math.round((ratings.filter(r => r.llegada === 'frio').length / totalRatings) * 100) : 0;

    const exactitudPct = totalRatings > 0 ? Math.round((ratings.filter(r => r.exactitud_pedido === true).length / totalRatings) * 100) : 0;

    const rapidoPct = totalRatings > 0 ? Math.round((ratings.filter(r => r.tiempo_espera === 'rapido').length / totalRatings) * 100) : 0;

    // Top problems
    const problemasSaborCount: Record<string, number> = {};
    const problemasExactitudCount: Record<string, number> = {};

    ratings.forEach(r => {
      if (r.problemas_sabor) {
        r.problemas_sabor.forEach(p => {
          problemasSaborCount[p] = (problemasSaborCount[p] || 0) + 1;
        });
      }
      if (r.problemas_exactitud) {
        r.problemas_exactitud.forEach(p => {
          problemasExactitudCount[p] = (problemasExactitudCount[p] || 0) + 1;
        });
      }
    });

    const topProblemasSabor = Object.entries(problemasSaborCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const topProblemasExactitud = Object.entries(problemasExactitudCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // -- Trends --
    const trendTotal = compareWeek && prevWeekRatings.length > 0 
      ? Math.round(((thisWeekRatings.length - prevWeekRatings.length) / prevWeekRatings.length) * 100) 
      : 0;
    
    const weekExcelentePct = thisWeekRatings.length > 0
      ? Math.round((thisWeekRatings.filter(r => r.sabor === 'excelente').length / thisWeekRatings.length) * 100)
      : 0;
    const prevExcelentePct = prevWeekRatings.length > 0
      ? Math.round((prevWeekRatings.filter(r => r.sabor === 'excelente').length / prevWeekRatings.length) * 100)
      : 0;
    const trendSabor = compareWeek ? weekExcelentePct - prevExcelentePct : 0;

    // -- Incidentes Metrics --
    const incidentesResueltos = incidentes.filter(i => i.estado === 'resuelto').length;
    const incidentesPendientes = incidentes.filter(i => i.estado === 'pendiente' || i.estado === 'en_revision').length;
    const resolutividadPct = totalIncidentes > 0 ? Math.round((incidentesResueltos / totalIncidentes) * 100) : 0;

    return { 
      totalRatings,
      totalIncidentes,
      totalQuestions,
      thisWeekRatings: thisWeekRatings.length, 
      saborPct, 
      calientePct, 
      tibioPct,
      frioPct,
      exactitudPct,
      rapidoPct,
      trendTotal,
      trendSabor,
      weekExcelentePct,
      incidentesResueltos,
      incidentesPendientes,
      resolutividadPct,
      topProblemasSabor,
      topProblemasExactitud
    };
  }, [ratings, incidentes, questions, compareWeek]);

  if (!stats) {
    return (
      <div className="stats-empty">
        <p>Aún no hay datos para mostrar estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="stats-overview-container">
      <div className="stats-controls">
        <label className="toggle-label">
          <input 
            type="checkbox" 
            checked={compareWeek} 
            onChange={(e) => setCompareWeek(e.target.checked)} 
          />
          <span className="toggle-text">Comparar con semana anterior</span>
        </label>
      </div>

      <div className="stats-section-title">Métricas Generales</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><TrendingUp size={16} /></span>
            <span className="stat-label">Total Reseñas</span>
          </div>
          <div className="stat-value">{stats.totalRatings}</div>
          <div className="stat-sub">
            {stats.thisWeekRatings} esta semana
            {compareWeek && stats.trendTotal !== 0 && (
              <span className={`stat-trend ${stats.trendTotal > 0 ? 'up' : 'down'}`}>
                {stats.trendTotal > 0 ? '↑' : '↓'} {Math.abs(stats.trendTotal)}% vs sem. ant.
              </span>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><AlertTriangle size={16} /></span>
            <span className="stat-label">Incidentes</span>
          </div>
          <div className="stat-value">{stats.totalIncidentes}</div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ '--bar-width': `${stats.resolutividadPct}%` } as React.CSSProperties} />
          </div>
          <div className="stat-sub">
            {stats.incidentesPendientes} pendientes · {stats.resolutividadPct}% resueltos
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><MessageCircle size={16} /></span>
            <span className="stat-label">Preguntas WA</span>
          </div>
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-sub">Posibles ventas</div>
        </div>
      </div>

      <div className="stats-section-title">Calidad y Servicio</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><Flame size={16} /></span>
            <span className="stat-label">Satisfacción Sabor</span>
          </div>
          <div className="stat-value">{stats.saborPct}%</div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ '--bar-width': `${stats.saborPct}%` } as React.CSSProperties} />
          </div>
          <div className="stat-sub">
            {stats.weekExcelentePct}% "excelentes" esta semana
            {compareWeek && stats.trendSabor !== 0 && (
              <span className={`stat-trend ${stats.trendSabor > 0 ? 'up' : 'down'}`}>
                {stats.trendSabor > 0 ? '↑' : '↓'} {Math.abs(stats.trendSabor)}% vs sem. ant.
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><CheckCircle size={16} /></span>
            <span className="stat-label">Exactitud Pedido</span>
          </div>
          <div className="stat-value">{stats.exactitudPct}%</div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ '--bar-width': `${stats.exactitudPct}%` } as React.CSSProperties} />
          </div>
          <div className="stat-sub">
            Llegaron completos sin errores
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><Clock size={16} /></span>
            <span className="stat-label">Tiempo Espera</span>
          </div>
          <div className="stat-value">{stats.rapidoPct}%</div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ '--bar-width': `${stats.rapidoPct}%` } as React.CSSProperties} />
          </div>
          <div className="stat-sub">
            Llegaron rápido
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon"><Snowflake size={16} /></span>
            <span className="stat-label">Llegó Caliente</span>
          </div>
          <div className="stat-value">{stats.calientePct}%</div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ '--bar-width': `${stats.calientePct}%` } as React.CSSProperties} />
          </div>
          <div className="stat-sub">
            {stats.tibioPct}% tibio · {stats.frioPct}% frío
          </div>
        </div>
      </div>

      {(stats.topProblemasSabor.length > 0 || stats.topProblemasExactitud.length > 0) && (
        <>
          <div className="stats-section-title">Top 3 Problemas Frecuentes</div>
          <div className="stats-grid top-problems-grid">
            {stats.topProblemasSabor.length > 0 && (
              <div className="stat-card problems-card">
                <div className="stat-header">
                  <span className="stat-label">Problemas de Sabor/Calidad</span>
                </div>
                <ul className="problems-list">
                  {stats.topProblemasSabor.map(([prob, count], i) => (
                    <li key={prob} className="problem-item">
                      <span className="problem-rank">{i + 1}</span>
                      <span className="problem-name">{prob.replace(/_/g, ' ')}</span>
                      <span className="problem-count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stats.topProblemasExactitud.length > 0 && (
              <div className="stat-card problems-card">
                <div className="stat-header">
                  <span className="stat-label">Problemas de Exactitud</span>
                </div>
                <ul className="problems-list">
                  {stats.topProblemasExactitud.map(([prob, count], i) => (
                    <li key={prob} className="problem-item">
                      <span className="problem-rank">{i + 1}</span>
                      <span className="problem-name">{prob.replace(/_/g, ' ')}</span>
                      <span className="problem-count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}