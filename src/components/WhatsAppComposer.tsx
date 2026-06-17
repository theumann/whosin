"use client";

import { useEffect, useState } from "react";
import { whatsappShareUrl } from "@/lib/messages";

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

  const checkboxRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#cbd5e1",
    fontSize: "0.85rem",
    marginBottom: "0.4rem",
  };

  return (
    <div>
      <label style={checkboxRow}>
        <input
          type="checkbox"
          checked={includeRoster}
          onChange={(e) => update(e.target.checked, includeSquad)}
          disabled={!roster}
        />
        Include event roster
      </label>
      <label
        style={{ ...checkboxRow, color: squad ? "#cbd5e1" : "#64748b", marginBottom: "0.6rem" }}
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
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          padding: "0.6rem",
          borderRadius: 6,
          border: "1px solid #334155",
          background: "#0b1220",
          color: "#e2e8f0",
          fontSize: "0.9rem",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={share}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: 6,
            border: "none",
            background: "#22c55e",
            color: "#0b1220",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Share to WhatsApp
        </button>
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "0.55rem 1rem",
            borderRadius: 6,
            border: "1px solid #334155",
            background: "transparent",
            color: "#94a3b8",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
