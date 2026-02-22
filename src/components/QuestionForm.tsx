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

      setMsg({
        type: 'success',
        text: '¡Listo! En Entre Alas te respondemos muy pronto 🍗🔥'
      });

      reset();
      setTimeout(() => setMsg(null), 3500);
    } catch (err) {
      setMsg({
        type: 'error',
        text: 'Hubo un problema al enviar tu pregunta. Intenta de nuevo.'
      });
    }
  };

  return (
    <div className={`tab-panel ${isActive ? 'active' : ''}`}>

      {/* Info principal */}
      <div className="info-box">
        <MessageSquare className="info-box-icon" />
        <div>
          <div className="info-box-title">Este es el buzón de Entre Alas</div>
<div className="info-box-body">
  Aquí vale todo: dudas, antojos, sugerencias, quejas suaves  
  y hasta chismes (sí, también leemos chismes 😅).  
  Si dejas tu WhatsApp te respondemos directo.  
  Si no, lo soltamos anónimo en nuestros estados.
</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Pregunta */}
        <div className="field-group">
          <div className="section-label">Tu pregunta</div>
          <textarea
            rows={4}
            placeholder={`Escribe tu duda aquí…`}
            {...register('pregunta')}
          />
          {errors.pregunta && (
            <span className="msg show error">{errors.pregunta.message}</span>
          )}
        </div>

        {/* WhatsApp */}
        <div className="field-group">
          <div className="section-label">WhatsApp (te respondemos más rápido)</div>
          <input
            type="tel"
            placeholder="Ej. 9631834700"
            {...register('telefono')}
          />
          {errors.telefono && (
            <span className="msg show error">{errors.telefono.message}</span>
          )}
        </div>

        {/* Mensaje sistema */}
        {msg && (
          <div className={`msg show ${msg.type}`}>
            {msg.text}
          </div>
        )}

        {/* Nota confianza */}
        <p className="mini-note">
          Tu número solo se usa para responderte. No lo compartimos.
        </p>

        {/* Botón */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Enviando…' : 'Enviar pregunta'}</span>
        </button>

      </form>
    </div>
  );
}