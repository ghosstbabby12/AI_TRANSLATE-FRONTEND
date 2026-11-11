import { useState } from "react";
import { ConfirmDeleteDialog } from "../../components/ConfirmDeleteDialog";
import { CheckIcon, CopyIcon, EditIcon, ExternalIcon, LinkIcon, TrashIcon } from "../../components/icons";
import { RenameForm } from "../../components/RenameForm";
import { StatusBadge } from "../../components/StatusBadge";
import { useClipboard } from "../../hooks/useUiHelpers";
import { useT } from "../../i18n";
import type { VideoStatusReport } from "../../models/video";

interface Props {
  title: string;
  report: VideoStatusReport;
  sourceUrl: string | null;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

/** Title (renamable), languages, status and the edit/delete buttons. */
export function VideoHeader({ title, report, sourceUrl, onRename, onDelete }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const t = useT();

  return (
    <>
      <header className="video-header">
        <div className="video-title">
          {renaming ? (
            <RenameForm
              currentName={title}
              onSave={async (name) => {
                await onRename(name);
                setRenaming(false);
              }}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <h1>{title}</h1>
          )}
          <div className="language-route">
            {report.sourceLanguage && (
              <>
                <span className="chip">{report.sourceLanguage.toUpperCase()}</span>→
              </>
            )}
            <span className="chip chip-accent">{report.targetLanguage.toUpperCase()}</span>
            {sourceUrl && <SourceUrl url={sourceUrl} />}
          </div>
        </div>
        <div className="header-actions">
          <StatusBadge status={report.status} />
          <button type="button" className="icon-button" data-tip={t("video.rename")} aria-label={t("video.rename")} onClick={() => setRenaming(true)} disabled={renaming}>
            <EditIcon />
          </button>
          <button type="button" className="icon-button danger-icon" data-tip={t("video.delete")} aria-label={t("video.delete")} onClick={() => setConfirming(true)}>
            <TrashIcon />
          </button>
        </div>
      </header>

      {confirming && <ConfirmDeleteDialog name={title} language={report.targetLanguage} onConfirm={onDelete} onCancel={() => setConfirming(false)} />}
    </>
  );
}

/** "Show URL" button: the source link stays hidden until asked for. */
function SourceUrl({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const { copied, copy } = useClipboard();
  const t = useT();

  return (
    <>
      <button type="button" className="chip chip-button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <LinkIcon />
        {open ? t("video.hideUrl") : t("video.showUrl")}
      </button>

      {open && (
        <div className="url-panel">
          <code title={url}>{url}</code>
          <div className="floating-bar compact-inline">
            <button
              type="button"
              className="icon-button"
              data-tip={copied ? t("video.urlCopied") : t("video.copyUrl")}
              aria-label={t("video.copyUrl")}
              onClick={() => copy(url)}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <a className="icon-button" href={url} target="_blank" rel="noopener noreferrer" data-tip={t("video.openInNewTab")} aria-label={t("video.openInNewTab")}>
              <ExternalIcon />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
