import { useEffect, useState, type FormEvent } from "react";
import { videosApi } from "../../api/videosApi";
import { navigate, paths } from "../../hooks/useRoute";
import { errorText } from "../../lib/format";
import type { Language } from "../../models/video";

export type SourceMode = "file" | "url";

/** State and actions of the "translate a new video" form. */
export function useNewVideo() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [mode, setMode] = useState<SourceMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("es");
  /** Upload fraction (0-1) while sending; null when idle. */
  const [upload, setUpload] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    videosApi.languages().then(setLanguages, (e) => setError(errorText(e)));
  }, []);

  const sending = upload !== null;
  const ready = mode === "file" ? file !== null : url.trim() !== "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUpload(0);
    try {
      const video =
        mode === "file" && file ? await videosApi.uploadFile(file, language, setUpload) : await videosApi.createFromUrl(url.trim(), language);
      navigate(paths.video(video.id));
    } catch (err) {
      setError(errorText(err));
      setUpload(null);
    }
  }

  return { languages, mode, setMode, file, setFile, url, setUrl, language, setLanguage, upload, sending, ready, error, submit };
}
