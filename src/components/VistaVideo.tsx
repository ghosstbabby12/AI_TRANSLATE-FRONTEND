import { useRef, useState } from "react";
import { api, type FormatoSubtitulos } from "../api";
import { useEstadoVideo } from "../hooks/useEstadoVideo";
import { navegar } from "../hooks/useRuta";
import { traducirMensajeServidor, useT } from "../i18n";
import { formatoTiempo } from "../vtt";
import { BarraProgreso } from "./BarraProgreso";
import { DescargaVideo } from "./DescargaVideo";
import { EstadoBadge } from "./EstadoBadge";
import { ConfirmarEliminar } from "./ConfirmarEliminar";
import { EditarNombre } from "./EditarNombre";
import { IconoDescargar, IconoEditar, IconoEliminar, IconoReintentar } from "./Iconos";
import { tituloVideo } from "../nombres";
import { OtrosIdiomas } from "./OtrosIdiomas";
import { ReproductorSubtitulado } from "./ReproductorSubtitulado";
import { ResumenVideo } from "./ResumenVideo";
import { VerUrl } from "./VerUrl";

export function VistaVideo({ id }: { id: string }) {
  const { detalle, estado, cues, error, reiniciar } = useEstadoVideo(id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tiempo, setTiempo] = useState(0);
  const [accion, setAccion] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  // Nombre cambiado en esta visita (el detalle no se vuelve a pedir al terminar)
  const [nombreLocal, setNombreLocal] = useState<string | null>(null);
  const t = useT();

  if (!estado || !detalle) {
    return <p className="sutil centrado">{error ?? t("app.cargando")}</p>;
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
      setAccion(
        r.video
          ? t("video.encolado")
          : r.reencolados === 1
            ? t("video.segmentosEncolados.uno")
            : t("video.segmentosEncolados.otros", { n: r.reencolados }),
      );
    } catch (e) {
      setAccion(e instanceof Error ? e.message : String(e));
    }
    reiniciar();
  };

  const titulo = nombreLocal ?? tituloVideo(detalle);
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
          data-tip={f === "txt" ? t("video.descargarTxt") : t("video.descargarSubtitulos", { formato: f })}
          aria-label={f === "txt" ? t("video.descargarTxt") : t("video.descargarSubtitulos", { formato: f })}
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
          data-tip={estado.progreso.total === 0 ? t("video.reintentarVideo") : t("video.reintentarSegmentos")}
          aria-label={estado.progreso.total === 0 ? t("video.reintentarVideo") : t("video.reintentarSegmentos")}
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
        <div className="vista-titulo">
          {editando ? (
            <EditarNombre
              nombreActual={titulo}
              onGuardar={async (nombre) => {
                await api.renombrarVideo(id, nombre);
                setNombreLocal(nombre);
                setEditando(false);
              }}
              onCancelar={() => setEditando(false)}
            />
          ) : (
            <h1>{titulo}</h1>
          )}
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
        <div className="cabecera-acciones">
          <EstadoBadge estado={estado.estado} />
          <button
            type="button"
            className="boton-icono"
            data-tip={t("video.editarNombre")}
            aria-label={t("video.editarNombre")}
            onClick={() => setEditando(true)}
            disabled={editando}
          >
            <IconoEditar />
          </button>
          <button
            type="button"
            className="boton-icono boton-peligro"
            data-tip={t("video.eliminar")}
            aria-label={t("video.eliminar")}
            onClick={() => setConfirmando(true)}
          >
            <IconoEliminar />
          </button>
        </div>
      </header>

      {confirmando && (
        <ConfirmarEliminar
          nombre={titulo}
          idioma={estado.idioma_destino}
          onConfirmar={async () => {
            await api.eliminarVideo(id);
            navegar("/historial");
          }}
          onCancelar={() => setConfirmando(false)}
        />
      )}

      {estado.estado === "error" && estado.error && <p className="error">{traducirMensajeServidor(estado.error)}</p>}
      {error && <p className="aviso">{t("conexion.reintentandoAviso", { error })}</p>}

      <div className="vista-cuerpo">
        <div className="columna-principal">
          <ReproductorSubtitulado
            url={detalle.url_reproduccion}
            portada={detalle.url_miniatura}
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
          <div className="tarjeta tarjeta-resumen">
            <ResumenVideo
              video={detalle}
              disponible={(estado.estado === "completo" || estado.estado === "error") && !sinSubtitulos}
              onBuscar={(segundos) => {
                buscar(segundos);
                videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          </div>
          <div className="tarjeta tarjeta-progreso">
            <BarraProgreso estado={estado} tiempoActual={tiempo} onBuscar={buscar} />
          </div>
          {accion && <p className="sutil">{accion}</p>}
        </div>

        <aside className="tarjeta transcripcion">
          <OtrosIdiomas
            id={id}
            idiomaActual={estado.idioma_destino}
            traducciones={detalle.traducciones ?? []}
            disponible={estado.progreso.total > 0}
          />
          <h2>{t("video.traduccionEnVivo")}</h2>
          {listos.length === 0 ? (
            <p className="sutil">{t("video.segmentosApareceran")}</p>
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
