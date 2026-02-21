import { z } from 'zod';

const saborOpciones = ['malo', 'regular', 'excelente'] as const;
const llegadaOpciones = ['frio', 'tibio', 'caliente'] as const;
const empaqueOpciones = ['batido', 'bien', 'intacto'] as const;

export const ratingSchema = z.object({
    sabor: z.enum(saborOpciones, {
        message: 'Debes seleccionar una opción para el sabor.',
    }),
    llegada: z.enum(llegadaOpciones, {
        message: 'Debes indicar la temperatura de llegada.',
    }),
    empaque: z.enum(empaqueOpciones, {
        message: 'Debes calificar el estado del empaque.',
    }),
    comentario: z.string().max(500, 'El comentario es demasiado largo. Máximo 500 caracteres.').optional(),
});

export const questionSchema = z.object({
    pregunta: z.string().min(5, 'La pregunta es muy corta.').max(1000, 'La pregunta es demasiado larga.'),
    telefono: z.string()
        .regex(/^[\d\s\-+()]+$/, 'El teléfono contiene caracteres no permitidos.')
        .min(10, 'El teléfono debe tener al menos 10 caracteres válidos.')
        .max(25, 'Número demasiado largo.')
        .optional()
        .or(z.literal('')),
});

export type RatingFormData = z.infer<typeof ratingSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;