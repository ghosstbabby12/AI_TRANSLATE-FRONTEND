import { useEffect, useState } from "react";
import { api, type FormatoSubtitulos, type VideoHistorial } from "../api";
import { navegar } from "../hooks/useRuta";
import { tituloVideo } from "../nombres";
import { ConfirmarEliminar } from "./ConfirmarEliminar";
import { EditarNombre } from "./EditarNombre";
import { EstadoBadge } from "./EstadoBadge";
import { IconoAbrir, IconoDescargar, IconoEditar, IconoEliminar, IconoVideo } from "./Iconos";

const fecha = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" });

export function Historial() {
  const [videos, setVideos] = useState<VideoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<VideoHistorial | null>(null);

  // Se refresca solo mientras haya algún video en proceso.
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let vivo = true;
    async function cargar() {
      try {
        const lista = await api.listarVideos();
        if (!vivo) return;
        setVideos(lista);
        setError(null);
        if (lista.some((v) => v.estado === "pendiente" || v.estado === "procesando")) {
          temporizador = setTimeout(cargar, 5000);
        }
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : String(e));
      }
    }
    cargar();
    return () => {
      vivo = false;
      clearTimeout(temporizador);
    };
  }, []);

  async function renombrar(id: string, nombre: string) {
    await api.renombrarVideo(id, nombre);
    // El nombre cambia también en las otras traducciones del mismo video
    setVideos(await api.listarVideos());
    setEditandoId(null);
  }

  async function eliminar(video: VideoHistorial) {
    await api.eliminarVideo(video.id);
    setVideos((lista) => lista?.filter((v) => v.id !== video.id) ?? null);
    setAEliminar(null);
  }

  const descargar = (id: string, formato: FormatoSubtitulos) =>
    api.descargarSubtitulos(id, formato).catch((e) => setError(e.message));

  if (error && !videos) return <p className="error centrado">{error}</p>;
  if (!videos) return <p className="sutil centrado">Cargando…</p>;

  return (
    <section className="historial-vista">
      <header className="titulo-seccion">
        <h1>Historial</h1>
        <p className="sutil">
          {videos.length} video{videos.length === 1 ? "" : "s"} traducido{videos.length === 1 ? "" : "s"}
        </p>
      </header>
      {error && <p className="error">{error}</p>}

      {videos.length === 0 ? (
        <div className="tarjeta vacio">
          <span className="icono-grande" aria-hidden>
            <IconoVideo />
          </span>
          <p>Todavía no has traducido ningún video.</p>
          <button type="button" className="primario" onClick={() => navegar("/")}>
            Traducir el primero
          </button>
        </div>
      ) : (
        <ul className="historial">
          {videos.map((v) => {
            const total = v.total_segmentos ?? 0;
            const pct = total ? Math.round((v.segmentos_listos / total) * 100) : 0;
            const sinSubtitulos = v.segmentos_listos === 0;
            return (
              <li key={v.id} className="tarjeta tarjeta-video">
                <button type="button" className="tarjeta-video-cuerpo" onClick={() => navegar(`/video/${v.id}`)}>
                  <span className="miniatura" aria-hidden>
                    <IconoVideo />
                    <span className="chip chip-acento">{v.idioma_destino.toUpperCase()}</span>
                  </span>
                  <strong title={tituloVideo(v)}>{tituloVideo(v)}</strong>
                  <span className="sutil">
                    {fecha.format(new Date(v.creado_en))}
                    {total > 0 && ` · ${v.segmentos_listos}/${total} segmentos`}
                  </span>
                  {v.estado === "procesando" && total > 0 && (
                    <div className="progreso-barra fina">
                      <div className="progreso-relleno" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </button>

                <div className="tarjeta-video-pie">
                  {editandoId === v.id ? (
                    <EditarNombre
                      nombreActual={tituloVideo(v)}
                      onGuardar={(nombre) => renombrar(v.id, nombre)}
                      onCancelar={() => setEditandoId(null)}
                    />
                  ) : (
                    <>
                      <EstadoBadge estado={v.estado} />
                      <span className="espaciador" />
                      <button
                        type="button"
                        className="boton-icono"
                        data-tip="Editar nombre"
                        aria-label={`Editar el nombre de ${tituloVideo(v)}`}
                        onClick={() => setEditandoId(v.id)}
                      >
                        <IconoEditar />
                      </button>
                      <button
                        type="button"
                        className="boton-icono boton-peligro"
                        data-tip="Eliminar"
                        aria-label={`Eliminar ${tituloVideo(v)}`}
                        onClick={() => setAEliminar(v)}
                      >
                        <IconoEliminar />
                      </button>
                    </>
                  )}
                </div>

                {/* Acciones flotantes sobre la miniatura */}
                <div className="barra-flotante compacta">
                  {(["srt", "vtt"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className="boton-icono con-texto"
                      data-tip={`Descargar .${f}`}
                      aria-label={`Descargar subtítulos .${f} de ${v.nombre}`}
                      disabled={sinSubtitulos}
                      onClick={() => descargar(v.id, f)}
                    >
                      <IconoDescargar />
                      <span>{f.toUpperCase()}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="boton-icono"
                    data-tip="Abrir"
                    aria-label={`Abrir ${v.nombre}`}
                    onClick={() => navegar(`/video/${v.id}`)}
                  >
                    <IconoAbrir />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {aEliminar && (
        <ConfirmarEliminar
          nombre={tituloVideo(aEliminar)}
          idioma={aEliminar.idioma_destino}
          onConfirmar={() => eliminar(aEliminar)}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </section>
  );
}
