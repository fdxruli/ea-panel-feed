import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Flame, Frown, Meh, Snowflake, Thermometer, ThermometerSun, 
  PackageOpen, ThumbsUp, PackageCheck, MessageSquare 
} from 'lucide-react';
import { ratingSchema, questionSchema, type RatingFormData, type QuestionFormData } from '../../types/schema';
import { supabase } from '../../lib/supabase';
import './PublicFeedback.css'; 

export function PublicFeedback() {
  const [activeTab, setActiveTab] = useState<'rating' | 'qa'>('rating');
  
  const [ratingMsg, setRatingMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [qaMsg, setQaMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const {
    register: registerRating,
    handleSubmit: handleRatingSubmit,
    reset: resetRating,
    formState: { isSubmitting: isRatingSubmitting, errors: ratingErrors }
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    mode: 'onSubmit'
  });

  const {
    register: registerQa,
    handleSubmit: handleQaSubmit,
    reset: resetQa,
    formState: { isSubmitting: isQaSubmitting, errors: qaErrors }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    mode: 'onSubmit'
  });

  const onSubmitRating = async (data: RatingFormData) => {
    setRatingMsg(null);
    try {
      const { error } = await supabase.from('ratings').insert([data]);
      if (error) throw error;
      
      setRatingMsg({ type: 'success', text: '¡Gracias! Tu calificación fue registrada 🔥' });
      resetRating();
      setTimeout(() => setRatingMsg(null), 3000);
    } catch (err) {
      setRatingMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
    }
  };

  const onSubmitQa = async (data: QuestionFormData) => {
    setQaMsg(null);
    try {
      const payload = {
        pregunta: data.pregunta,
        telefono: data.telefono === '' ? null : data.telefono
      };
      
      const { error } = await supabase.from('questions').insert([payload]);
      if (error) throw error;

      setQaMsg({ type: 'success', text: 'Pregunta recibida — atento a nuestros estados' });
      resetQa();
      setTimeout(() => setQaMsg(null), 3500);
    } catch (err) {
      setQaMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
    }
  };

  return (
    <>
      <div className="ambient"></div>
      <div className="container">
        
        <header className="header">
          <div className="logo-mark">
            <div className="logo-flame">
              <Flame strokeWidth={1.5} size={32} />
            </div>
            <span className="logo-text">Entre Alas</span>
          </div>
          <h1>Tu <em>opinión</em></h1>
          <p style={{ marginTop: '8px' }}>Nos ayuda a servirte mejor cada vez</p>
        </header>

        <div className="tabs">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'rating' ? 'active' : ''}`}
            onClick={() => setActiveTab('rating')}
          >
            Calificar pedido
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            Hacer una pregunta
          </button>
        </div>

        {/* Panel de Calificación montado permanentemente */}
        <div className={`tab-panel ${activeTab === 'rating' ? 'active' : ''}`}>
          <form onSubmit={handleRatingSubmit(onSubmitRating)}>
            
            <div className="rating-group">
              <div className="section-label">Sabor y calidad</div>
              <div className="rating-options">
                <label className="rating-btn">
                  <input type="radio" value="malo" className="sr-only" {...registerRating('sabor')} />
                  <Frown className="btn-icon" />
                  <span className="btn-label">Malas</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="regular" className="sr-only" {...registerRating('sabor')} />
                  <Meh className="btn-icon" />
                  <span className="btn-label">Normales</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="excelente" className="sr-only" {...registerRating('sabor')} />
                  <Flame className="btn-icon" />
                  <span className="btn-label">Brutales</span>
                </label>
              </div>
              {ratingErrors.sabor && <span className="msg show error">{ratingErrors.sabor.message}</span>}
            </div>

            <div className="rating-group">
              <div className="section-label">Temperatura al llegar</div>
              <div className="rating-options">
                <label className="rating-btn">
                  <input type="radio" value="frio" className="sr-only" {...registerRating('llegada')} />
                  <Snowflake className="btn-icon" />
                  <span className="btn-label">Frío</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="tibio" className="sr-only" {...registerRating('llegada')} />
                  <Thermometer className="btn-icon" />
                  <span className="btn-label">Tibio</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="caliente" className="sr-only" {...registerRating('llegada')} />
                  <ThermometerSun className="btn-icon" />
                  <span className="btn-label">Caliente</span>
                </label>
              </div>
              {ratingErrors.llegada && <span className="msg show error">{ratingErrors.llegada.message}</span>}
            </div>

            <div className="rating-group">
              <div className="section-label">Estado del empaque</div>
              <div className="rating-options">
                <label className="rating-btn">
                  <input type="radio" value="batido" className="sr-only" {...registerRating('empaque')} />
                  <PackageOpen className="btn-icon" />
                  <span className="btn-label">Batido</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="bien" className="sr-only" {...registerRating('empaque')} />
                  <ThumbsUp className="btn-icon" />
                  <span className="btn-label">Bien</span>
                </label>
                <label className="rating-btn">
                  <input type="radio" value="intacto" className="sr-only" {...registerRating('empaque')} />
                  <PackageCheck className="btn-icon" />
                  <span className="btn-label">Intacto</span>
                </label>
              </div>
              {ratingErrors.empaque && <span className="msg show error">{ratingErrors.empaque.message}</span>}
            </div>

            <div className="divider"></div>

            <div className="field-group">
              <div className="section-label">Comentario adicional</div>
              <textarea 
                rows={3} 
                placeholder="Detalles que quieras compartir (opcional)"
                {...registerRating('comentario')}
              ></textarea>
              {ratingErrors.comentario && <span className="msg show error">{ratingErrors.comentario.message}</span>}
            </div>

            {ratingMsg && <div className={`msg show ${ratingMsg.type}`}>{ratingMsg.text}</div>}

            <button type="submit" className="submit-btn" disabled={isRatingSubmitting}>
              <span>{isRatingSubmitting ? 'Procesando…' : 'Enviar calificación'}</span>
            </button>

          </form>
        </div>

        {/* Panel de Preguntas montado permanentemente */}
        <div className={`tab-panel ${activeTab === 'qa' ? 'active' : ''}`}>
          <div className="info-box">
            <MessageSquare className="info-box-icon" />
            <div>
              <div className="info-box-title">Respondemos por WhatsApp</div>
              <div className="info-box-body">Déjanos tu duda sobre ingredientes, zonas de envío o lo que necesites. Si dejas tu número te respondemos directo, o lo compartimos anónimamente en nuestros estados.</div>
            </div>
          </div>

          <form onSubmit={handleQaSubmit(onSubmitQa)}>
            <div className="field-group">
              <div className="section-label">Tu pregunta</div>
              <textarea 
                rows={4} 
                placeholder="Ej. ¿Qué tan picante es la salsa fuego?"
                {...registerQa('pregunta')}
              ></textarea>
              {qaErrors.pregunta && <span className="msg show error">{qaErrors.pregunta.message}</span>}
            </div>

            <div className="field-group">
              <div className="section-label">WhatsApp (opcional)</div>
              <input 
                type="tel" 
                placeholder="Ej. 55 1234 5678"
                {...registerQa('telefono')}
              />
              {qaErrors.telefono && <span className="msg show error">{qaErrors.telefono.message}</span>}
            </div>

            {qaMsg && <div className={`msg show ${qaMsg.type}`}>{qaMsg.text}</div>}

            <button type="submit" className="submit-btn" disabled={isQaSubmitting}>
              <span>{isQaSubmitting ? 'Enviando…' : 'Enviar pregunta'}</span>
            </button>
          </form>
        </div>

        <div className="footer">Entre Alas © 2026 — Todos los derechos reservados</div>
      </div>
    </>
  );
}