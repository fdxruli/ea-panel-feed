// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { StatsOverview } from '../../components/StatsOverview';
import { RatingsTable } from '../../components/RatingsTable';
import { QuestionsGrid } from '../../components/Questiongrid';
import { DashboardNav, type DashboardTab } from '../../components/DashboardNav';
import './Admin.css';

type Rating = {
  id: string;
  sabor: 'malo' | 'regular' | 'excelente';
  llegada: 'frio' | 'tibio' | 'caliente';
  empaque: 'batido' | 'bien' | 'intacto';
  comentario: string | null;
  created_at: string;
};

type Question = {
  id: string;
  pregunta: string;
  telefono: string | null;
  created_at: string;
};

export function AdminDashboard() {
  const [ratings, setRatings]       = useState<Rating[]>([]);
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

        const [ratingsRes, questionsRes] = await Promise.all([
          supabase.from('ratings').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(100),
        ]);

        if (ratingsRes.error) throw ratingsRes.error;
        if (questionsRes.error) throw questionsRes.error;

        setRatings(ratingsRes.data || []);
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

    return () => subscription.unsubscribe();
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
            preguntas:       questions.length,
          }}
        />

        {/* ── Sección: Resumen ── */}
        {activeTab === 'resumen' && (
          <section role="tabpanel" aria-label="Resumen estadístico">
            <StatsOverview ratings={ratings} />

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
                onClick={() => setActiveTab('preguntas')}
              >
                Ver preguntas de WhatsApp →
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

        {/* ── Sección: Preguntas WhatsApp ── */}
        {activeTab === 'preguntas' && (
          <section role="tabpanel" aria-label="Preguntas para WhatsApp">
            <h2 className="section-title">Preguntas para WhatsApp</h2>
            <QuestionsGrid questions={questions} />
          </section>
        )}

      </div>
    </div>
  );
}