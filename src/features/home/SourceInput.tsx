import { useState } from "react";
import { FilesIllustration } from "../../components/FilesIllustration";
import { LinkIcon, PlusIcon } from "../../components/icons";
import { useT } from "../../i18n";
import { formatMegabytes } from "../../lib/format";

interface DropZoneProps {
  file: File | null;
  disabled: boolean;
  onFile: (file: File | null) => void;
}

/** Area to drop or choose a video/audio file. */
export function FileDropZone({ file, disabled, onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const t = useT();
  return (
    <label
      className={`drop-zone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
      }}
    >
      <input type="file" accept="video/*,audio/*" disabled={disabled} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <FilesIllustration />
      {file ? (
        <>
          <strong className="zone-title">{file.name}</strong>
          <span className="zone-text">{t("home.changeFile", { size: formatMegabytes(file.size) })}</span>
        </>
      ) : (
        <>
          <strong className="zone-title">{t("home.uploadVideo")}</strong>
          <span className="zone-text">{t("home.dragHere")}</span>
          <span className="fake-button" aria-hidden>
            <PlusIcon /> {t("home.chooseFile")}
          </span>
        </>
      )}
    </label>
  );
}

/** Field to translate a video from a public link. */
export function LinkZone({ url, disabled, onUrl }: { url: string; disabled: boolean; onUrl: (url: string) => void }) {
  const t = useT();
  return (
    <div className="link-zone">
      <FilesIllustration />
      <strong className="zone-title">{t("home.fromLink")}</strong>
      <span className="zone-text">{t("home.linkDetail")}</span>
      <label className="link-field">
        <LinkIcon />
        <input
          type="url"
          placeholder="https://…"
          aria-label={t("home.linkAria")}
          value={url}
          disabled={disabled}
          onChange={(e) => onUrl(e.target.value)}
        />
      </label>
    </div>
  );
}
