import { useT } from "../../../i18n";
import { timestampToSeconds } from "../../../lib/format";
import { parseSummary, type SummaryItem } from "../../../lib/summaryFormat";

/** Renders the summary's blocks; a timestamp moves the player to that moment. */
export function SummaryContent({ text, onSeek }: { text: string; onSeek: (seconds: number) => void }) {
  return (
    <div className="summary-content">
      {parseSummary(text).map((block, i) =>
        block.kind === "heading" ? (
          <h3 key={i}>{block.text}</h3>
        ) : block.kind === "paragraph" ? (
          <p key={i}>{block.text}</p>
        ) : (
          <ul key={i}>
            {block.items.map((item, j) => (
              <Bullet key={j} item={item} onSeek={onSeek} />
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function Bullet({ item, onSeek }: { item: SummaryItem; onSeek: (seconds: number) => void }) {
  const t = useT();
  if (!item.timestamp) return <li>{item.text}</li>;
  const timestamp = item.timestamp;
  return (
    <li className="moment">
      <button type="button" className="timestamp-button" title={t("summary.goTo", { time: timestamp })} onClick={() => onSeek(timestampToSeconds(timestamp))}>
        {timestamp}
      </button>
      <span>{item.text}</span>
    </li>
  );
}
