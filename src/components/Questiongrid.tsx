// src/components/QuestionsGrid.tsx
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Flame, Download, MessageSquare, Phone } from 'lucide-react';
import './Questiongrid.css';

type Question = {
    id: string;
    pregunta: string;
    telefono: string | null;
    created_at: string;
};

type QuestionsGridProps = {
    questions: Question[];
};

export function QuestionsGrid({ questions }: QuestionsGridProps) {
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleDownload = async (q: Question) => {
        const el = cardRefs.current[q.id];
        if (!el) return;

        try {
            const canvas = await html2canvas(el, {
                backgroundColor: '#111110',
                scale: 2,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `pregunta-wa-${q.id}.png`;
            link.click();
        } catch {
            alert('Error al generar la imagen. Intenta con captura nativa.');
        }
    };

    if (questions.length === 0) {
        return (
            <div className="qg-empty">
                No hay preguntas registradas aún.
            </div>
        );
    }

    return (
        <div className="qg-wrapper">
            <div className="qg-meta">
                <span className="qg-count">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</span>
                <span className="qg-hint">Descarga cada tarjeta para compartir en estados</span>
            </div>

            <div className="qg-grid">
                {questions.map((q, i) => (
                    <div
                        className="qg-card-wrapper"
                        key={q.id}
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        {/* 1. TARJETA EXPORTABLE (Lo que sale en la imagen) */}
                        <div
                            ref={el => { cardRefs.current[q.id] = el; }}
                            className="wa-export-card"
                        >
                            <div className="wa-card-header">
                                <Flame size={16} className="wa-brand-icon" />
                                <span className="wa-brand-name">ENTRE ALAS</span>
                                <span className="wa-card-date">
                                    {new Date(q.created_at).toLocaleDateString('es-MX', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            <div className="wa-card-body">
                                <MessageSquare size={20} className="wa-msg-icon" />
                                <p className="wa-question-text">"{q.pregunta}"</p>
                            </div>
                            {/* Se eliminó el footer con el teléfono de aquí */}
                        </div>

                        {/* 2. DATOS ADMINISTRATIVOS (Solo visibles en pantalla) */}
                        {q.telefono && (
                            <div className="admin-only-contact">
                                <Phone size={12} />
                                <span>{q.telefono}</span>
                            </div>
                        )}

                        {/* Botón de descarga */}
                        <button
                            className="wa-download-btn"
                            onClick={() => handleDownload(q)}
                            title="Descargar como imagen"
                        >
                            <Download size={14} />
                            Descargar para Estado
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}