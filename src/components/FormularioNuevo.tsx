import { useEffect, useState, type FormEvent } from "react";
import { api, type Idioma } from "../api";
import { navegar } from "../hooks/useRuta";
import { bandera, capitalizar } from "../banderas";
import { IconoDescargar, IconoEnlace, IconoGlobo, IconoMas, IconoReloj, IconoSubir, IconoTraducir } from "./Iconos";
import { IlustracionArchivos } from "./IlustracionArchivos";

type Modo = "archivo" | "url";

const formatoMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function FormularioNuevo() {
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [modo, setModo] = useState<Modo>("archivo");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [idioma, setIdioma] = useState("es");
  const [arrastrando, setArrastrando] = useState(false);
  const [subida, setSubida] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.idiomas().then(setIdiomas, () => setError("No se pudo conectar con el servidor"));
  }, []);

  const enviando = subida !== null;
  const listo = modo === "archivo" ? archivo !== null : url.trim() !== "";

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubida(0);
    try {
      const video =
        modo === "archivo" && archivo
          ? await api.subirArchivo(archivo, idioma, setSubida)
          : await api.crearDesdeUrl(url.trim(), idioma);
      navegar(`/video/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubida(null);
    }
  }

  return (
    <section className="inicio">
      <header className="hero">
        <span className="hero-etiqueta">
          <IconoTraducir /> Subtítulos con IA
        </span>
        <h1 className="hero-titulo">
          Traductor de video <span className="texto-degradado">con IA</span>
        </h1>
        <p className="hero-subtitulo">
          Transcribe y traduce cualquier video, desde un archivo o un enlace. Los subtítulos aparecen en tiempo real
          mientras se procesa.
        </p>
      </header>

      <form className="tarjeta formulario" onSubmit={enviar}>
        <div className="pestanas" role="tablist">
          {(["archivo", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={modo === m}
              className={modo === m ? "activa" : ""}
              onClick={() => setModo(m)}
              disabled={enviando}
            >
              {m === "archivo" ? <IconoSubir /> : <IconoEnlace />}
              {m === "archivo" ? "Archivo local" : "Enlace en línea"}
            </button>
          ))}
        </div>

        {modo === "archivo" ? (
          <label
            className={`zona-archivo ${arrastrando ? "arrastrando" : ""} ${archivo ? "con-archivo" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              const f = e.dataTransfer.files[0];
              if (f) setArchivo(f);
            }}
          >
            <input
              type="file"
              accept="video/*,audio/*"
              disabled={enviando}
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
            <IlustracionArchivos />
            {archivo ? (
              <>
                <strong className="zona-titulo">{archivo.name}</strong>
                <span className="zona-texto">{formatoMB(archivo.size)} · Haz clic para cambiarlo</span>
              </>
            ) : (
              <>
                <strong className="zona-titulo">Sube un video o audio</strong>
                <span className="zona-texto">Arrástralo aquí o elígelo desde tu dispositivo</span>
                <span className="boton-falso" aria-hidden>
                  <IconoMas /> Elegir archivo
                </span>
              </>
            )}
          </label>
        ) : (
          <div className="zona-enlace">
            <IlustracionArchivos />
            <strong className="zona-titulo">Traduce desde un enlace</strong>
            <span className="zona-texto">YouTube, Vimeo, Wikimedia o un enlace directo a un archivo de video</span>
            <label className="campo-enlace">
              <IconoEnlace />
              <input
                type="url"
                placeholder="https://…"
                aria-label="Enlace del video"
                value={url}
                disabled={enviando}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
          </div>
        )}

        {enviando && modo === "archivo" && (
          <div className="progreso-barra" role="progressbar" aria-valuenow={Math.round(subida * 100)}>
            <div className="progreso-relleno" style={{ width: `${subida * 100}%` }} />
          </div>
        )}

        <div className="formulario-pie">
          <label className="campo campo-idioma">
            Traducir al
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} disabled={enviando}>
              {idiomas.map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {bandera(i.codigo)} {capitalizar(i.nombre)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="primario grande" disabled={!listo || enviando || idiomas.length === 0}>
            {!enviando && <IconoTraducir />}
            {enviando ? (modo === "archivo" ? `Subiendo… ${Math.round(subida * 100)}%` : "Registrando…") : "Traducir video"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      <ul className="ventajas">
        <li>
          <span className="ventaja-icono" aria-hidden>
            <IconoReloj />
          </span>
          <div>
            <strong>En tiempo real</strong>
            <span>Cada segmento aparece en cuanto está traducido.</span>
          </div>
        </li>
        <li>
          <span className="ventaja-icono" aria-hidden>
            <IconoDescargar />
          </span>
          <div>
            <strong>Descarga como quieras</strong>
            <span>SRT, VTT, TXT o el MP4 con subtítulos incrustados.</span>
          </div>
        </li>
        <li>
          <span className="ventaja-icono" aria-hidden>
            <IconoGlobo />
          </span>
          <div>
            <strong>{idiomas.length || 9} idiomas</strong>
            <span>Detecta el idioma original automáticamente.</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
