/**
 * The AI summary uses a small format: "## Heading", "- bullet" and
 * "- [mm:ss] moment". This turns it into blocks the view can render
 * (never HTML: the text comes from an AI model).
 */
export type SummaryBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: SummaryItem[] };

export type SummaryItem = { text: string; timestamp?: string };

const HEADING = /^#{1,6}\s+(.+)$/;
const BULLET = /^[-*•]\s+(.+)$/;
const MOMENT = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/;

export function parseSummary(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = [];
  let list: SummaryItem[] = [];
  const closeList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim().replace(/\*\*(.+?)\*\*/g, "$1"); // in case the model adds bold
    if (!line) {
      closeList();
      continue;
    }
    const heading = HEADING.exec(line)?.[1];
    const bullet = BULLET.exec(line)?.[1];
    if (heading) {
      closeList();
      blocks.push({ kind: "heading", text: heading });
    } else if (bullet) {
      const moment = MOMENT.exec(bullet);
      list.push(moment ? { timestamp: moment[1], text: moment[2]! } : { text: bullet });
    } else {
      closeList();
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  closeList();
  return blocks;
}

/** Plain text for the clipboard (without the "##" marks). */
export const summaryAsPlainText = (text: string) => text.replace(/^#{1,6}\s+/gm, "");
