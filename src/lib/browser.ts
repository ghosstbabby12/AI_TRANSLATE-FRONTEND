/** Downloads a file from a signed URL (the server answers with "attachment"). */
export function downloadFromUrl(url: string) {
  const link = Object.assign(document.createElement("a"), { href: url, rel: "noopener" });
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Reads a value from browser storage; storage can be blocked, so it never throws. */
export function readStorage(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(storage: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    /* no storage: the value lasts as long as the tab */
  }
}
