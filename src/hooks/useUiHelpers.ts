import { useEffect, useState, type RefObject } from "react";

/** Calls `onClose` on a click outside `ref` or on Escape, while `open`. */
export function useDismiss(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, ref, onClose]);
}

/** Copies text and shows "copied" for a moment. */
export function useClipboard(resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      /* no clipboard permission: the text stays visible to copy by hand */
    }
  };
  return { copied, copy };
}

/** Becomes true once `active` has lasted `delayMs` (e.g. to explain a slow wait). */
export function useDelayedFlag(active: boolean, delayMs: number) {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!active) return setFlag(false);
    const timer = setTimeout(() => setFlag(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);
  return flag;
}
