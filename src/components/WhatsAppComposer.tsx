"use client";

import { useState } from "react";
import { whatsappShareUrl } from "@/lib/messages";

// Editable compose box: the coach can include/exclude the roster, tweak the
// text, then one-tap share to WhatsApp (or copy). Composition logic lives in
// lib/messages; this component only handles the interaction.
export function WhatsAppComposer({ header, roster }: { header: string; roster: string }) {
  const withRoster = roster ? `${header}\n\n${roster}` : header;
  const [includeRoster, setIncludeRoster] = useState(true);
  const [text, setText] = useState(withRoster);
  const [copied, setCopied] = useState(false);

  function rebuild(include: boolean) {
    setIncludeRoster(include);
    setText(include && roster ? `${header}\n\n${roster}` : header);
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
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#cbd5e1",
          fontSize: "0.85rem",
          marginBottom: "0.5rem",
        }}
      >
        <input
          type="checkbox"
          checked={includeRoster}
          onChange={(e) => rebuild(e.target.checked)}
          disabled={!roster}
        />
        Include event roster
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
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
