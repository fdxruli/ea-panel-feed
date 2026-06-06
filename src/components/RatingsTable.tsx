// src/components/RatingsTable.tsx
import "./RatingsTable.css";
import type { Rating } from "../types/schema";
import {
  Flame,
  Meh,
  Frown,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";

type RatingsTableProps = {
  ratings: Rating[];
};

const SABOR_BADGE: Record<
  Rating["sabor"],
  { label: string; cls: string; icon: React.ElementType }
> = {
  excelente: { label: "Brutal", cls: "badge-green", icon: Flame },
  regular: { label: "Normal", cls: "badge-yellow", icon: Meh },
  malo: { label: "Malo", cls: "badge-red", icon: Frown },
};

const LLEGADA_BADGE: Record<
  Rating["llegada"],
  { label: string; cls: string; icon: React.ElementType }
> = {
  caliente: { label: "Caliente", cls: "badge-green", icon: Flame },
  tibio: { label: "Tibio", cls: "badge-yellow", icon: Meh },
  frio: { label: "Frío", cls: "badge-red", icon: Frown },
};

const EMPAQUE_BADGE: Record<
  Rating["empaque"],
  { label: string; cls: string; icon: React.ElementType }
> = {
  intacto: { label: "Intacto", cls: "badge-green", icon: CheckCircle },
  bien: { label: "Bien", cls: "badge-yellow", icon: Meh },
  batido: { label: "Batido", cls: "badge-red", icon: XCircle },
};

export function RatingsTable({ ratings }: RatingsTableProps) {
  if (ratings.length === 0) {
    return (
      <div className="rt-empty">No hay calificaciones registradas aún.</div>
    );
  }

  return (
    <div className="rt-wrapper">
      <div className="rt-meta">
        <span className="rt-count">
          {ratings.length} reseña{ratings.length !== 1 ? "s" : ""}
        </span>
        <span className="rt-hint">Mostrando las últimas 100</span>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>pedido</th>
              <th>Tiempo</th>
              <th>Diagnóstico</th>
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
                  <td data-label="Fecha" className="rt-date">
                    {new Date(r.created_at).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td data-label="Pedido" className="rt-code">
                    {r.codigo_pedido ? (
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          color: "var(--accent)",
                        }}
                      >
                        {r.codigo_pedido}
                      </span>
                    ) : (
                      <span className="rt-empty-cell">—</span>
                    )}
                  </td>
                  <td data-label="Tiempo">
                    <span
                      className="badge badge-yellow"
                      style={{
                        background: "transparent",
                        color: "var(--text)",
                      }}
                    >
                      {r.tiempo_espera}
                    </span>
                  </td>
                  <td data-label="Diagnóstico" className="rt-diagnosis">
                    <div className="diagnosis-wrapper">
                      {r.exactitud_pedido === false && (
                        <div className="diagnosis-item error">
                          <XCircle size={14} className="diagnosis-icon" />
                          <span className="diagnosis-label">INCOMPLETO:</span>
                          <span className="diagnosis-text">
                            {r.problemas_exactitud?.join(", ")}
                          </span>
                        </div>
                      )}
                      {(r.sabor === "malo" || r.sabor === "regular") && (
                        <div className="diagnosis-item warning">
                          <AlertTriangle size={14} className="diagnosis-icon" />
                          <span className="diagnosis-label">CALIDAD:</span>
                          <span className="diagnosis-text">
                            {r.problemas_sabor?.join(", ")}
                          </span>
                        </div>
                      )}
                      {r.exactitud_pedido === true &&
                        r.sabor === "excelente" && (
                          <div className="diagnosis-item success">
                            <CheckCircle size={14} className="diagnosis-icon" />
                            <span className="diagnosis-text">
                              Sin problemas
                            </span>
                          </div>
                        )}
                    </div>
                  </td>
                  <td data-label="Sabor">
                    <span className={`badge ${sabor.cls}`}>
                      <sabor.icon size={14} className="badge-icon" />{" "}
                      {sabor.label}
                    </span>
                  </td>
                  <td data-label="Temperatura">
                    <span className={`badge ${llegada.cls}`}>
                      <llegada.icon size={14} className="badge-icon" />{" "}
                      {llegada.label}
                    </span>
                  </td>
                  <td data-label="Empaque">
                    <span className={`badge ${empaque.cls}`}>
                      <empaque.icon size={14} className="badge-icon" />{" "}
                      {empaque.label}
                    </span>
                  </td>
                  <td
                    data-label="Comentario"
                    className="rt-comment"
                    title={r.comentario || ""}
                  >
                    <div className="comment-wrapper">
                      {r.comentario || <span className="rt-empty-cell">—</span>}
                    </div>
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
