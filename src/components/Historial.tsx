import { useEffect, useState } from "react";
import { api, type FormatoSubtitulos, type VideoHistorial } from "../api";
import { navegar } from "../hooks/useRuta";
import { idiomaActual, useT } from "../i18n";
import { tituloVideo } from "../nombres";
import { ConfirmarEliminar } from "./ConfirmarEliminar";
import { EditarNombre } from "./EditarNombre";
import { EstadoBadge } from "./EstadoBadge";
import { formatoTiempo } from "../vtt";
import { IconoAbrir, IconoDescargar, IconoEditar, IconoEliminar, IconoPlay, IconoVideo } from "./Iconos";

const formatoFecha = (iso: string) =>
  new Intl.DateTimeFormat(idiomaActual(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export function Historial() {
  const [videos, setVideos] = useState<VideoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<VideoHistorial | null>(null);
  const t = useT();

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
  if (!videos) return <p className="sutil centrado">{t("app.cargando")}</p>;

  return (
    <section className="historial-vista">
      <header className="titulo-seccion">
        <h1>{t("historial.titulo")}</h1>
        <p className="sutil">
          {videos.length === 1 ? t("historial.contador.uno") : t("historial.contador.otros", { n: videos.length })}
        </p>
      </header>
      {error && <p className="error">{error}</p>}

      {videos.length === 0 ? (
        <div className="tarjeta vacio">
          <span className="icono-grande" aria-hidden>
            <IconoVideo />
          </span>
          <p>{t("historial.vacio")}</p>
          <button type="button" className="primario" onClick={() => navegar("/")}>
            {t("historial.traducirPrimero")}
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
                    {v.url_miniatura && (
                      <img
                        src={v.url_miniatura}
                        alt=""
                        loading="lazy"
                        // Si la URL caducó o falla, queda el degradado de fondo
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <span className="miniatura-play">
                      <IconoPlay />
                    </span>
                    <span className="chip chip-acento">{v.idioma_destino.toUpperCase()}</span>
                    {v.duracion_seg != null && <span className="miniatura-duracion">{formatoTiempo(v.duracion_seg)}</span>}
                  </span>
                  <strong title={tituloVideo(v)}>{tituloVideo(v)}</strong>
                  <span className="sutil">
                    {formatoFecha(v.creado_en)}
                    {total > 0 && ` · ${t("historial.segmentos", { listos: v.segmentos_listos, total })}`}
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
                        data-tip={t("video.editarNombre")}
                        aria-label={t("historial.editarAria", { nombre: tituloVideo(v) })}
                        onClick={() => setEditandoId(v.id)}
                      >
                        <IconoEditar />
                      </button>
                      <button
                        type="button"
                        className="boton-icono boton-peligro"
                        data-tip={t("eliminar.eliminar")}
                        aria-label={t("historial.eliminarAria", { nombre: tituloVideo(v) })}
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
                      data-tip={t("historial.descargarFormato", { formato: f })}
                      aria-label={t("historial.descargarAria", { formato: f, nombre: tituloVideo(v) })}
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
                    data-tip={t("historial.abrir")}
                    aria-label={t("historial.abrirAria", { nombre: tituloVideo(v) })}
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
