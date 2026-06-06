import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flame, Frown, Meh, Snowflake, Thermometer, ThermometerSun, PackageOpen, ThumbsUp, PackageCheck, CheckCircle, Clock, Zap, Hourglass, Check, X } from 'lucide-react';
import { ratingSchema, type RatingFormInput, type RatingFormOutput } from '../types/schema';
import { supabase } from '../lib/supabase';

type RatingFormProps = {
    isActive: boolean;
};

const SaborChips = [
    { value: 'crudas', label: 'Crudas' },
    { value: 'secas', label: 'Secas' },
    { value: 'salsa_incorrecta', label: 'Salsa incorrecta' },
    { value: 'poca_salsa', label: 'Poca salsa' },
    { value: 'papas_aguadas', label: 'Papas aguadas' }
];

const ExactitudChips = [
    { value: 'falto_aderezo', label: 'Faltó aderezo' },
    { value: 'falto_bebida', label: 'Faltó bebida' },
    { value: 'sabor_equivocado', label: 'Sabor equivocado' },
    { value: 'falto_complemento', label: 'Faltó complemento' }
];

export function RatingForm({ isActive }: RatingFormProps) {
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<RatingFormInput, any, RatingFormOutput>({
        resolver: zodResolver(ratingSchema),
        mode: 'onSubmit',
        defaultValues: {
            problemas_sabor: [],
            problemas_exactitud: []
        }
    });

    const comentarioValue = useWatch({ control, name: 'comentario' }) || '';
    const saborValue = useWatch({ control, name: 'sabor' });
    const exactitudPedido = useWatch({ control, name: 'exactitud_pedido' });
    const problemasSabor = useWatch({ control, name: 'problemas_sabor' }) || [];
    const problemasExactitud = useWatch({ control, name: 'problemas_exactitud' }) || [];

    const toggleProblemaSabor = (val: string) => {
        const set = new Set(problemasSabor);
        if (set.has(val)) set.delete(val);
        else set.add(val);
        setValue('problemas_sabor', Array.from(set), { shouldValidate: true });
    };

    const toggleProblemaExactitud = (val: string) => {
        const set = new Set(problemasExactitud);
        if (set.has(val)) set.delete(val);
        else set.add(val);
        setValue('problemas_exactitud', Array.from(set), { shouldValidate: true });
    };

    const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numbers = e.target.value.replace(/\D/g, '');

        if (!numbers) {
            setValue('codigo_pedido', '');
            return;
        }

        let formatted = 'EA-';
        if (numbers.length > 0) {
            formatted += numbers.slice(0, 4);
        }
        if (numbers.length > 4) {
            formatted += '-' + numbers.slice(4, 7);
        }
        
        setValue('codigo_pedido', formatted);
    };

    const onSubmit = async (data: RatingFormOutput) => {
        setMsg(null);
        try {
            // Sanitización estricta antes de enviar a la base de datos
            const payload = { ...data };
            
            if (payload.sabor === 'excelente') {
                payload.problemas_sabor = [];
            }
            
            if (String(payload.exactitud_pedido) === 'true') {
                payload.problemas_exactitud = [];
            }

            const { error } = await supabase.from('ratings').insert([payload]);
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
                    <h2>¡Gracias por tu opinión!</h2>
                    <p>Tus comentarios nos ayudan a mejorar nuestro servicio día a día.</p>
                    <button type="button" className="submit-btn" onClick={() => setIsSuccess(false)}>
                        <span>Enviar otra calificación</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`tab-panel ${isActive ? 'active' : ''}`}>
            <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0 }}>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="field-group">
                        <div className="section-label">Código del pedido (Opcional)</div>
                        <input
                            type="text"
                            placeholder="Ej. EA-0223-123"
                            maxLength={11}
                            {...register('codigo_pedido')}
                            onChange={handleCodigoChange}
                            style={{ textTransform: 'uppercase' }}
                        />
                        {errors.codigo_pedido && <span className="msg show error">{errors.codigo_pedido.message}</span>}
                    </div>

                    <div className="divider"></div>

                    <div className="rating-groups-grid">
                        <div className="rating-group">
                            <div className="section-label">Sabor y calidad</div>
                            <div className="rating-options">
                                <label className="rating-btn malo">
                                    <input type="radio" value="malo" className="sr-only" {...register('sabor')} />
                                    <Frown className="btn-icon" />
                                    <span className="btn-label">Malas</span>
                                </label>
                                <label className="rating-btn regular">
                                    <input type="radio" value="regular" className="sr-only" {...register('sabor')} />
                                    <Meh className="btn-icon" />
                                    <span className="btn-label">Normales</span>
                                </label>
                                <label className="rating-btn excelente">
                                    <input type="radio" value="excelente" className="sr-only" {...register('sabor')} />
                                    <Flame className="btn-icon" />
                                    <span className="btn-label">Brutales</span>
                                </label>
                            </div>
                            {errors.sabor && <span className="msg show error">{errors.sabor.message}</span>}
                            
                            {(saborValue === 'malo' || saborValue === 'regular') && (
                                <div className="diagnostic-section fade-in">
                                    <div className="diagnostic-label">¿Qué falló con el sabor?</div>
                                    <div className="chip-group">
                                        {SaborChips.map(chip => (
                                            <button
                                                type="button"
                                                key={chip.value}
                                                className={`chip-btn ${problemasSabor.includes(chip.value) ? 'selected' : ''}`}
                                                onClick={() => toggleProblemaSabor(chip.value)}
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.problemas_sabor && <span className="msg show error">{errors.problemas_sabor.message}</span>}
                                </div>
                            )}
                        </div>

                        <div className="rating-group">
                            <div className="section-label">¿Llegó tu pedido completo?</div>
                            <div className="rating-options">
                                <label className="rating-btn excelente">
                                    <input type="radio" value="true" className="sr-only" {...register('exactitud_pedido')} />
                                    <Check className="btn-icon" />
                                    <span className="btn-label">Sí, completo</span>
                                </label>
                                <label className="rating-btn malo">
                                    <input type="radio" value="false" className="sr-only" {...register('exactitud_pedido')} />
                                    <X className="btn-icon" />
                                    <span className="btn-label">No, faltó algo</span>
                                </label>
                            </div>
                            {errors.exactitud_pedido && <span className="msg show error">{errors.exactitud_pedido.message}</span>}

                            {(exactitudPedido === false || exactitudPedido === 'false') && (
                                <div className="diagnostic-section fade-in">
                                    <div className="diagnostic-label">¿Qué faltó o estuvo mal?</div>
                                    <div className="chip-group">
                                        {ExactitudChips.map(chip => (
                                            <button
                                                type="button"
                                                key={chip.value}
                                                className={`chip-btn ${problemasExactitud.includes(chip.value) ? 'selected' : ''}`}
                                                onClick={() => toggleProblemaExactitud(chip.value)}
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.problemas_exactitud && <span className="msg show error">{errors.problemas_exactitud.message}</span>}
                                </div>
                            )}
                        </div>

                        <div className="rating-group">
                            <div className="section-label">Tiempo de espera</div>
                            <div className="rating-options">
                                <label className="rating-btn excelente">
                                    <input type="radio" value="rapido" className="sr-only" {...register('tiempo_espera')} />
                                    <Zap className="btn-icon" />
                                    <span className="btn-label">Rápido</span>
                                </label>
                                <label className="rating-btn regular">
                                    <input type="radio" value="esperado" className="sr-only" {...register('tiempo_espera')} />
                                    <Clock className="btn-icon" />
                                    <span className="btn-label">Esperado</span>
                                </label>
                                <label className="rating-btn malo">
                                    <input type="radio" value="tardado" className="sr-only" {...register('tiempo_espera')} />
                                    <Hourglass className="btn-icon" />
                                    <span className="btn-label">Tardado</span>
                                </label>
                            </div>
                            {errors.tiempo_espera && <span className="msg show error">{errors.tiempo_espera.message}</span>}
                        </div>

                        <div className="rating-group">
                            <div className="section-label">Temperatura al llegar</div>
                            <div className="rating-options">
                                <label className="rating-btn frio">
                                    <input type="radio" value="frio" className="sr-only" {...register('llegada')} />
                                    <Snowflake className="btn-icon" />
                                    <span className="btn-label">Frío</span>
                                </label>
                                <label className="rating-btn tibio">
                                    <input type="radio" value="tibio" className="sr-only" {...register('llegada')} />
                                    <Thermometer className="btn-icon" />
                                    <span className="btn-label">Tibio</span>
                                </label>
                                <label className="rating-btn caliente">
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
                                <label className="rating-btn malo">
                                    <input type="radio" value="batido" className="sr-only" {...register('empaque')} />
                                    <PackageOpen className="btn-icon" />
                                    <span className="btn-label">Batido</span>
                                </label>
                                <label className="rating-btn regular">
                                    <input type="radio" value="bien" className="sr-only" {...register('empaque')} />
                                    <ThumbsUp className="btn-icon" />
                                    <span className="btn-label">Bien</span>
                                </label>
                                <label className="rating-btn excelente">
                                    <input type="radio" value="intacto" className="sr-only" {...register('empaque')} />
                                    <PackageCheck className="btn-icon" />
                                    <span className="btn-label">Intacto</span>
                                </label>
                            </div>
                            {errors.empaque && <span className="msg show error">{errors.empaque.message}</span>}
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="field-group textarea-wrapper">
                        <div className="section-label">Comentario adicional</div>
                        <textarea
                            rows={3}
                            placeholder="Detalles que quieras compartir (opcional)"
                            {...register('comentario')}
                        ></textarea>
                        <div className={`char-counter ${comentarioValue.length > 450 ? 'warning' : ''}`}>
                            {comentarioValue.length} / 500
                        </div>
                        {errors.comentario && <span className="msg show error">{errors.comentario.message}</span>}
                    </div>

                    {msg && <div className={`msg show ${msg.type}`}>{msg.text}</div>}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Procesando…' : 'Enviar calificación'}</span>
                    </button>
                </form>
            </fieldset>
        </div>
    );
}