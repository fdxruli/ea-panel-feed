import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertOctagon, CheckCircle } from 'lucide-react';
import { issueReportSchema, type IssueReportFormInput, type IssueReportFormOutput } from '../types/schema';
import { supabase } from '../lib/supabase';

type IssueReportFormProps = {
    isActive: boolean;
};

export function IssueReportForm({ isActive }: IssueReportFormProps) {
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (msg) {
            timer = setTimeout(() => setMsg(null), 3000);
        }
        return () => clearTimeout(timer);
    }, [msg]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting, errors }
    } = useForm<IssueReportFormInput, any, IssueReportFormOutput>({
        resolver: zodResolver(issueReportSchema),
        mode: 'onSubmit'
    });

    const detallesValue = useWatch({ control, name: 'detalles' }) || '';

    const onSubmit = async (data: IssueReportFormOutput) => {
        setMsg(null);
        try {
            const { error } = await supabase.from('incidentes').insert([data]);
            if (error) throw error;

            setIsSuccess(true);
            reset();
        } catch (err) {
            setMsg({ type: 'error', text: 'Error al enviar. Intenta de nuevo.' });
        }
    };

    if (isSuccess) {
        return (
            <div className={`tab-panel ${isActive ? 'active' : ''}`}>
                <div className="success-state">
                    <CheckCircle className="success-icon" />
                    <h2>Reporte enviado</h2>
                    <p>Hemos recibido tu reporte. Nuestro equipo revisará la situación y te contactará al teléfono proporcionado.</p>
                    <button type="button" className="submit-btn" onClick={() => setIsSuccess(false)}>
                        <span>Enviar otro reporte</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`tab-panel ${isActive ? 'active' : ''}`}>
            <div className="info-box" style={{ borderColor: 'rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.05)' }}>
                <AlertOctagon className="info-box-icon" style={{ color: '#e07070' }} />
                <div>
                    <div className="info-box-title" style={{ color: '#e07070' }}>Reportar Problema</div>
                    <div className="info-box-body">Si tuviste un problema urgente con tu pedido (no llegó, equivocado o calidad inaceptable), repórtalo aquí para que podamos darte una solución rápida.</div>
                </div>
            </div>

            <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="field-group">
                        <div className="section-label">Tipo de problema</div>
                        <div className="chip-group">
                            <label className="chip-btn">
                                <input type="radio" value="pedido_no_llega" className="sr-only" {...register('tipo_problema')} />
                                <span>No ha llegado</span>
                            </label>
                            <label className="chip-btn">
                                <input type="radio" value="pedido_equivocado" className="sr-only" {...register('tipo_problema')} />
                                <span>Equivocado</span>
                            </label>
                            <label className="chip-btn">
                                <input type="radio" value="calidad_inaceptable" className="sr-only" {...register('tipo_problema')} />
                                <span>Calidad inaceptable</span>
                            </label>
                        </div>
                        {errors.tipo_problema && <span className="msg show error">{errors.tipo_problema.message}</span>}
                    </div>

                    <div className="field-group">
                        <div className="section-label">Teléfono (Obligatorio)</div>
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

                    <div className="field-group textarea-wrapper">
                        <div className="section-label">Detalles adicionales</div>
                        <textarea
                            rows={4}
                            placeholder="Describe qué sucedió..."
                            {...register('detalles')}
                        ></textarea>
                        <div className={`char-counter ${detallesValue.length > 900 ? 'warning' : ''}`}>
                            {detallesValue.length} / 1000
                        </div>
                        {errors.detalles && <span className="msg show error">{errors.detalles.message}</span>}
                    </div>

                    {msg && <div className={`msg show ${msg.type}`}>{msg.text}</div>}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Enviando…' : 'Enviar reporte'}</span>
                    </button>
                </form>
            </fieldset>
        </div>
    );
}
