import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://cctv-backend-production.up.railway.app";

const COLOR_HEX = {
  Red: "#ff4466", Orange: "#ff8c00", Yellow: "#ffe600", Green: "#00ff88",
  Cyan: "#00e5ff", Blue: "#2979ff", Purple: "#d500f9", Pink: "#ff4081",
  White: "#f0f4ff", Black: "#1a1f2e", Gray: "#607d8b", Mixed: "#78909c", Unknown: "#37474f",
};

function fmtDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Number(s).toFixed(1)}s`;
}
function confColor(c) { return c === "high" ? "#00ff88" : c === "medium" ? "#ffe600" : "#ff4466"; }
function confGlow(c) { return c === "high" ? "0 0 8px #00ff8866" : c === "medium" ? "0 0 8px #ffe60066" : "0 0 8px #ff446666"; }

function ColorDot({ color }) {
  const hex = COLOR_HEX[color] || "#37474f";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: hex, boxShadow: `0 0 6px ${hex}`, flexShrink: 0 }} />
      <span style={{ color: "#7ab3cc", fontSize: 12 }}>{color}</span>
    </span>
  );
}

function SilhouetteIcon({ upper, lower, size = 36 }) {
  const uh = COLOR_HEX[upper] || "#37474f";
  const lh = COLOR_HEX[lower] || "#263238";
  return (
    <svg width={size} height={size * 2} viewBox="0 0 36 72" fill="none">
      <circle cx="18" cy="9" r="7" fill="#b0c4d8" />
      <rect x="7" y="17" width="22" height="24" rx="3" fill={uh} opacity="0.9" />
      <rect x="7" y="41" width="22" height="22" rx="2" fill={lh} opacity="0.9" />
      <rect x="1" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.7" />
      <rect x="28" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.7" />
    </svg>
  );
}

function PersonModal({ card, onClose }) {
  if (!card) return null;
  const isActive = !card.exit_time;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,8,20,0.95)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxHeight: "92vh", overflowY: "auto",
        background: "linear-gradient(180deg, #020d1a 0%, #010810 100%)",
        borderTop: "1px solid rgba(0,229,255,0.3)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -4px 40px rgba(0,229,255,0.1)",
        paddingBottom: 50,
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,229,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,229,255,0.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 2, height: 18, background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
            <span style={{ color: "#00e5ff", fontSize: 11, letterSpacing: "0.2em", fontWeight: 700 }}>SUBJECT PROFILE</span>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
            color: "#00e5ff", borderRadius: 8, width: 32, height: 32,
            fontSize: 16, cursor: "pointer",
          }}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* ID + silhouette */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: 12, padding: 10,
              boxShadow: "0 0 20px rgba(0,229,255,0.05)",
            }}>
              <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={42} />
            </div>
            <div>
              <div style={{
                fontSize: 30, fontWeight: 900, letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #00e5ff, #2979ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontFamily: "'Orbitron', monospace",
              }}>
                SBJ-{String(card.person_id).padStart(3, "0")}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{
                  color: confColor(card.confidence),
                  border: `1px solid ${confColor(card.confidence)}55`,
                  background: `${confColor(card.confidence)}11`,
                  boxShadow: confGlow(card.confidence),
                  fontSize: 10, fontWeight: 700, borderRadius: 4,
                  padding: "2px 8px", letterSpacing: "0.1em",
                }}>{card.confidence.toUpperCase()} CONF</span>
                {isActive && (
                  <span style={{
                    color: "#00ff88", border: "1px solid #00ff8844",
                    background: "#00ff8811", boxShadow: "0 0 8px #00ff8844",
                    fontSize: 10, fontWeight: 700, borderRadius: 4,
                    padding: "2px 8px", letterSpacing: "0.1em",
                  }}>● ACTIVE</span>
                )}
              </div>
            </div>
          </div>

          {/* Snapshot */}
          {card.snapshot_b64 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>◈ VISUAL CAPTURE</div>
              <div style={{
                background: "#010810", border: "1px solid rgba(0,229,255,0.15)",
                borderRadius: 12, padding: 14, textAlign: "center",
                position: "relative", overflow: "hidden",
                boxShadow: "inset 0 0 30px rgba(0,229,255,0.03)",
              }}>
                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                  <div key={v+h} style={{
                    position: "absolute", [v]: 8, [h]: 8, width: 14, height: 14,
                    borderTop: v === "top" ? "2px solid #00e5ff" : "none",
                    borderBottom: v === "bottom" ? "2px solid #00e5ff" : "none",
                    borderLeft: h === "left" ? "2px solid #00e5ff" : "none",
                    borderRight: h === "right" ? "2px solid #00e5ff" : "none",
                    boxShadow: "0 0 6px #00e5ff44",
                  }} />
                ))}
                <img src={`data:image/jpeg;base64,${card.snapshot_b64}`} alt="capture"
                  style={{ maxHeight: 220, borderRadius: 8, border: "1px solid rgba(0,229,255,0.1)" }} />
              </div>
            </div>
          )}

          {/* Time grid */}
          <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>◈ TEMPORAL DATA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "ENTRY", value: card.entry_time.split(" ")[1], sub: card.entry_time.split(" ")[0] },
              { label: "EXIT", value: card.exit_time ? card.exit_time.split(" ")[1] : "ACTIVE", sub: card.exit_time ? card.exit_time.split(" ")[0] : "In frame" },
              { label: "DURATION", value: fmtDuration(card.duration_seconds), sub: `${card.duration_seconds}s total` },
              { label: "FRAMES", value: card.frame_count?.toLocaleString(), sub: "tracked" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{
                background: "rgba(0,229,255,0.03)",
                border: "1px solid rgba(0,229,255,0.08)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ color: "#1e4d6b", fontSize: 9, letterSpacing: "0.15em", marginBottom: 4 }}>{label}</div>
                <div style={{ color: "#00e5ff", fontSize: 16, fontWeight: 700, fontFamily: "'Orbitron', monospace" }}>{value}</div>
                <div style={{ color: "#1e4d6b", fontSize: 10, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Appearance */}
          <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>◈ APPEARANCE</div>
          <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <div style={{ color: "#1e4d6b", fontSize: 9, letterSpacing: "0.1em", marginBottom: 8 }}>UPPER BODY</div>
                <ColorDot color={card.upper_color} />
              </div>
              <div>
                <div style={{ color: "#1e4d6b", fontSize: 9, letterSpacing: "0.1em", marginBottom: 8 }}>LOWER BODY</div>
                <ColorDot color={card.lower_color} />
              </div>
            </div>
          </div>

          {/* Position */}
          <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>◈ COORDINATES</div>
          <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 24 }}>
              <span><span style={{ color: "#1e4d6b", fontSize: 13 }}>X: </span><span style={{ color: "#00e5ff", fontSize: 15, fontWeight: 700 }}>{card.avg_position?.[0]}</span></span>
              <span><span style={{ color: "#1e4d6b", fontSize: 13 }}>Y: </span><span style={{ color: "#00e5ff", fontSize: 15, fontWeight: 700 }}>{card.avg_position?.[1]}</span></span>
            </div>
          </div>

          {card.notes && card.notes.length > 0 && (
            <>
              <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.2em", marginBottom: 8 }}>◈ FLAGS</div>
              <div style={{ background: "rgba(255,68,102,0.05)", border: "1px solid rgba(255,68,102,0.2)", borderRadius: 10, padding: "12px 16px", boxShadow: "0 0 20px rgba(255,68,102,0.05)" }}>
                {card.notes.map((n, i) => <div key={i} style={{ color: "#ff6b8a", fontSize: 13, marginBottom: 4 }}>⚑ {n}</div>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonCard({ card, onClick }) {
  const isActive = !card.exit_time;
  const uh = COLOR_HEX[card.upper_color] || "#37474f";
  return (
    <div onClick={onClick} style={{
      background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(41,121,255,0.03) 100%)",
      border: "1px solid rgba(0,229,255,0.1)",
      borderRadius: 12, padding: "14px 16px", cursor: "pointer",
      transition: "all 0.2s",
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(0,229,255,0.35)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0,229,255,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(0,229,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Left glow bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: uh, boxShadow: `0 0 8px ${uh}` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={22} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontWeight: 900, fontSize: 15,
                background: "linear-gradient(90deg, #00e5ff, #2979ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                SBJ-{String(card.person_id).padStart(3, "0")}
              </span>
              {isActive && (
                <span style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.3)", boxShadow: "0 0 6px rgba(0,255,136,0.2)", fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 6px" }}>● LIVE</span>
              )}
            </div>
            <div style={{ color: "#1e4d6b", fontSize: 11, marginTop: 2 }}>
              {card.entry_time.split(" ")[1]} → {card.exit_time ? card.exit_time.split(" ")[1] : "ongoing"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700 }}>{fmtDuration(card.duration_seconds)}</div>
          <span style={{ color: confColor(card.confidence), border: `1px solid ${confColor(card.confidence)}44`, background: `${confColor(card.confidence)}11`, boxShadow: confGlow(card.confidence), fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 6px", letterSpacing: "0.08em" }}>
            {card.confidence.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,229,255,0.05)" }}>
        <div><div style={{ color: "#0d2d3d", fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }}>UPPER</div><ColorDot color={card.upper_color} /></div>
        <div><div style={{ color: "#0d2d3d", fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }}>LOWER</div><ColorDot color={card.lower_color} /></div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState("entry");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const longPressTimer = React.useRef(null);

  const fetchLatest = async () => {
    try { const res = await fetch(`${BACKEND_URL}/latest`); const json = await res.json(); if (json) { setData(json); setLastUpdated(new Date().toLocaleTimeString()); } } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchHistory = async () => {
    try { const res = await fetch(`${BACKEND_URL}/history`); setHistory(await res.json()); } catch (e) { console.error(e); }
  };
  const loadHistoryFile = async (f) => {
    try { const res = await fetch(`${BACKEND_URL}/history/${f}`); setData(await res.json()); setSelected(null); setShowHistory(false); } catch (e) { console.error(e); }
  };
  const deleteHistoryFile = async (f) => {
    try { await fetch(`${BACKEND_URL}/history/${f}`, { method: "DELETE" }); setHistory(prev => prev.filter(x => x !== f)); setDeleteConfirm(null); } catch (e) { console.error(e); }
  };
  const startLongPress = (f) => { longPressTimer.current = setTimeout(() => setDeleteConfirm(f), 600); };
  const cancelLongPress = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  useEffect(() => { fetchLatest(); fetchHistory(); }, []);

  if (loading) return (
    <div style={{ background: "#010810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <div style={{ width: 44, height: 44, border: "2px solid rgba(0,229,255,0.15)", borderTop: "2px solid #00e5ff", borderRadius: "50%", animation: "spin 1s linear infinite", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }} />
      <div style={{ color: "#1e4d6b", fontSize: 11, letterSpacing: "0.25em" }}>INITIALIZING...</div>
    </div>
  );

  if (!data) return (
    <div style={{ background: "#010810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ color: "#00e5ff", fontSize: 40, opacity: 0.3 }}>◎</div>
      <div style={{ color: "#1e4d6b", fontSize: 13, letterSpacing: "0.2em" }}>NO DATA STREAM</div>
      <code style={{ color: "#00e5ff", background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", padding: "8px 16px", borderRadius: 8, fontSize: 11 }}>
        python smart_cctv_system.py --video input.mp4
      </code>
    </div>
  );

  const cards = data.person_cards || [];
  const totalActive = cards.filter(c => !c.exit_time).length;
  const avgDuration = cards.length ? (cards.reduce((s, c) => s + c.duration_seconds, 0) / cards.length).toFixed(1) : 0;
  const filtered = cards
    .filter(c => { if (filter === "active") return !c.exit_time; if (filter === "high") return c.confidence === "high"; if (filter === "flagged") return c.notes && c.notes.length > 0; return true; })
    .filter(c => searchId === "" || String(c.person_id).includes(searchId))
    .sort((a, b) => { if (sortBy === "duration") return b.duration_seconds - a.duration_seconds; if (sortBy === "confidence") return ({ high: 0, medium: 1, low: 2 }[a.confidence] || 0) - ({ high: 0, medium: 1, low: 2 }[b.confidence] || 0); return a.entry_time.localeCompare(b.entry_time); });

  return (
    <div style={{ background: "#010810", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Rajdhani', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#010810}
        ::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.3);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
      `}</style>

      {selected && <PersonModal card={selected} onClose={() => setSelected(null)} />}

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,5,15,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(8px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#020d1a", border: "1px solid rgba(255,68,102,0.3)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 320, boxShadow: "0 0 40px rgba(255,68,102,0.1)" }}>
            <div style={{ color: "#ff4466", fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: "0.15em" }}>⚠ CONFIRM DELETE</div>
            <div style={{ color: "#1e4d6b", fontSize: 11, marginBottom: 20, wordBreak: "break-all" }}>{deleteConfirm.replace(".json", "")}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", color: "#1e4d6b", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 12, letterSpacing: "0.1em" }}>CANCEL</button>
              <button onClick={() => deleteHistoryFile(deleteConfirm)} style={{ flex: 1, background: "rgba(255,68,102,0.1)", border: "1px solid rgba(255,68,102,0.4)", color: "#ff6b8a", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", boxShadow: "0 0 15px rgba(255,68,102,0.15)" }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #020d1a 0%, #010810 100%)", borderBottom: "1px solid rgba(0,229,255,0.12)", padding: "14px 16px", position: "relative", overflow: "hidden" }}>
        {/* Scanline effect */}
        <div style={{ position: "absolute", left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)", animation: "scanline 4s linear infinite", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 38, height: 38, background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 15px rgba(0,229,255,0.1)" }}>📹</div>
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#00ff88", borderRadius: "50%", border: "2px solid #010810", boxShadow: "0 0 6px #00ff88" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", background: "linear-gradient(90deg, #00e5ff, #2979ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Orbitron', monospace" }}>
              SMART CCTV
            </div>
            <div style={{ color: "#1e4d6b", fontSize: 10, letterSpacing: "0.1em", marginTop: 1 }}>
              {data.metadata.video_file} · {data.metadata.resolution} · {data.metadata.fps}fps
            </div>
          </div>
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 10, letterSpacing: "0.1em", boxShadow: showHistory ? "0 0 12px rgba(0,229,255,0.2)" : "none" }}>
            ◫ {history.length}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { label: "TRACKED", value: data.metadata.total_persons_tracked, color: "#e2e8f0" },
            { label: "CARDS", value: data.metadata.cards_generated, color: "#e2e8f0" },
            { label: "ACTIVE", value: totalActive, color: "#00ff88", glow: "0 0 12px rgba(0,255,136,0.3)" },
            { label: "AVG DUR", value: `${avgDuration}s`, color: "#00e5ff", glow: "0 0 12px rgba(0,229,255,0.2)" },
          ].map(({ label, value, color, glow }) => (
            <div key={label} style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ color, fontSize: 22, fontWeight: 900, fontFamily: "'Orbitron', monospace", textShadow: glow || "none" }}>{value}</div>
              <div style={{ color: "#0d2d3d", fontSize: 8, letterSpacing: "0.15em", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div style={{ background: "#020d1a", borderBottom: "1px solid rgba(0,229,255,0.08)", padding: "10px 16px" }}>
          <div style={{ color: "#0d2d3d", fontSize: 9, letterSpacing: "0.2em", marginBottom: 8 }}>◈ ARCHIVED SESSIONS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {history.length === 0
              ? <span style={{ color: "#0d2d3d", fontSize: 11 }}>No archives</span>
              : history.map(f => (
                <button key={f} onClick={() => loadHistoryFile(f)}
                  onTouchStart={() => startLongPress(f)} onTouchEnd={cancelLongPress}
                  onMouseDown={() => startLongPress(f)} onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
                  style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", color: "#00e5ff", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 9, letterSpacing: "0.08em", userSelect: "none" }}>
                  {f.replace(".json", "").substring(0, 22)}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: "12px 16px", background: "#020d1a", borderBottom: "1px solid rgba(0,229,255,0.05)" }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0d2d3d", fontSize: 14 }}>⌕</span>
          <input type="text" placeholder="SEARCH SUBJECT ID..." value={searchId} onChange={e => setSearchId(e.target.value)}
            style={{ width: "100%", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 8, padding: "9px 12px 9px 32px", color: "#e2e8f0", fontSize: 12, outline: "none", letterSpacing: "0.08em" }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["all", "active", "high", "flagged"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "rgba(0,229,255,0.12)" : "rgba(0,229,255,0.03)",
              border: filter === f ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(0,229,255,0.07)",
              color: filter === f ? "#00e5ff" : "#1e4d6b",
              boxShadow: filter === f ? "0 0 10px rgba(0,229,255,0.15)" : "none",
              borderRadius: 6, padding: "6px 0", fontSize: 9, cursor: "pointer",
              fontWeight: filter === f ? 700 : 400, letterSpacing: "0.12em", flex: 1,
            }}>{f.toUpperCase()}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          width: "100%", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.08)",
          borderRadius: 8, padding: "8px 12px", color: "#1e4d6b", fontSize: 10, outline: "none", letterSpacing: "0.1em",
        }}>
          <option value="entry">SORT ◈ ENTRY TIME</option>
          <option value="duration">SORT ◈ DURATION</option>
          <option value="confidence">SORT ◈ CONFIDENCE</option>
        </select>
      </div>

      {/* Cards */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 70 }}>
        {filtered.length === 0
          ? <div style={{ color: "#0d2d3d", textAlign: "center", marginTop: 40, fontSize: 11, letterSpacing: "0.2em" }}>NO SUBJECTS FOUND</div>
          : filtered.map(card => <PersonCard key={card.person_id} card={card} onClick={() => setSelected(card)} />)}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(2,13,26,0.95)", borderTop: "1px solid rgba(0,229,255,0.12)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(10px)" }}>
        <div style={{ color: "#0d2d3d", fontSize: 9, letterSpacing: "0.15em" }}>
          {lastUpdated ? `◈ LAST SYNC ${lastUpdated}` : "◈ AWAITING SYNC"}
        </div>
        <button onClick={() => { fetchLatest(); fetchHistory(); }} style={{
          background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.25)",
          color: "#00e5ff", borderRadius: 8, padding: "7px 20px", cursor: "pointer",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
          boxShadow: "0 0 15px rgba(0,229,255,0.15)",
        }}>⟳ SYNC</button>
      </div>
    </div>
  );
}
