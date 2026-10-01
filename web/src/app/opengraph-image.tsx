import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1a1814";
const PAPER = "#f2efe6";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: PAPER, padding: 64, color: INK }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "#857f72" }}>
          <span>§ AI search visibility</span>
          <span>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56, fontSize: 84, lineHeight: 1.02, letterSpacing: -2 }}>
          <span>When someone asks an AI,</span>
          <span style={{ color: "#c93c17" }}>are you in the answer?</span>
        </div>
        <div style={{ display: "flex", marginTop: "auto", borderTop: `3px solid ${INK}`, paddingTop: 24, fontSize: 30 }}>
          <span>“For most startups,&nbsp;</span>
          <span style={{ background: "#f6d65e", padding: "0 6px" }}>Notion</span>
          <span>&nbsp;is the strongest all-round pick…”</span>
        </div>
      </div>
    ),
    size,
  );
}
