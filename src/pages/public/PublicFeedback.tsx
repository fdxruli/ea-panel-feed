import { useState } from 'react';
import { Flame } from 'lucide-react';
import { RatingForm } from '../../components/RatingForm';
import { QuestionForm } from '../../components/QuestionForm';
import './PublicFeedback.css';

export function PublicFeedback() {
  const [activeTab, setActiveTab] = useState<'rating' | 'qa'>('rating');

  return (
    // ✅ CORRECCIÓN: Se reemplaza el fragmento vacío <> por .feedback-wrapper,
    // que aplica el grain overlay (::before), el fondo, el flex-layout y el
    // position: relative que necesita .ambient para posicionarse correctamente.
    <div className="feedback-wrapper">

      {/* ✅ .ambient ahora tiene un ancestro con position definido */}
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

        <RatingForm isActive={activeTab === 'rating'} />
        <QuestionForm isActive={activeTab === 'qa'} />

        <div className="footer">Entre Alas © 2026 — Todos los derechos reservados</div>
      </div>
    </div>
  );
}