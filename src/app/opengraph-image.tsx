import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

// Link-preview card (WhatsApp, LinkedIn, iMessage…). Generated at build time
// from the logo so it never drifts from the brand.
export const alt = "whosIn — Event Attendance Management and WhatsApp Group Notifications";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} width={605} height={201} alt="" />
      <div
        style={{
          display: "flex",
          marginTop: 40,
          maxWidth: 1000,
          fontSize: 36,
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Event Attendance Management and WhatsApp Group Notifications
      </div>
    </div>,
    size,
  );
}
