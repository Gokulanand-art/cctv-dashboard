import React, { useState } from "react";

// ── Synthetic demo data ──────────────────────────────────────────
const DEMO_DATA = {
  metadata: {
    video_file: "parking_lot_cam1.mp4",
    processed_at: "2025-06-12T09:42:17",
    total_frames: 4500,
    fps: 25,
    resolution: "1280x720",
    min_duration_filter: 2.0,
    total_persons_tracked: 9,
    cards_generated: 7,
  },
  person_cards: [
    { person_id: 1, entry_time: "2025-06-12 09:00:04", exit_time: "2025-06-12 09:02:11", duration_seconds: 127, upper_color: "Blue", lower_color: "Black", avg_position: [312, 280], bounding_box_avg: [282, 185, 60, 140], frame_count: 3175, confidence: "high", notes: ["Long presence (>1 min)"] },
    { person_id: 2, entry_time: "2025-06-12 09:00:22", exit_time: "2025-06-12 09:00:58", duration_seconds: 36, upper_color: "White", lower_color: "Gray", avg_position: [540, 310], bounding_box_avg: [510, 215, 60, 140], frame_count: 900, confidence: "high", notes: [] },
    { person_id: 3, entry_time: "2025-06-12 09:01:05", exit_time: "2025-06-12 09:01:19", duration_seconds: 14, upper_color: "Red", lower_color: "Blue", avg_position: [120, 400], bounding_box_avg: [90, 305, 60, 140], frame_count: 350, confidence: "medium", notes: [] },
    { person_id: 4, entry_time: "2025-06-12 09:01:33", exit_time: "2025-06-12 09:03:50", duration_seconds: 137, upper_color: "Green", lower_color: "Black", avg_position: [700, 220], bounding_box_avg: [670, 125, 60, 140], frame_count: 3425, confidence: "high", notes: ["Long presence (>1 min)"] },
    { person_id: 5, entry_time: "2025-06-12 09:02:00", exit_time: "2025-06-12 09:02:09", duration_seconds: 9, upper_color: "Yellow", lower_color: "Gray", avg_position: [860, 360], bounding_box_avg: [830, 265, 60, 140], frame_count: 225, confidence: "medium", notes: ["Short track, low color reliability"] },
    { person_id: 6, entry_time: "2025-06-12 09:02:44", exit_time: "2025-06-12 09:03:01", duration_seconds: 17, upper_color: "Black", lower_color: "Blue", avg_position: [450, 180], bounding_box_avg: [420, 85, 60, 140], frame_count: 425, confidence: "medium", notes: [] },
    { person_id: 7, entry_time: "2025-06-12 09:03:10", exit_time: null, duration_seconds: 50, upper_color: "Orange", lower_color: "Black", avg_position: [230, 300], bounding_box_avg: [200, 205, 60, 140], frame_count: 1250, confidence: "high", notes: [] },
  ],
};

// ── Color palette mapping ────────────────────────────────────────
const COLOR_HEX = {
  Red: "#e53e3e", Orange: "#dd6b20", Yellow: "#d69e2e", Green: "#38a169",
  Cyan: "#00b5d8", Blue: "#3182ce", Purple: "#805ad5", Pink: "#d53f8c",
  White: "#e2e8f0", Black: "#1a202c", Gray: "#718096", Mixed: "#a0aec0",
  Unknown: "#4a5568",
};

// ── Utility ──────────────────────────────────────────────────────
function fmtDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${s}s`;
}
function confColor(c) {
  return c === "high" ? "#68d391" : c === "medium" ? "#f6ad55" : "#fc8181";
}
function confBg(c) {
  return c === "high" ? "#1a2e1a" : c === "medium" ? "#2d1f00" : "#2d0f0f";
}

// ── ColorDot ────────────────────────────────────────────────────
function ColorDot({ color, label }) {
  const hex = COLOR_HEX[color] || "#718096";
  const isLight = ["White", "Yellow", "Cyan"].includes(color);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 14, height: 14, borderRadius: 3,
        background: hex,
        border: isLight ? "1px solid #4a5568" : "none",
        flexShrink: 0,
        boxShadow: `0 0 6px ${hex}55`
      }} />
      <span style={{ color: "#cbd5e0", fontSize: 13 }}>{color}</span>
    </span>
  );
}

// ── MiniSilhouette ───────────────────────────────────────────────
function MiniSilhouette({ upper, lower, size = 48 }) {
  const uh = COLOR_HEX[upper] || "#718096";
  const lh = COLOR_HEX[lower] || "#4a5568";
  return (
    <svg width={size} height={size * 2.2} viewBox="0 0 40 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <circle cx="20" cy="10" r="9" fill="#c8a882" />
      {/* upper body */}
      <rect x="8" y="20" width="24" height="30" rx="4" fill={uh} />
      {/* lower body */}
      <rect x="8" y="50" width="24" height="28" rx="3" fill={lh} />
      {/* arms */}
      <rect x="2" y="22" width="7" height="22" rx="3" fill={uh} opacity="0.85" />
      <rect x="31" y="22" width="7" height="22" rx="3" fill={uh} opacity="0.85" />
    </svg>
  );
}

// ── PersonCard ───────────────────────────────────────────────────
function PersonCard({ card, selected, onClick }) {
  const isActive = card.exit_time === null;
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "#1a2535" : "#111827",
        border: selected ? "1.5px solid #4299e1" : "1.5px solid #1e293b",
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent glow */}
      {selected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #4299e1, #9f7aea)",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MiniSilhouette upper={card.upper_color} lower={card.lower_color} size={26} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, fontFamily: "'Space Mono', monospace" }}>
                P{String(card.person_id).padStart(3, "0")}
              </span>
              {isActive && (
                <span style={{
                  background: "#1a3327", color: "#48bb78", border: "1px solid #2f6846",
                  fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 6px",
                  letterSpacing: "0.08em",
                }}>● ACTIVE</span>
              )}
            </div>
            <div style={{ color: "#718096", fontSize: 12, marginTop: 2 }}>
              {card.entry_time.split(" ")[1]} → {card.exit_time ? card.exit_time.split(" ")[1] : "ongoing"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#90cdf4", fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
            {fmtDuration(card.duration_seconds)}
          </div>
          <span style={{
            background: confBg(card.confidence), color: confColor(card.confidence),
            fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 7px",
            letterSpacing: "0.08em",
          }}>
            {card.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ color: "#4a5568", fontSize: 10, marginBottom: 3, letterSpacing: "0.08em" }}>UPPER</div>
          <ColorDot color={card.upper_color} />
        </div>
        <div>
          <div style={{ color: "#4a5568", fontSize: 10, marginBottom: 3, letterSpacing: "0.08em" }}>LOWER</div>
          <ColorDot color={card.lower_color} />
        </div>
      </div>
    </div>
  );
}

// ── DetailPanel ──────────────────────────────────────────────────
function DetailPanel({ card }) {
  if (!card) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", color: "#2d3748", gap: 12,
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ fontSize: 14 }}>Select a Person Card to view details</span>
    </div>
  );

  const isActive = card.exit_time === null;

  return (
    <div style={{ padding: "24px 28px", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <MiniSilhouette upper={card.upper_color} lower={card.lower_color} size={40} />
        <div>
          <div style={{ color: "#e2e8f0", fontSize: 26, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>
            Person #{String(card.person_id).padStart(3, "0")}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span style={{ background: confBg(card.confidence), color: confColor(card.confidence), fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "2px 10px" }}>
              {card.confidence.toUpperCase()} CONFIDENCE
            </span>
            {isActive && (
              <span style={{ background: "#1a3327", color: "#48bb78", border: "1px solid #2f6846", fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "2px 10px" }}>
                ● ACTIVE IN FRAME
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Entry Time", value: card.entry_time.split(" ")[1], sub: card.entry_time.split(" ")[0] },
          { label: "Exit Time", value: card.exit_time ? card.exit_time.split(" ")[1] : "—", sub: card.exit_time ? card.exit_time.split(" ")[0] : "Still active" },
          { label: "Duration", value: fmtDuration(card.duration_seconds), sub: `${card.duration_seconds}s` },
          { label: "Frames Tracked", value: card.frame_count.toLocaleString(), sub: "video frames" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#0d1117", borderRadius: 10, padding: "14px 16px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 4 }}>{label.toUpperCase()}</div>
            <div style={{ color: "#90cdf4", fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}</div>
            <div style={{ color: "#4a5568", fontSize: 11, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Appearance */}
      <div style={{ background: "#0d1117", borderRadius: 10, padding: "16px", border: "1px solid #1e293b", marginBottom: 16 }}>
        <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 12 }}>APPEARANCE</div>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{ color: "#718096", fontSize: 12, marginBottom: 6 }}>Upper body</div>
            <ColorDot color={card.upper_color} />
          </div>
          <div>
            <div style={{ color: "#718096", fontSize: 12, marginBottom: 6 }}>Lower body</div>
            <ColorDot color={card.lower_color} />
          </div>
        </div>
      </div>

      {/* Position */}
      <div style={{ background: "#0d1117", borderRadius: 10, padding: "16px", border: "1px solid #1e293b", marginBottom: 16 }}>
        <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>AVERAGE POSITION</div>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ color: "#cbd5e0", fontSize: 14 }}>
            <span style={{ color: "#4a5568" }}>X: </span>
            <span style={{ fontFamily: "'Space Mono', monospace", color: "#90cdf4" }}>{card.avg_position[0]}</span>
          </span>
          <span style={{ color: "#cbd5e0", fontSize: 14 }}>
            <span style={{ color: "#4a5568" }}>Y: </span>
            <span style={{ fontFamily: "'Space Mono', monospace", color: "#90cdf4" }}>{card.avg_position[1]}</span>
          </span>
        </div>
      </div>

      {/* Notes */}
      {card.notes.length > 0 && (
        <div style={{ background: "#1a1200", borderRadius: 10, padding: "14px 16px", border: "1px solid #3d2e00" }}>
          <div style={{ color: "#744210", fontSize: 11, letterSpacing: "0.1em", marginBottom: 8 }}>FLAGS</div>
          {card.notes.map((n, i) => (
            <div key={i} style={{ color: "#f6ad55", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#d69e2e" }}>⚑</span> {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Camera Minimap ───────────────────────────────────────────────
function CameraMap({ cards, selected }) {
  return (
    <div style={{
      background: "#0d1117", borderRadius: 10, border: "1px solid #1e293b",
      padding: 16, position: "relative",
    }}>
      <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>
        CAMERA VIEW — POSITION MAP
      </div>
      <div style={{
        background: "#080d14", borderRadius: 8, border: "1px solid #1a2535",
        position: "relative", height: 180, overflow: "hidden",
      }}>
        {/* Grid lines */}
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${25 * (i + 1)}%`, top: 0, bottom: 0, borderLeft: "1px solid #0f1923" }} />
        ))}
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${33 * (i + 1)}%`, left: 0, right: 0, borderTop: "1px solid #0f1923" }} />
        ))}

        {/* Person dots */}
        {cards.map((card) => {
          const px = (card.avg_position[0] / 1280) * 100;
          const py = (card.avg_position[1] / 720) * 100;
          const isSel = selected && selected.person_id === card.person_id;
          const uh = COLOR_HEX[card.upper_color] || "#718096";
          return (
            <div key={card.person_id} style={{
              position: "absolute",
              left: `${px}%`, top: `${py}%`,
              transform: "translate(-50%, -50%)",
              width: isSel ? 16 : 10, height: isSel ? 16 : 10,
              borderRadius: "50%",
              background: uh,
              border: isSel ? "2px solid #fff" : "1px solid #0d1117",
              boxShadow: isSel ? `0 0 10px ${uh}` : `0 0 4px ${uh}66`,
              transition: "all 0.2s",
              zIndex: isSel ? 2 : 1,
            }}>
              {isSel && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 4px)", left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1a2535", color: "#90cdf4", fontSize: 10,
                  borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap",
                  fontFamily: "'Space Mono', monospace", border: "1px solid #2d3748",
                }}>
                  P{String(card.person_id).padStart(3, "0")}
                </div>
              )}
            </div>
          );
        })}

        {/* Camera icon */}
        <div style={{ position: "absolute", top: 8, right: 10, color: "#1e293b", fontSize: 18 }}>📷</div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [data] = useState(DEMO_DATA);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState("entry");

  const cards = data.person_cards;

  const filtered = cards
    .filter((c) => {
      if (filter === "active") return !c.exit_time;
      if (filter === "high") return c.confidence === "high";
      if (filter === "flagged") return c.notes.length > 0;
      return true;
    })
    .filter((c) => searchId === "" || String(c.person_id).includes(searchId))
    .sort((a, b) => {
      if (sortBy === "entry") return a.entry_time.localeCompare(b.entry_time);
      if (sortBy === "duration") return b.duration_seconds - a.duration_seconds;
      if (sortBy === "confidence") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.confidence] - order[b.confidence];
      }
      return 0;
    });

  const totalActive = cards.filter((c) => !c.exit_time).length;
  const avgDuration = Math.round(cards.reduce((s, c) => s + c.duration_seconds, 0) / cards.length);

  return (
    <div style={{
      background: "#060b14",
      minHeight: "100vh",
      fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
      color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#080d14",
        borderBottom: "1px solid #1e293b",
        padding: "14px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, #1a365d, #2b6cb0)",
            borderRadius: 8, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>📹</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
              Smart CCTV Person Card System
            </div>
            <div style={{ color: "#4a5568", fontSize: 12 }}>
              {data.metadata.video_file} · {data.metadata.resolution} · {data.metadata.fps}fps
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "PERSONS TRACKED", value: data.metadata.total_persons_tracked },
            { label: "CARDS GENERATED", value: data.metadata.cards_generated },
            { label: "CURRENTLY ACTIVE", value: totalActive, accent: true },
            { label: "AVG DURATION", value: fmtDuration(avgDuration) },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ color: accent ? "#68d391" : "#90cdf4", fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                {value}
              </div>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr 320px", height: "calc(100vh - 65px)" }}>
        {/* Left: Card list */}
        <div style={{ borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Controls */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", background: "#0a0f1a" }}>
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                width: "100%", background: "#0d1117", border: "1px solid #1e293b",
                borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13,
                marginBottom: 10, outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "active", "high", "flagged"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? "#1a365d" : "#0d1117",
                    border: filter === f ? "1px solid #2b6cb0" : "1px solid #1e293b",
                    color: filter === f ? "#90cdf4" : "#4a5568",
                    borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                    fontWeight: filter === f ? 700 : 400, letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%", background: "#0d1117", border: "1px solid #1e293b",
                borderRadius: 8, padding: "7px 10px", color: "#718096", fontSize: 12,
                marginTop: 8, outline: "none", cursor: "pointer",
              }}
            >
              <option value="entry">Sort: Entry Time</option>
              <option value="duration">Sort: Duration</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
          </div>

          {/* Card list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ color: "#2d3748", textAlign: "center", marginTop: 40, fontSize: 13 }}>
                No cards match filter
              </div>
            ) : (
              filtered.map((card) => (
                <PersonCard
                  key={card.person_id}
                  card={card}
                  selected={selected?.person_id === card.person_id}
                  onClick={() => setSelected(selected?.person_id === card.person_id ? null : card)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Detail */}
        <div style={{ borderRight: "1px solid #1e293b", overflow: "hidden" }}>
          <DetailPanel card={selected} />
        </div>

        {/* Right: Meta & Map */}
        <div style={{ padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <CameraMap cards={cards} selected={selected} />

          {/* Color distribution */}
          <div style={{ background: "#0d1117", borderRadius: 10, padding: "16px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 12 }}>UPPER COLOR DISTRIBUTION</div>
            {(() => {
              const counts = {};
              cards.forEach((c) => { counts[c.upper_color] = (counts[c.upper_color] || 0) + 1; });
              return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([color, count]) => (
                <div key={color} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLOR_HEX[color] || "#718096", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ color: "#718096", fontSize: 12 }}>{color}</span>
                      <span style={{ color: "#4a5568", fontSize: 12 }}>{count}</span>
                    </div>
                    <div style={{ background: "#1a2535", borderRadius: 2, height: 4 }}>
                      <div style={{
                        width: `${(count / cards.length) * 100}%`, height: "100%",
                        background: COLOR_HEX[color] || "#718096", borderRadius: 2,
                      }} />
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Session info */}
          <div style={{ background: "#0d1117", borderRadius: 10, padding: "16px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>SESSION INFO</div>
            {[
              ["Processed At", data.metadata.processed_at.replace("T", " ")],
              ["Total Frames", data.metadata.total_frames.toLocaleString()],
              ["Min Duration", `${data.metadata.min_duration_filter}s`],
              ["FPS", data.metadata.fps],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#4a5568", fontSize: 12 }}>{label}</span>
                <span style={{ color: "#718096", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
/* fix */
