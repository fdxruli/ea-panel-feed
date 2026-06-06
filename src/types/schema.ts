import { z } from 'zod';

export type Rating = {
  id: string;
  sabor: 'malo' | 'regular' | 'excelente';
  problemas_sabor?: string[];
  tiempo_espera: 'rapido' | 'esperado' | 'tardado';
  exactitud_pedido: boolean;
  problemas_exactitud?: string[];
  llegada: 'frio' | 'tibio' | 'caliente';
  empaque: 'batido' | 'bien' | 'intacto';
  codigo_pedido: string | null;
  comentario: string | null;
  created_at: string;
};

export type Incident = {
  id: string;
  tipo_problema: 'pedido_no_llega' | 'pedido_equivocado' | 'calidad_inaceptable' | 'otro';
  detalles: string;
  telefono: string;
  estado: 'pendiente' | 'en_revision' | 'resuelto';
  created_at: string;
};

const saborOpciones = ['malo', 'regular', 'excelente'] as const;
const tiempoEsperaOpciones = ['rapido', 'esperado', 'tardado'] as const;
const llegadaOpciones = ['frio', 'tibio', 'caliente'] as const;
const empaqueOpciones = ['batido', 'bien', 'intacto'] as const;

export const ratingSchema = z.object({
    sabor: z.enum(saborOpciones, { message: 'Debes seleccionar una opción para el sabor.' }),
    problemas_sabor: z.array(z.string()).optional(),
    tiempo_espera: z.enum(tiempoEsperaOpciones, { message: 'Debes evaluar el tiempo de espera.' }),
    exactitud_pedido: z.preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
    }, z.boolean({ message: 'Debes indicar si el pedido llegó completo.' })),
    problemas_exactitud: z.array(z.string()).optional(),
    llegada: z.enum(llegadaOpciones, { message: 'Debes indicar la temperatura de llegada.' }),
    empaque: z.enum(empaqueOpciones, { message: 'Debes calificar el estado del empaque.' }),
    
    codigo_pedido: z.string()
        .trim()
        .toUpperCase()
        .transform(val => val.replace(/\s+/g, ''))
        .transform(val => {
            if (/^EA\d{7}$/.test(val)) {
                return val.replace(/^EA(\d{4})(\d{3})$/, 'EA-$1-$2');
            }
            return val;
        })
        .pipe(
            z.union([
                z.literal(''),
                z.string().regex(/^EA-\d{4}-\d{3}$/, 'Formato inválido. Usa: EA-XXXX-YYY')
            ])
        )
        .transform(val => val === '' ? null : val)
        .optional(),
        
    comentario: z.string()
        .max(500, 'El comentario es demasiado largo.')
        .optional()
        .transform(val => val === '' ? null : val),
}).superRefine((data, ctx) => {
    if ((data.sabor === 'malo' || data.sabor === 'regular') && (!data.problemas_sabor || data.problemas_sabor.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Selecciona al menos un problema de sabor.',
            path: ['problemas_sabor']
        });
    }
    if (data.exactitud_pedido === false && (!data.problemas_exactitud || data.problemas_exactitud.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Selecciona al menos un problema con la exactitud de tu pedido.',
            path: ['problemas_exactitud']
        });
    }
});

export const issueReportSchema = z.object({
    tipo_problema: z.enum(['pedido_no_llega', 'pedido_equivocado', 'calidad_inaceptable', 'otro'] as const, { message: 'Debes seleccionar el tipo de problema.' }),
    detalles: z.string()
        .min(5, 'Explica un poco más tu problema.')
        .max(1000, 'El detalle es demasiado largo.'),
    telefono: z.string()
        .regex(/^[\d\s\-+()]+$/, 'El teléfono contiene caracteres no permitidos.')
        .min(10, 'El teléfono debe tener al menos 10 caracteres válidos.')
        .max(25, 'Número demasiado largo.'),
});

export type RatingFormInput = z.input<typeof ratingSchema>;
export type RatingFormOutput = z.infer<typeof ratingSchema>;

export type IssueReportFormInput = z.input<typeof issueReportSchema>;
export type IssueReportFormOutput = z.infer<typeof issueReportSchema>;

export type Question = {
  id: string;
  pregunta: string;
  telefono?: string | null;
  created_at: string;
};

export const questionSchema = z.object({
    pregunta: z.string()
        .min(5, 'La pregunta es muy corta.')
        .max(1000, 'La pregunta es demasiado larga.'),
    telefono: z.string()
        .regex(/^[\d\s\-+()]*$/, 'Formato de teléfono inválido')
        .max(25, 'Número demasiado largo.')
        .optional()
        .transform(val => val === '' ? null : val),
});

export type QuestionFormInput = z.input<typeof questionSchema>;
export type QuestionFormOutput = z.infer<typeof questionSchema>;