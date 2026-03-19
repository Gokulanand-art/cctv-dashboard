import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://cctv-backend-production.up.railway.app";

const COLOR_HEX = {
  Red: "#ff4444", Orange: "#ff8c00", Yellow: "#ffd700", Green: "#00c853",
  Cyan: "#00e5ff", Blue: "#2979ff", Purple: "#aa00ff", Pink: "#f50057",
  White: "#f5f5f5", Black: "#212121", Gray: "#9e9e9e", Mixed: "#78909c", Unknown: "#546e7a",
};

function fmtDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Number(s).toFixed(1)}s`;
}
function confColor(c) { return c === "high" ? "#00c853" : c === "medium" ? "#ff8c00" : "#ff4444"; }
function confBg(c) { return c === "high" ? "rgba(0,200,83,0.1)" : c === "medium" ? "rgba(255,140,0,0.1)" : "rgba(255,68,68,0.1)"; }

function ColorSwatch({ color }) {
  const hex = COLOR_HEX[color] || "#546e7a";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, background: hex, flexShrink: 0, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
      <span style={{ color: "#a0aec0", fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>{color.toUpperCase()}</span>
    </span>
  );
}

function SilhouetteIcon({ upper, lower, size = 36 }) {
  const uh = COLOR_HEX[upper] || "#546e7a";
  const lh = COLOR_HEX[lower] || "#37474f";
  return (
    <svg width={size} height={size * 2} viewBox="0 0 36 72" fill="none">
      <circle cx="18" cy="9" r="7" fill="#b0bec5" />
      <rect x="7" y="17" width="22" height="24" rx="3" fill={uh} />
      <rect x="7" y="41" width="22" height="22" rx="2" fill={lh} />
      <rect x="1" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.8" />
      <rect x="28" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.8" />
    </svg>
  );
}

// ── PERSON DETAIL MODAL ───────────────────────────────────────────
function PersonModal({ card, onClose }) {
  if (!card) return null;
  const isActive = !card.exit_time;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
      zIndex: 1000, display: "flex", alignItems: "flex-end",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxHeight: "90vh", overflowY: "auto",
        background: "#0a0e13",
        borderTop: "1px solid rgba(255,140,0,0.4)",
        borderRadius: "16px 16px 0 0",
        padding: "0 0 50px",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,140,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 20, background: "#ff8c00", borderRadius: 2 }} />
            <span style={{ color: "#ff8c00", fontSize: 11, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", fontWeight: 700 }}>
              SUBJECT RECORD
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#718096", borderRadius: 8, width: 32, height: 32,
            fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* ID Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{
              background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.2)",
              borderRadius: 12, padding: "8px",
            }}>
              <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={40} />
            </div>
            <div>
              <div style={{ color: "#ff8c00", fontSize: 28, fontWeight: 900, fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>
                ID-{String(card.person_id).padStart(3, "0")}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{
                  background: confBg(card.confidence),
                  color: confColor(card.confidence),
                  border: `1px solid ${confColor(card.confidence)}44`,
                  fontSize: 10, fontWeight: 700, borderRadius: 4,
                  padding: "2px 8px", fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                }}>{card.confidence.toUpperCase()} CONF</span>
                {isActive && (
                  <span style={{
                    background: "rgba(0,200,83,0.1)", color: "#00c853",
                    border: "1px solid rgba(0,200,83,0.3)",
                    fontSize: 10, fontWeight: 700, borderRadius: 4,
                    padding: "2px 8px", fontFamily: "'Courier New', monospace",
                    letterSpacing: "0.1em", animation: "pulse 2s infinite",
                  }}>● ACTIVE</span>
                )}
              </div>
            </div>
          </div>

          {/* Snapshot */}
          {card.snapshot_b64 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#4a5568", fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 8 }}>// VISUAL CAPTURE</div>
              <div style={{
                background: "#050709", border: "1px solid rgba(255,140,0,0.2)",
                borderRadius: 10, padding: 12, textAlign: "center",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  width: 16, height: 16, borderTop: "2px solid #ff8c00", borderLeft: "2px solid #ff8c00",
                }} />
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  width: 16, height: 16, borderTop: "2px solid #ff8c00", borderRight: "2px solid #ff8c00",
                }} />
                <div style={{
                  position: "absolute", bottom: 8, left: 8,
                  width: 16, height: 16, borderBottom: "2px solid #ff8c00", borderLeft: "2px solid #ff8c00",
                }} />
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  width: 16, height: 16, borderBottom: "2px solid #ff8c00", borderRight: "2px solid #ff8c00",
                }} />
                <img
                  src={`data:image/jpeg;base64,${card.snapshot_b64}`}
                  alt="capture"
                  style={{ maxHeight: 220, borderRadius: 6, border: "1px solid rgba(255,140,0,0.15)" }}
                />
              </div>
            </div>
          )}

          {/* Time grid */}
          <div style={{ color: "#4a5568", fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 8 }}>// TEMPORAL DATA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "ENTRY", value: card.entry_time.split(" ")[1], sub: card.entry_time.split(" ")[0] },
              { label: "EXIT", value: card.exit_time ? card.exit_time.split(" ")[1] : "ACTIVE", sub: card.exit_time ? card.exit_time.split(" ")[0] : "In frame" },
              { label: "DURATION", value: fmtDuration(card.duration_seconds), sub: `${card.duration_seconds}s` },
              { label: "FRAMES", value: card.frame_count?.toLocaleString(), sub: "tracked" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{
                background: "#050709", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ color: "#4a5568", fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 4 }}>{label}</div>
                <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, fontFamily: "'Courier New', monospace" }}>{value}</div>
                <div style={{ color: "#4a5568", fontSize: 10, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Appearance */}
          <div style={{ color: "#4a5568", fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 8 }}>// APPEARANCE</div>
          <div style={{ background: "#050709", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <div style={{ color: "#4a5568", fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", marginBottom: 8 }}>UPPER</div>
                <ColorSwatch color={card.upper_color} />
              </div>
              <div>
                <div style={{ color: "#4a5568", fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", marginBottom: 8 }}>LOWER</div>
                <ColorSwatch color={card.lower_color} />
              </div>
            </div>
          </div>

          {/* Position */}
          <div style={{ color: "#4a5568", fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 8 }}>// COORDINATES</div>
          <div style={{ background: "#050709", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 24 }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 14 }}>
                <span style={{ color: "#4a5568" }}>X: </span>
                <span style={{ color: "#ff8c00" }}>{card.avg_position?.[0]}</span>
              </span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 14 }}>
                <span style={{ color: "#4a5568" }}>Y: </span>
                <span style={{ color: "#ff8c00" }}>{card.avg_position?.[1]}</span>
              </span>
            </div>
          </div>

          {/* Flags */}
          {card.notes && card.notes.length > 0 && (
            <>
              <div style={{ color: "#4a5568", fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: 8 }}>// FLAGS</div>
              <div style={{ background: "rgba(255,68,68,0.05)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                {card.notes.map((n, i) => (
                  <div key={i} style={{ color: "#ff6b6b", fontSize: 13, fontFamily: "'Courier New', monospace", marginBottom: 4 }}>
                    ⚑ {n}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PERSON CARD ───────────────────────────────────────────────────
function PersonCard({ card, onClick }) {
  const isActive = !card.exit_time;
  const uh = COLOR_HEX[card.upper_color] || "#546e7a";
  return (
    <div onClick={onClick} style={{
      background: "#0a0e13",
      border: "1px solid rgba(255,255,255,0.06)",
      borderLeft: `3px solid ${uh}`,
      borderRadius: 10, padding: "14px 16px",
      cursor: "pointer", transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#0f1520"; e.currentTarget.style.borderColor = "rgba(255,140,0,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#0a0e13"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={22} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#ff8c00", fontWeight: 900, fontSize: 14, fontFamily: "'Courier New', monospace", letterSpacing: "0.08em" }}>
                ID-{String(card.person_id).padStart(3, "0")}
              </span>
              {isActive && (
                <span style={{ background: "rgba(0,200,83,0.1)", color: "#00c853", border: "1px solid rgba(0,200,83,0.3)", fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 5px", fontFamily: "'Courier New', monospace" }}>
                  ● LIVE
                </span>
              )}
            </div>
            <div style={{ color: "#4a5568", fontSize: 11, marginTop: 2, fontFamily: "'Courier New', monospace" }}>
              {card.entry_time.split(" ")[1]} → {card.exit_time ? card.exit_time.split(" ")[1] : "ongoing"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
            {fmtDuration(card.duration_seconds)}
          </div>
          <span style={{ background: confBg(card.confidence), color: confColor(card.confidence), border: `1px solid ${confColor(card.confidence)}33`, fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 6px", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em" }}>
            {card.confidence.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div>
          <div style={{ color: "#2d3748", fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>UPPER</div>
          <ColorSwatch color={card.upper_color} />
        </div>
        <div>
          <div style={{ color: "#2d3748", fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>LOWER</div>
          <ColorSwatch color={card.lower_color} />
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────
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
    try {
      const res = await fetch(`${BACKEND_URL}/latest`);
      const json = await res.json();
      if (json) { setData(json); setLastUpdated(new Date().toLocaleTimeString()); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    try { const res = await fetch(`${BACKEND_URL}/history`); setHistory(await res.json()); } catch (e) { console.error(e); }
  };

  const loadHistoryFile = async (filename) => {
    try { const res = await fetch(`${BACKEND_URL}/history/${filename}`); setData(await res.json()); setSelected(null); setShowHistory(false); } catch (e) { console.error(e); }
  };

  const deleteHistoryFile = async (filename) => {
    try { await fetch(`${BACKEND_URL}/history/${filename}`, { method: "DELETE" }); setHistory(prev => prev.filter(f => f !== filename)); setDeleteConfirm(null); } catch (e) { console.error(e); }
  };

  const startLongPress = (f) => { longPressTimer.current = setTimeout(() => setDeleteConfirm(f), 600); };
  const cancelLongPress = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  useEffect(() => { fetchLatest(); fetchHistory(); }, []);

  if (loading) return (
    <div style={{ background: "#050709", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "2px solid rgba(255,140,0,0.2)", borderTop: "2px solid #ff8c00", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ color: "#4a5568", fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: "0.2em" }}>INITIALIZING SYSTEM...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ background: "#050709", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ color: "#ff4444", fontSize: 32 }}>⬡</div>
      <div style={{ color: "#718096", fontSize: 14, fontFamily: "'Courier New', monospace" }}>NO DATA STREAM</div>
      <div style={{ color: "#4a5568", fontSize: 11, fontFamily: "'Courier New', monospace", textAlign: "center" }}>Run processing pipeline to initialize</div>
      <code style={{ color: "#ff8c00", background: "#0a0e13", border: "1px solid rgba(255,140,0,0.2)", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontFamily: "'Courier New', monospace" }}>
        python smart_cctv_system.py --video input.mp4
      </code>
    </div>
  );

  const cards = data.person_cards || [];
  const totalActive = cards.filter(c => !c.exit_time).length;
  const avgDuration = cards.length ? (cards.reduce((s, c) => s + c.duration_seconds, 0) / cards.length).toFixed(1) : 0;

  const filtered = cards
    .filter(c => {
      if (filter === "active") return !c.exit_time;
      if (filter === "high") return c.confidence === "high";
      if (filter === "flagged") return c.notes && c.notes.length > 0;
      return true;
    })
    .filter(c => searchId === "" || String(c.person_id).includes(searchId))
    .sort((a, b) => {
      if (sortBy === "duration") return b.duration_seconds - a.duration_seconds;
      if (sortBy === "confidence") return ({ high: 0, medium: 1, low: 2 }[a.confidence] || 0) - ({ high: 0, medium: 1, low: 2 }[b.confidence] || 0);
      return a.entry_time.localeCompare(b.entry_time);
    });

  return (
    <div style={{ background: "#050709", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050709; }
        ::-webkit-scrollbar-thumb { background: rgba(255,140,0,0.3); border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      `}</style>

      {selected && <PersonModal card={selected} onClose={() => setSelected(null)} />}

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0a0e13", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 12, padding: 24, width: "100%", maxWidth: 320 }}>
            <div style={{ color: "#ff4444", fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>⚠ CONFIRM DELETE</div>
            <div style={{ color: "#4a5568", fontSize: 11, marginBottom: 20, wordBreak: "break-all" }}>{deleteConfirm.replace(".json", "")}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#718096", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 12, letterSpacing: "0.1em" }}>CANCEL</button>
              <button onClick={() => deleteHistoryFile(deleteConfirm)} style={{ flex: 1, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.4)", color: "#ff6b6b", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0a0e13", borderBottom: "1px solid rgba(255,140,0,0.15)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📹</div>
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#00c853", borderRadius: "50%", border: "2px solid #050709" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#ff8c00", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", fontFamily: "'Rajdhani', sans-serif" }}>SMART CCTV // PERSON CARD SYSTEM</div>
            <div style={{ color: "#2d3748", fontSize: 10, letterSpacing: "0.1em", marginTop: 2 }}>
              {data.metadata.video_file} · {data.metadata.resolution} · {data.metadata.fps}fps
            </div>
          </div>
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.2)", color: "#ff8c00", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 10, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
            ◫ {history.length}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "TRACKED", value: data.metadata.total_persons_tracked, color: "#e2e8f0" },
            { label: "CARDS", value: data.metadata.cards_generated, color: "#e2e8f0" },
            { label: "ACTIVE", value: totalActive, color: "#00c853" },
            { label: "AVG DUR", value: `${avgDuration}s`, color: "#ff8c00" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ color, fontSize: 20, fontWeight: 900, letterSpacing: "0.05em" }}>{value}</div>
              <div style={{ color: "#2d3748", fontSize: 8, letterSpacing: "0.15em", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div style={{ background: "#080c11", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 16px" }}>
          <div style={{ color: "#2d3748", fontSize: 9, letterSpacing: "0.15em", marginBottom: 8 }}>// ARCHIVED SESSIONS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {history.length === 0
              ? <span style={{ color: "#2d3748", fontSize: 11 }}>No archives found</span>
              : history.map(f => (
                <button key={f}
                  onClick={() => loadHistoryFile(f)}
                  onTouchStart={() => startLongPress(f)} onTouchEnd={cancelLongPress}
                  onMouseDown={() => startLongPress(f)} onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
                  style={{ background: "rgba(255,140,0,0.06)", border: "1px solid rgba(255,140,0,0.15)", color: "#ff8c00", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 9, letterSpacing: "0.08em", userSelect: "none" }}>
                  {f.replace(".json", "").substring(0, 22)}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: "12px 16px", background: "#080c11", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#2d3748", fontSize: 12 }}>⌕</span>
          <input type="text" placeholder="SEARCH ID..." value={searchId} onChange={e => setSearchId(e.target.value)}
            style={{ width: "100%", background: "#0a0e13", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px 9px 32px", color: "#e2e8f0", fontSize: 11, outline: "none", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em" }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["all", "active", "high", "flagged"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "rgba(255,140,0,0.15)" : "rgba(255,255,255,0.03)",
              border: filter === f ? "1px solid rgba(255,140,0,0.4)" : "1px solid rgba(255,255,255,0.06)",
              color: filter === f ? "#ff8c00" : "#4a5568",
              borderRadius: 6, padding: "6px 0", fontSize: 9, cursor: "pointer",
              fontWeight: filter === f ? 700 : 400, letterSpacing: "0.12em", flex: 1,
              fontFamily: "'Courier New', monospace",
            }}>{f.toUpperCase()}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          width: "100%", background: "#0a0e13", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8, padding: "8px 12px", color: "#4a5568", fontSize: 10,
          outline: "none", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em",
        }}>
          <option value="entry">SORT // ENTRY TIME</option>
          <option value="duration">SORT // DURATION</option>
          <option value="confidence">SORT // CONFIDENCE</option>
        </select>
      </div>

      {/* Card list */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 70 }}>
        {filtered.length === 0
          ? <div style={{ color: "#2d3748", textAlign: "center", marginTop: 40, fontSize: 11, letterSpacing: "0.15em" }}>NO RECORDS MATCH FILTER</div>
          : filtered.map(card => <PersonCard key={card.person_id} card={card} onClick={() => setSelected(card)} />)}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0e13", borderTop: "1px solid rgba(255,140,0,0.15)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#2d3748", fontSize: 9, letterSpacing: "0.15em" }}>
          {lastUpdated ? `LAST SYNC: ${lastUpdated}` : "AWAITING SYNC"}
        </div>
        <button onClick={() => { fetchLatest(); fetchHistory(); }} style={{
          background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.3)",
          color: "#ff8c00", borderRadius: 6, padding: "6px 16px", cursor: "pointer",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'Courier New', monospace",
        }}>⟳ SYNC</button>
      </div>
    </div>
  );
}
