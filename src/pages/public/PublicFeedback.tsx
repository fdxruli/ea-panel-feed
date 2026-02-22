import { useState } from 'react';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RatingForm } from '../../components/RatingForm';
import { QuestionForm } from '../../components/QuestionForm';
import './PublicFeedback.css';

type Tab = 'rating' | 'qa';

type PublicFeedbackProps = {
  defaultTab?: Tab;
};

export function PublicFeedback({ defaultTab = 'rating' }: PublicFeedbackProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const navigate = useNavigate();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Actualiza la URL sin recargar la página
    navigate(tab === 'rating' ? '/' : '/preguntas', { replace: true });
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
            onClick={() => handleTabChange('rating')}
          >
            Calificar pedido
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => handleTabChange('qa')}
          >
            Hacer una pregunta
          </button>
        </div>

        <RatingForm isActive={activeTab === 'rating'} />
        <QuestionForm isActive={activeTab === 'qa'} />

        <div className="footer">Entre Alas © 2026 — Todos los derechos reservados</div>
      </div>
    </>
  );
}