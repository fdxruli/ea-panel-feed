// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';
import { Flame, Download, MessageSquare } from 'lucide-react';

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
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          navigate('/admin/login');
          return;
        }

        const [ratingsRes, questionsRes] = await Promise.all([
          supabase.from('ratings').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(100)
        ]);

        if (ratingsRes.error) throw ratingsRes.error;
        if (questionsRes.error) throw questionsRes.error;

        setRatings(ratingsRes.data || []);
        setQuestions(questionsRes.data || []);
      } catch (err: any) {
        console.error("Error cargando dashboard:", err);
        setError("Fallo al conectar con la base de datos. Verifica tu conexión o recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDownloadImage = async (questionId: string) => {
    const element = document.getElementById(`question-card-${questionId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#111110', 
        scale: 2, 
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `pregunta-wa-${questionId}.png`;
      link.click();
    } catch (err) {
      console.error("Error generando la imagen:", err);
      alert("Hubo un error al generar la imagen. Intenta con captura nativa.");
    }
  };

  if (loading) return <div className="admin-layout">Verificando credenciales...</div>;

  return (
    <div className="admin-layout">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard Operativo</h1>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </header>

        {error && <div className="error-msg">{error}</div>}

        <section>
          <h2 className="section-title">Últimas Calificaciones</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Sabor</th>
                  <th>Llegada</th>
                  <th>Empaque</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(r => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString('es-MX')}</td>
                    <td><span className="badge">{r.sabor}</span></td>
                    <td><span className="badge">{r.llegada}</span></td>
                    <td><span className="badge">{r.empaque}</span></td>
                    <td style={{ minWidth: '200px' }}>{r.comentario || '-'}</td>
                  </tr>
                ))}
                {ratings.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hay calificaciones registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="section-title">Preguntas para WhatsApp</h2>
          <div className="questions-grid">
            {questions.map(q => (
              <div className="wa-card-wrapper" key={q.id}>
                <div 
                  id={`question-card-${q.id}`} 
                  className="wa-export-card"
                >
                  <div className="wa-card-header">
                    <Flame size={16} className="wa-brand-icon" />
                    <span className="wa-brand-name">ENTRE ALAS</span>
                    <span className="wa-card-date">
                      {new Date(q.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  
                  <div className="wa-card-body">
                    <MessageSquare size={20} className="wa-msg-icon" />
                    <p className="wa-question-text">"{q.pregunta}"</p>
                  </div>
                  
                  {q.telefono && (
                    <div className="wa-card-footer">
                      Contacto: {q.telefono}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleDownloadImage(q.id)}
                  className="wa-download-btn"
                >
                  <Download size={14} />
                  Descargar para Estado
                </button>
              </div>
            ))}
            
            {questions.length === 0 && (
              <p className="empty-state">No hay preguntas registradas.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}