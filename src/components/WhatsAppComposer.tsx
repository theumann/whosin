"use client";

import { useEffect, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { whatsappShareUrl } from "@/lib/messages";
import { btnSecondary, btnSuccess, fieldClass } from "@/lib/ui";

// Editable compose box: the coach can include/exclude the roster and the squad
// split, tweak the text, then one-tap share to WhatsApp (or copy). Composition
// logic lives in lib/messages; this component only handles the interaction.
// `squad` is "" when no split has been done — its toggle is then disabled.
export function WhatsAppComposer({
  header,
  roster,
  squad,
}: {
  header: string;
  roster: string;
  squad: string;
}) {
  const buildText = (incRoster: boolean, incSquad: boolean) => {
    const parts = [header];
    if (incRoster && roster) parts.push(roster);
    if (incSquad && squad) parts.push(squad);
    return parts.join("\n\n");
  };

  const [includeRoster, setIncludeRoster] = useState(true);
  const [includeSquad, setIncludeSquad] = useState(Boolean(squad));
  const [text, setText] = useState(() => buildText(true, Boolean(squad)));
  const [copied, setCopied] = useState(false);

  // Refresh the message when the underlying roster or squad split changes
  // (e.g. the coach changed a status or assigned teams), keeping their toggle
  // choices. Manual edits are replaced, since the data they were based on moved.
  useEffect(() => {
    setText(buildText(includeRoster, includeSquad && Boolean(squad)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header, roster, squad]);

  function update(incRoster: boolean, incSquad: boolean) {
    setIncludeRoster(incRoster);
    setIncludeSquad(incSquad);
    setText(buildText(incRoster, incSquad));
  }

  function share() {
    window.open(whatsappShareUrl(text), "_blank", "noopener,noreferrer");
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={includeRoster}
          onChange={(e) => update(e.target.checked, includeSquad)}
          disabled={!roster}
        />
        Include event roster
      </label>
      <label
        className={`mb-2.5 flex items-center gap-2 text-sm ${squad ? "text-slate-700" : "text-slate-400"}`}
      >
        <input
          type="checkbox"
          checked={includeSquad && Boolean(squad)}
          onChange={(e) => update(includeRoster, e.target.checked)}
          disabled={!squad}
        />
        Include squad split{!squad ? " (assign teams first)" : ""}
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className={`${fieldClass} resize-y font-sans`}
      />
      <div className="mt-2.5 flex items-center gap-2.5">
        <button type="button" onClick={share} className={btnSuccess}>
          <MessageCircle size={16} /> Share to WhatsApp
        </button>
        <button type="button" onClick={copy} className={btnSecondary}>
          <Copy size={14} /> {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
