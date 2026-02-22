// src/components/RatingsTable.tsx
import './RatingsTable.css';

type Rating = {
    id: string;
    sabor: 'malo' | 'regular' | 'excelente';
    llegada: 'frio' | 'tibio' | 'caliente';
    empaque: 'batido' | 'bien' | 'intacto';
    comentario: string | null;
    created_at: string;
};

type RatingsTableProps = {
    ratings: Rating[];
};

const SABOR_BADGE: Record<Rating['sabor'], { label: string; cls: string }> = {
    excelente: { label: 'Brutal 🔥', cls: 'badge-green' },
    regular: { label: 'Normal', cls: 'badge-yellow' },
    malo: { label: 'Malo', cls: 'badge-red' },
};

const LLEGADA_BADGE: Record<Rating['llegada'], { label: string; cls: string }> = {
    caliente: { label: 'Caliente 🌡️', cls: 'badge-green' },
    tibio: { label: 'Tibio', cls: 'badge-yellow' },
    frio: { label: 'Frío ❄️', cls: 'badge-red' },
};

const EMPAQUE_BADGE: Record<Rating['empaque'], { label: string; cls: string }> = {
    intacto: { label: 'Intacto ✓', cls: 'badge-green' },
    bien: { label: 'Bien', cls: 'badge-yellow' },
    batido: { label: 'Batido', cls: 'badge-red' },
};

export function RatingsTable({ ratings }: RatingsTableProps) {
    if (ratings.length === 0) {
        return (
            <div className="rt-empty">
                No hay calificaciones registradas aún.
            </div>
        );
    }

    return (
        <div className="rt-wrapper">
            <div className="rt-meta">
                <span className="rt-count">{ratings.length} reseña{ratings.length !== 1 ? 's' : ''}</span>
                <span className="rt-hint">Mostrando las últimas 100</span>
            </div>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Sabor</th>
                            <th>Temperatura</th>
                            <th>Empaque</th>
                            <th>Comentario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings.map((r, i) => {
                            const sabor = SABOR_BADGE[r.sabor];
                            const llegada = LLEGADA_BADGE[r.llegada];
                            const empaque = EMPAQUE_BADGE[r.empaque];
                            return (
                                <tr
                                    key={r.id}
                                    className="rt-row"
                                    style={{ animationDelay: `${i * 20}ms` }}
                                >
                                    <td className="rt-date">
                                        {new Date(r.created_at).toLocaleString('es-MX', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td><span className={`badge ${sabor.cls}`}>{sabor.label}</span></td>
                                    <td><span className={`badge ${llegada.cls}`}>{llegada.label}</span></td>
                                    <td><span className={`badge ${empaque.cls}`}>{empaque.label}</span></td>
                                    <td
                                        className="rt-comment"
                                        title={r.comentario || ''}
                                    >
                                        {r.comentario || <span className="rt-empty-cell">—</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}