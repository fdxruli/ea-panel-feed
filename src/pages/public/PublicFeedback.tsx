import { useState } from 'react';
import { RatingForm } from '../../components/RatingForm';
import { IssueReportForm } from '../../components/IssueReportForm';
import { QuestionForm } from '../../components/QuestionForm';
import './PublicFeedback.css'; 

export function PublicFeedback() {
  const [activeTab, setActiveTab] = useState<'rating' | 'issue' | 'question'>('rating');

  return (
    // CORRECCIÓN: Se reemplaza el fragmento <> por el div con la clase wrapper
    <div className="feedback-wrapper">
      <div className="ambient"></div>
      <div className="container">
        
        <header className="header">
          <div className="logo-mark">
            <h1 className="logo-text">ENTRE ALAS</h1>
          </div>
          <h2 className="subtitle">Tu <em>opinión</em></h2>
          <p className="description">Nos ayuda a servirte mejor cada vez</p>
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
            className={`tab-btn ${activeTab === 'issue' ? 'active' : ''}`}
            onClick={() => setActiveTab('issue')}
          >
            Tuve un problema
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'question' ? 'active' : ''}`}
            onClick={() => setActiveTab('question')}
          >
            Dudas
          </button>
        </div>

        <RatingForm isActive={activeTab === 'rating'} />
        <IssueReportForm isActive={activeTab === 'issue'} />
        <QuestionForm isActive={activeTab === 'question'} />

        <div className="footer">Entre Alas © 2026 — Todos los derechos reservados</div>
      </div>
    </div>
  );
}