import { useRef, useState } from "react";
import { api, type FormatoSubtitulos } from "../api";
import { useEstadoVideo } from "../hooks/useEstadoVideo";
import { formatoTiempo } from "../vtt";
import { BarraProgreso } from "./BarraProgreso";
import { DescargaVideo } from "./DescargaVideo";
import { EstadoBadge } from "./EstadoBadge";
import { IconoDescargar, IconoReintentar } from "./Iconos";
import { tituloVideo } from "../nombres";
import { ReproductorSubtitulado } from "./ReproductorSubtitulado";
import { VerUrl } from "./VerUrl";

export function VistaVideo({ id }: { id: string }) {
  const { detalle, estado, cues, error, reiniciar } = useEstadoVideo(id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tiempo, setTiempo] = useState(0);
  const [accion, setAccion] = useState<string | null>(null);

  if (!estado || !detalle) {
    return <p className="sutil centrado">{error ?? "Cargando…"}</p>;
  }

  const buscar = (segundos: number) => {
    if (videoRef.current) videoRef.current.currentTime = segundos;
  };

  const descargar = async (formato: FormatoSubtitulos) => {
    setAccion(null);
    try {
      await api.descargarSubtitulos(id, formato);
    } catch (e) {
      setAccion(e instanceof Error ? e.message : String(e));
    }
  };

  const reintentar = async () => {
    try {
      const r = await api.reintentar(id);
      setAccion(r.video ? "Video en cola de nuevo" : `${r.reencolados} segmento${r.reencolados === 1 ? "" : "s"} en cola de nuevo`);
    } catch (e) {
      setAccion(e instanceof Error ? e.message : String(e));
    }
    reiniciar();
  };

  const listos = estado.segmentos.filter((s) => s.estado === "listo" && s.texto_traducido);
  const sinSubtitulos = estado.progreso.listos === 0;
  const puedeReintentar =
    (estado.estado === "error" && estado.progreso.total === 0) ||
    (estado.progreso.errores > 0 && estado.estado !== "procesando");

  const acciones = (
    <>
      {(["srt", "vtt", "txt"] as const).map((f) => (
        <button
          key={f}
          type="button"
          className="boton-icono con-texto"
          data-tip={f === "txt" ? "Transcripción en texto (.txt)" : `Solo subtítulos, archivo de texto (.${f})`}
          aria-label={f === "txt" ? "Descargar transcripción .txt" : `Descargar subtítulos .${f}`}
          disabled={sinSubtitulos}
          onClick={() => descargar(f)}
        >
          <IconoDescargar />
          <span>{f.toUpperCase()}</span>
        </button>
      ))}
      {puedeReintentar && (
        <button
          type="button"
          className="boton-icono"
          data-tip={estado.progreso.total === 0 ? "Reintentar video" : "Reintentar segmentos fallidos"}
          aria-label={estado.progreso.total === 0 ? "Reintentar video" : "Reintentar segmentos fallidos"}
          onClick={reintentar}
        >
          <IconoReintentar />
        </button>
      )}
      <span className="separador" aria-hidden />
    </>
  );

  return (
    <section className="vista-video">
      <header className="vista-cabecera">
        <div>
          <h1>{tituloVideo(detalle)}</h1>
          <div className="ruta-idiomas">
            {estado.idioma_origen && (
              <>
                <span className="chip">{estado.idioma_origen.toUpperCase()}</span>→
              </>
            )}
            <span className="chip chip-acento">{estado.idioma_destino.toUpperCase()}</span>
            {detalle.origen_url && <VerUrl url={detalle.origen_url} />}
          </div>
        </div>
        <EstadoBadge estado={estado.estado} />
      </header>

      {estado.estado === "error" && estado.error && <p className="error">{estado.error}</p>}
      {error && <p className="aviso">Sin conexión con el servidor, reintentando… ({error})</p>}

      <div className="vista-cuerpo">
        <div className="columna-principal">
          <ReproductorSubtitulado
            url={detalle.url_reproduccion}
            cues={cues}
            segmentos={estado.segmentos}
            videoRef={videoRef}
            onTiempo={setTiempo}
            acciones={acciones}
            terminado={estado.estado === "completo" || estado.estado === "error"}
          />
          {detalle.url_reproduccion && (
            <div className="tarjeta tarjeta-descarga">
              <DescargaVideo id={id} estadoInicial={detalle.export_estado} deshabilitado={sinSubtitulos} />
            </div>
          )}
          <div className="tarjeta tarjeta-progreso">
            <BarraProgreso estado={estado} tiempoActual={tiempo} onBuscar={buscar} />
          </div>
          {accion && <p className="sutil">{accion}</p>}
        </div>

        <aside className="tarjeta transcripcion">
          <h2>Traducción en vivo</h2>
          {listos.length === 0 ? (
            <p className="sutil">Los segmentos aparecerán aquí a medida que se traduzcan.</p>
          ) : (
            <ol>
              {listos.map((s) => {
                const activo = tiempo >= s.tiempo_inicio && tiempo < s.tiempo_fin;
                return (
                  <li key={s.indice} className={activo ? "activo" : ""}>
                    <button type="button" onClick={() => buscar(s.tiempo_inicio)}>
                      <time>{formatoTiempo(s.tiempo_inicio)}</time>
                      <span>{s.texto_traducido}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>
    </section>
  );
}
