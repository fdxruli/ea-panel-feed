import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare } from 'lucide-react';
import { questionSchema, type QuestionFormData } from '../types/schema';
import { supabase } from '../lib/supabase';

type QuestionFormProps = {
  isActive: boolean;
};

export function QuestionForm({ isActive }: QuestionFormProps) {
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    mode: 'onSubmit'
  });

  const onSubmit = async (data: QuestionFormData) => {
    setMsg(null);
    try {
      const payload = {
        pregunta: data.pregunta,
        telefono: data.telefono === '' ? null : data.telefono
      };
      
      const { error } = await supabase.from('questions').insert([payload]);
      if (error) throw error;

      setMsg({ type: 'success', text: 'Pregunta recibida — atento a nuestros estados' });
      reset();
      setTimeout(() => setMsg(null), 3500);
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
    }
  };

  return (
    <div className={`tab-panel ${isActive ? 'active' : ''}`}>
      <div className="info-box">
        <MessageSquare className="info-box-icon" />
        <div>
          <div className="info-box-title">Respondemos por WhatsApp</div>
          <div className="info-box-body">Déjanos tu duda sobre ingredientes, zonas de envío o lo que necesites. Si dejas tu número te respondemos directo, o lo compartimos anónimamente en nuestros estados.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field-group">
          <div className="section-label">Tu pregunta</div>
          <textarea 
            rows={4} 
            placeholder="Ej. ¿Qué tan picante es la salsa Mango Habanero?"
            {...register('pregunta')}
          ></textarea>
          {errors.pregunta && <span className="msg show error">{errors.pregunta.message}</span>}
        </div>

        <div className="field-group">
          <div className="section-label">WhatsApp (opcional)</div>
          <input 
            type="tel" 
            placeholder="Ej. 55 1234 5678"
            {...register('telefono')}
          />
          {errors.telefono && <span className="msg show error">{errors.telefono.message}</span>}
        </div>

        {msg && <div className={`msg show ${msg.type}`}>{msg.text}</div>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Enviando…' : 'Enviar pregunta'}</span>
        </button>
      </form>
    </div>
  );
}