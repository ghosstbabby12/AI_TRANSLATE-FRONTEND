import type { Video } from "../models/video";
import type { VideoDto } from "./dto";
import { API_URL, ApiError, authHeader, errorMessageFrom, handleUnauthorized, noNetworkMessage } from "./http";
import { toVideo } from "./mappers";

/**
 * Uploads a video file. Uses XMLHttpRequest because fetch does not report
 * upload progress, and a file of hundreds of MB without a bar looks stuck.
 */
export function uploadVideoFile(file: File, targetLanguage: string, onProgress: (fraction: number) => void): Promise<Video> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("idioma_destino", targetLanguage);
    form.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/videos`);
    for (const [name, value] of Object.entries(authHeader())) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* not a JSON answer */
      }
      handleUnauthorized(xhr.status);
      if (xhr.status >= 200 && xhr.status < 300) resolve(toVideo(body as VideoDto));
      else reject(new ApiError(errorMessageFrom(body, xhr.status), xhr.status));
    };
    xhr.onerror = () => reject(new ApiError(noNetworkMessage(), 0));
    xhr.send(form);
  });
}
