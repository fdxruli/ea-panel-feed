// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { StatsOverview } from '../../components/StatsOverview';
import { RatingsTable } from '../../components/RatingsTable';
import { IncidentesGrid } from '../../components/IncidentesGrid';
import { QuestionsGrid } from '../../components/Questiongrid';
import { DashboardNav, type DashboardTab } from '../../components/DashboardNav';
import './Admin.css';
import type { Incident, Rating, Question } from '../../types/schema';

export function AdminDashboard() {
  const [ratings, setRatings]       = useState<Rating[]>([]);
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<DashboardTab>('resumen');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          navigate('/admin/login');
          return;
        }

        const [ratingsRes, incidentesRes, questionsRes] = await Promise.all([
          supabase.from('ratings').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('incidentes').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(100),
        ]);

        if (ratingsRes.error) throw ratingsRes.error;
        if (incidentesRes.error) throw incidentesRes.error;
        if (questionsRes.error) throw questionsRes.error;

        setRatings(ratingsRes.data || []);
        setIncidentes(incidentesRes.data || []);
        setQuestions(questionsRes.data || []);
      } catch (err: any) {
        console.error('Error cargando dashboard:', err);
        setError('Fallo al conectar con la base de datos. Verifica tu conexión o recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) navigate('/admin/login');
    });

    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidentes' }, (payload) => {
        setIncidentes((prev) => [payload.new as Incident, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'incidentes' }, (payload) => {
        setIncidentes((prev) => prev.map((inc) => (inc.id === payload.new.id ? (payload.new as Incident) : inc)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'incidentes' }, (payload) => {
        setIncidentes((prev) => prev.filter((inc) => inc.id !== payload.old?.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings' }, (payload) => {
        setRatings((prev) => [payload.new as Rating, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ratings' }, (payload) => {
        setRatings((prev) => prev.map((item) => (item.id === payload.new.id ? (payload.new as Rating) : item)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ratings' }, (payload) => {
        setRatings((prev) => prev.filter((item) => item.id !== payload.old?.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, (payload) => {
        setQuestions((prev) => [payload.new as Question, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'questions' }, (payload) => {
        setQuestions((prev) => prev.map((item) => (item.id === payload.new.id ? (payload.new as Question) : item)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'questions' }, (payload) => {
        setQuestions((prev) => prev.filter((item) => item.id !== payload.old?.id));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="dash-loading">Verificando credenciales…</div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="dashboard-container">

        {/* ── Header ── */}
        <header className="dashboard-header">
          <h1>Dashboard Operativo</h1>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </header>

        {/* ── Error global ── */}
        {error && <div className="error-msg">{error}</div>}

        {/* ── Navegación por secciones ── */}
        <DashboardNav
          active={activeTab}
          onChange={setActiveTab}
          badges={{
            calificaciones: ratings.length,
            incidentes:       incidentes.length,
            preguntas: questions.length,
          }}
        />

        {/* ── Sección: Resumen ── */}
        {activeTab === 'resumen' && (
          <section role="tabpanel" aria-label="Resumen estadístico">
            <StatsOverview ratings={ratings} incidentes={incidentes} questions={questions} />

            {/* Accesos rápidos */}
            <div className="dash-quicklinks">
              <button
                className="dash-quicklink-btn"
                onClick={() => setActiveTab('calificaciones')}
              >
                Ver todas las calificaciones →
              </button>
              <button
                className="dash-quicklink-btn"
                onClick={() => setActiveTab('incidentes')}
              >
                Ver incidentes urgentes →
              </button>
              <button
                className="dash-quicklink-btn"
                onClick={() => setActiveTab('preguntas')}
              >
                Ver Preguntas WA →
              </button>
            </div>
          </section>
        )}

        {/* ── Sección: Calificaciones ── */}
        {activeTab === 'calificaciones' && (
          <section role="tabpanel" aria-label="Tabla de calificaciones">
            <h2 className="section-title">Últimas Calificaciones</h2>
            <RatingsTable ratings={ratings} />
          </section>
        )}

        {/* ── Sección: Incidentes Urgentes ── */}
        {activeTab === 'incidentes' && (
          <section role="tabpanel" aria-label="Incidentes Urgentes">
            <h2 className="section-title">Incidentes Urgentes</h2>
            <IncidentesGrid incidentes={incidentes} />
          </section>
        )}

        {/* ── Sección: Preguntas WA ── */}
        {activeTab === 'preguntas' && (
          <section role="tabpanel">
            <h2 className="section-title">Generador de Contenido WhatsApp</h2>
            <QuestionsGrid questions={questions} />
          </section>
        )}

      </div>
    </div>
  );
}