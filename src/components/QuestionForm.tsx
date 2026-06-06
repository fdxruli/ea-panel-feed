import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { questionSchema, type QuestionFormInput, type QuestionFormOutput } from '../types/schema';
import { supabase } from '../lib/supabase';

type QuestionFormProps = {
    isActive: boolean;
};

export function QuestionForm({ isActive }: QuestionFormProps) {
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (msg) {
            timer = setTimeout(() => setMsg(null), 3000);
        }
        // Limpieza: si el componente se desmonta antes de los 3s, el timeout se cancela.
        return () => clearTimeout(timer);
    }, [msg]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting, errors }
    } = useForm<QuestionFormInput, any, QuestionFormOutput>({
        resolver: zodResolver(questionSchema),
        mode: 'onSubmit'
    });

    const preguntaValue = useWatch({ control, name: 'pregunta' }) || '';

    const onSubmit = async (data: QuestionFormOutput) => {
        setMsg(null);
        try {
            // Corrección: Tabla 'questions', no 'ratings'
            const { error } = await supabase.from('questions').insert([data]);
            if (error) throw error;

            setIsSuccess(true);
            reset();
            // El timeout ya está manejado de forma segura por el useEffect
        } catch (err) {
            setMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
        }
    };

    if (isSuccess) {
        return (
            <div className={`tab-panel ${isActive ? 'active' : ''}`}>
                <div className="success-state">
                    <CheckCircle className="success-icon" />
                    <h2>Pregunta enviada</h2>
                    <p>Atento a nuestros estados de WhatsApp, por ahí estaremos respondiendo las dudas más frecuentes.</p>
                    <button type="button" className="submit-btn" onClick={() => setIsSuccess(false)}>
                        <span>Hacer otra pregunta</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`tab-panel ${isActive ? 'active' : ''}`}>
            <div className="info-box">
                <MessageSquare className="info-box-icon" />
                <div>
                    <div className="info-box-title">Respondemos por WhatsApp</div>
                    <div className="info-box-body">Déjanos tu duda sobre ingredientes, zonas de envío o lo que necesites. Si dejas tu número te respondemos directo, o lo compartimos anónimamente en nuestros estados.</div>
                </div>
            </div>

            <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="question-grid">
                        <div className="field-group textarea-wrapper">
                            <div className="section-label">Tu pregunta</div>
                            <textarea
                                rows={4}
                                placeholder="Ej. ¿Qué tan picante es la salsa Mango Habanero?"
                                {...register('pregunta')}
                            ></textarea>
                            <div className={`char-counter ${preguntaValue.length > 900 ? 'warning' : ''}`}>
                                {preguntaValue.length} / 1000
                            </div>
                            {errors.pregunta && <span className="msg show error">{errors.pregunta.message}</span>}
                        </div>

                        <div className="field-group">
                            <div className="section-label">WhatsApp (opcional)</div>
                            <input
                                type="tel"
                                maxLength={12}
                                placeholder="Ej. 961 123 4567"
                                {...register('telefono', {
                                    onChange: (e) => {
                                        // Destruye en tiempo real cualquier caracter que NO sea número, espacio, guion, más o paréntesis
                                        e.target.value = e.target.value.replace(/[^\d\s\-+()]/g, '');
                                    }
                                })}
                            />
                            {errors.telefono && <span className="msg show error">{errors.telefono.message}</span>}
                        </div>
                    </div>

                    {msg && <div className={`msg show ${msg.type}`}>{msg.text}</div>}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Enviando…' : 'Enviar pregunta'}</span>
                    </button>
                </form>
            </fieldset>
        </div>
    );
}