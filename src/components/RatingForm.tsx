import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flame, Frown, Meh, Snowflake, Thermometer, ThermometerSun, PackageOpen, ThumbsUp, PackageCheck } from 'lucide-react';
import { ratingSchema, type RatingFormData } from '../types/schema';
import { supabase } from '../lib/supabase';

type RatingFormProps = {
  isActive: boolean;
};

export function RatingForm({ isActive }: RatingFormProps) {
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    mode: 'onSubmit'
  });

  const onSubmit = async (data: RatingFormData) => {
    setMsg(null);
    try {
      const { error } = await supabase.from('ratings').insert([data]);
      if (error) throw error;
      
      setMsg({ type: 'success', text: '¡Gracias! Tu calificación fue registrada 🔥' });
      reset();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
    }
  };

  return (
    <div className={`tab-panel ${isActive ? 'active' : ''}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rating-group">
          <div className="section-label">Sabor y calidad</div>
          <div className="rating-options">
            <label className="rating-btn">
              <input type="radio" value="malo" className="sr-only" {...register('sabor')} />
              <Frown className="btn-icon" />
              <span className="btn-label">Malas</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="regular" className="sr-only" {...register('sabor')} />
              <Meh className="btn-icon" />
              <span className="btn-label">Normales</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="excelente" className="sr-only" {...register('sabor')} />
              <Flame className="btn-icon" />
              <span className="btn-label">Brutales</span>
            </label>
          </div>
          {errors.sabor && <span className="msg show error">{errors.sabor.message}</span>}
        </div>

        <div className="rating-group">
          <div className="section-label">Temperatura al llegar</div>
          <div className="rating-options">
            <label className="rating-btn">
              <input type="radio" value="frio" className="sr-only" {...register('llegada')} />
              <Snowflake className="btn-icon" />
              <span className="btn-label">Frío</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="tibio" className="sr-only" {...register('llegada')} />
              <Thermometer className="btn-icon" />
              <span className="btn-label">Tibio</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="caliente" className="sr-only" {...register('llegada')} />
              <ThermometerSun className="btn-icon" />
              <span className="btn-label">Caliente</span>
            </label>
          </div>
          {errors.llegada && <span className="msg show error">{errors.llegada.message}</span>}
        </div>

        <div className="rating-group">
          <div className="section-label">Estado del empaque</div>
          <div className="rating-options">
            <label className="rating-btn">
              <input type="radio" value="batido" className="sr-only" {...register('empaque')} />
              <PackageOpen className="btn-icon" />
              <span className="btn-label">Batido</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="bien" className="sr-only" {...register('empaque')} />
              <ThumbsUp className="btn-icon" />
              <span className="btn-label">Bien</span>
            </label>
            <label className="rating-btn">
              <input type="radio" value="intacto" className="sr-only" {...register('empaque')} />
              <PackageCheck className="btn-icon" />
              <span className="btn-label">Intacto</span>
            </label>
          </div>
          {errors.empaque && <span className="msg show error">{errors.empaque.message}</span>}
        </div>

        <div className="divider"></div>

        <div className="field-group">
          <div className="section-label">Comentario adicional</div>
          <textarea 
            rows={3} 
            placeholder="Detalles que quieras compartir (opcional)"
            {...register('comentario')}
          ></textarea>
          {errors.comentario && <span className="msg show error">{errors.comentario.message}</span>}
        </div>

        {msg && <div className={`msg show ${msg.type}`}>{msg.text}</div>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Procesando…' : 'Enviar calificación'}</span>
        </button>
      </form>
    </div>
  );
}