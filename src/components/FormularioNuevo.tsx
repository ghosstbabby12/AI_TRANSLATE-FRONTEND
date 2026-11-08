import { useEffect, useState, type FormEvent } from "react";
import { api, type Idioma } from "../api";
import { navegar } from "../hooks/useRuta";
import { bandera } from "../banderas";
import { nombreIdioma, useT } from "../i18n";
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
  const t = useT();

  useEffect(() => {
    api.idiomas().then(setIdiomas, (e) => setError(e instanceof Error ? e.message : String(e)));
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
          <IconoTraducir /> {t("inicio.etiqueta")}
        </span>
        <h1 className="hero-titulo">
          {t("inicio.titulo")} <span className="texto-degradado">{t("inicio.tituloDestacado")}</span>
        </h1>
        <p className="hero-subtitulo">
          {t("inicio.subtitulo")}
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
              {m === "archivo" ? t("inicio.archivoLocal") : t("inicio.enlace")}
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
                <span className="zona-texto">{t("inicio.cambiarArchivo", { tamano: formatoMB(archivo.size) })}</span>
              </>
            ) : (
              <>
                <strong className="zona-titulo">{t("inicio.subeVideo")}</strong>
                <span className="zona-texto">{t("inicio.arrastra")}</span>
                <span className="boton-falso" aria-hidden>
                  <IconoMas /> {t("inicio.elegirArchivo")}
                </span>
              </>
            )}
          </label>
        ) : (
          <div className="zona-enlace">
            <IlustracionArchivos />
            <strong className="zona-titulo">{t("inicio.desdeEnlace")}</strong>
            <span className="zona-texto">{t("inicio.enlaceDetalle")}</span>
            <label className="campo-enlace">
              <IconoEnlace />
              <input
                type="url"
                placeholder="https://…"
                aria-label={t("inicio.enlaceAria")}
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
            {t("inicio.traducirAl")}
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} disabled={enviando}>
              {idiomas.map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {bandera(i.codigo)} {nombreIdioma(i.codigo)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="primario grande" disabled={!listo || enviando || idiomas.length === 0}>
            {!enviando && <IconoTraducir />}
            {enviando
              ? modo === "archivo"
                ? t("inicio.subiendo", { porcentaje: Math.round(subida * 100) })
                : t("inicio.registrando")
              : t("inicio.traducirVideo")}
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
            <strong>{t("inicio.ventajaVivo")}</strong>
            <span>{t("inicio.ventajaVivoDetalle")}</span>
          </div>
        </li>
        <li>
          <span className="ventaja-icono" aria-hidden>
            <IconoDescargar />
          </span>
          <div>
            <strong>{t("inicio.ventajaDescarga")}</strong>
            <span>{t("inicio.ventajaDescargaDetalle")}</span>
          </div>
        </li>
        <li>
          <span className="ventaja-icono" aria-hidden>
            <IconoGlobo />
          </span>
          <div>
            <strong>{t("inicio.ventajaIdiomas", { n: idiomas.length || 9 })}</strong>
            <span>{t("inicio.ventajaIdiomasDetalle")}</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
