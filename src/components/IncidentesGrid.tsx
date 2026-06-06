import { supabase } from '../lib/supabase';
import type { Incident } from '../types/schema';
import { useState } from 'react';
import './IncidentesGrid.css';
import { Phone, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type IncidentesGridProps = {
  incidentes: Incident[];
};

export function IncidentesGrid({ incidentes }: IncidentesGridProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (incidentes.length === 0) {
    return (
      <div className="ig-empty">
        No hay incidentes urgentes reportados.
      </div>
    );
  }

  const handleResolver = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('incidentes')
        .update({ estado: 'resuelto' })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
      alert('Hubo un error al marcar el incidente como resuelto.');
    } finally {
      setLoadingId(null);
    }
  };

  const getProblemaLabel = (tipo: string) => {
    switch(tipo) {
      case 'pedido_no_llega': return 'No ha llegado';
      case 'pedido_equivocado': return 'Equivocado';
      case 'calidad_inaceptable': return 'Calidad Inaceptable';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  };

  const getWhatsAppLink = (telefono: string) => {
    const cleanPhone = telefono.replace(/\D/g, '');
    const waNumber = cleanPhone.startsWith('52') && cleanPhone.length === 12 
      ? cleanPhone 
      : `52${cleanPhone}`;
    return `https://wa.me/${waNumber}`;
  };

  return (
    <div className="ig-grid">
      {incidentes.map((incidente) => (
        <div key={incidente.id} className="ig-card">
          <div className="ig-header">
            <span className="ig-date">
              {new Date(incidente.created_at).toLocaleString('es-MX')}
            </span>
            <span className={`ig-status ${incidente.estado === 'resuelto' ? 'resuelto' : 'pendiente'}`}>
              {incidente.estado === 'resuelto' ? (
                <span className="ig-status-content"><CheckCircle2 size={14} /> Resuelto</span>
              ) : incidente.estado === 'pendiente' ? (
                <span className="ig-status-content"><Clock size={14} /> Pendiente</span>
              ) : (
                <span className="ig-status-content"><AlertCircle size={14} /> En revisión</span>
              )}
            </span>
          </div>
          
          <div className="ig-title">
            <AlertCircle size={18} className="ig-title-icon" />
            {getProblemaLabel(incidente.tipo_problema)}
          </div>
          
          <div className="ig-details">
            {incidente.detalles}
          </div>

          <div className="ig-contact">
             <Phone size={18} className="ig-phone-icon" />
             <a 
               href={getWhatsAppLink(incidente.telefono)} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="ig-phone-link"
             >
               {incidente.telefono}
             </a>
          </div>

          {incidente.estado !== 'resuelto' && (
            <button 
              onClick={() => handleResolver(incidente.id)}
              className="ig-resolve-btn"
              disabled={loadingId === incidente.id}
            >
              {loadingId === incidente.id ? (
                <>
                  <Clock size={18} className="ig-spin" /> Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Marcar como Resuelto
                </>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
