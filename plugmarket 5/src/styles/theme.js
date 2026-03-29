// ── Brand ──
export const BC = "#FF7500";
export const GR = "linear-gradient(135deg,#FF7500,#FF9533)";
export const GR2 = "linear-gradient(135deg,#4D2300,#7A3900)";
export const BL = "#FFF3EB";
export const BL2 = "#FFE0C7";
export const BD = "#4D2300";

// ── Theme ──
export function theme(d) {
  if (d) return {
    bg: "#131319", card: "#212128", sec: "#1A1A22",
    bd: "rgba(255,255,255,0.08)", tx: "#E8E8EC", tx2: "#9C9CA8", tx3: "#6B6B78",
    inp: "#212128", sh: "rgba(0,0,0,0.4)", nav: "#131319",
    tg: "#2A2A33", tt: "#FFB366", chat: "#1a1a21",
  };
  return {
    bg: "#ffffff", card: "#ffffff", sec: "#f5f5f5",
    bd: "rgba(128,128,128,0.18)", tx: "#1a1a1a", tx2: "#6b7280", tx3: "#9ca3af",
    inp: "#ffffff", sh: "rgba(0,0,0,0.06)", nav: "#ffffff",
    tg: BL, tt: BD, chat: "#f0f0f3",
  };
}

// ── Card style helper ──
export const cs = (t) => ({
  background: t.card,
  borderRadius: 16,
  border: `1px solid ${t.bd}`,
  boxShadow: `0 2px 8px ${t.sh}`,
});
