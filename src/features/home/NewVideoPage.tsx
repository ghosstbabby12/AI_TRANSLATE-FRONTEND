import { ClockIcon, DownloadIcon, GlobeIcon, LinkIcon, TranslateIcon, UploadIcon } from "../../components/icons";
import { languageName, useT } from "../../i18n";
import { flagOf } from "../../lib/format";
import { FileDropZone, LinkZone } from "./SourceInput";
import { useNewVideo, type SourceMode } from "./useNewVideo";

const MODES: SourceMode[] = ["file", "url"];
const DEFAULT_LANGUAGE_COUNT = 9;

export function NewVideoPage() {
  const form = useNewVideo();
  const t = useT();
  const percent = Math.round((form.upload ?? 0) * 100);

  return (
    <section className="home">
      <header className="hero">
        <span className="hero-tag">
          <TranslateIcon /> {t("home.tag")}
        </span>
        <h1 className="hero-title">
          {t("home.title")} <span className="gradient-text">{t("home.titleHighlight")}</span>
        </h1>
        <p className="hero-subtitle">{t("home.subtitle")}</p>
      </header>

      <form className="card upload-form" onSubmit={form.submit}>
        <div className="tabs" role="tablist">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={form.mode === mode}
              className={form.mode === mode ? "is-selected" : ""}
              onClick={() => form.setMode(mode)}
              disabled={form.sending}
            >
              {mode === "file" ? <UploadIcon /> : <LinkIcon />}
              {mode === "file" ? t("home.localFile") : t("home.onlineLink")}
            </button>
          ))}
        </div>

        {form.mode === "file" ? (
          <FileDropZone file={form.file} disabled={form.sending} onFile={form.setFile} />
        ) : (
          <LinkZone url={form.url} disabled={form.sending} onUrl={form.setUrl} />
        )}

        {form.sending && form.mode === "file" && (
          <div className="progress-bar" role="progressbar" aria-valuenow={percent}>
            <div className="progress-fill" style={{ width: `${(form.upload ?? 0) * 100}%` }} />
          </div>
        )}

        <div className="upload-form-footer">
          <label className="field language-field">
            {t("home.translateTo")}
            <select value={form.language} onChange={(e) => form.setLanguage(e.target.value)} disabled={form.sending}>
              {form.languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {flagOf(l.code)} {languageName(l.code)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="primary large" disabled={!form.ready || form.sending || form.languages.length === 0}>
            {!form.sending && <TranslateIcon />}
            {form.sending
              ? form.mode === "file"
                ? t("home.uploading", { percent })
                : t("home.registering")
              : t("home.translateVideo")}
          </button>
        </div>

        {form.error && <p className="error">{form.error}</p>}
      </form>

      <ul className="features">
        <Feature icon={<ClockIcon />} title={t("home.featureLive")} detail={t("home.featureLiveDetail")} />
        <Feature icon={<DownloadIcon />} title={t("home.featureDownload")} detail={t("home.featureDownloadDetail")} />
        <Feature
          icon={<GlobeIcon />}
          title={t("home.featureLanguages", { n: form.languages.length || DEFAULT_LANGUAGE_COUNT })}
          detail={t("home.featureLanguagesDetail")}
        />
      </ul>
    </section>
  );
}

function Feature({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <li>
      <span className="feature-icon" aria-hidden>
        {icon}
      </span>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </li>
  );
}
