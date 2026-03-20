import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://cctv-backend-production.up.railway.app";

const COLOR_HEX = {
  Red: "#ff4444", Orange: "#ff8c00", Yellow: "#ffd700", Green: "#00ff41",
  Cyan: "#00e5ff", Blue: "#2979ff", Purple: "#aa00ff", Pink: "#f50057",
  White: "#f5f5f5", Black: "#1a1a1a", Gray: "#9e9e9e", Mixed: "#78909c", Unknown: "#546e7a",
};

function fmtDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Number(s).toFixed(1)}s`;
}
function confColor(c) { return c === "high" ? "#00ff41" : c === "medium" ? "#ffd700" : "#ff4444"; }

function ColorDot({ color }) {
  const hex = COLOR_HEX[color] || "#546e7a";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 8, height: 8, background: hex, borderRadius: 2, flexShrink: 0, boxShadow: `0 0 4px ${hex}` }} />
      <span style={{ color: "#4a9a4a", fontSize: 11, fontFamily: "monospace" }}>{color}</span>
    </span>
  );
}

function ConfBar({ confidence }) {
  const pct = confidence === "high" ? 100 : confidence === "medium" ? 60 : 30;
  const color = confColor(confidence);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em" }}>CONFIDENCE</span>
        <span style={{ color, fontSize: 9, fontFamily: "monospace", fontWeight: 700 }}>{confidence.toUpperCase()}</span>
      </div>
      <div style={{ background: "#0a1a0a", borderRadius: 2, height: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, boxShadow: `0 0 6px ${color}`, transition: "width 0.5s ease", borderRadius: 2 }} />
      </div>
    </div>
  );
}

function SilhouetteIcon({ upper, lower, size = 32, faceDetected = false }) {
  const uh = COLOR_HEX[upper] || "#1a3a1a";
  const lh = COLOR_HEX[lower] || "#0a1a0a";
  return (
    <div style={{ position: "relative" }}>
      <svg width={size} height={size * 2} viewBox="0 0 36 72" fill="none">
        <circle cx="18" cy="9" r="7" fill={faceDetected ? "#00ff41" : "#2a4a2a"} style={faceDetected ? { filter: "drop-shadow(0 0 4px #00ff41)" } : {}} />
        <rect x="7" y="17" width="22" height="24" rx="3" fill={uh} />
        <rect x="7" y="41" width="22" height="22" rx="2" fill={lh} />
        <rect x="1" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.8" />
        <rect x="28" y="19" width="7" height="18" rx="2" fill={uh} opacity="0.8" />
      </svg>
      {faceDetected && (
        <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#00ff41", borderRadius: "50%", border: "1px solid #020f02", boxShadow: "0 0 6px #00ff41" }} />
      )}
    </div>
  );
}

// ── PERSON MODAL ──────────────────────────────────────────────────
function PersonModal({ card, onClose }) {
  if (!card) return null;
  const isActive = !card.exit_time;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,5,0,0.95)", zIndex: 1000, display: "flex", alignItems: "flex-end", backdropFilter: "blur(2px)" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxHeight: "90vh", overflowY: "auto",
        background: "#020f02",
        borderTop: "1px solid #00ff41",
        boxShadow: "0 -4px 30px rgba(0,255,65,0.15)",
        borderRadius: "16px 16px 0 0",
        paddingBottom: 50,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #0a2a0a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 2, height: 16, background: "#00ff41", boxShadow: "0 0 6px #00ff41" }} />
            <span style={{ color: "#00ff41", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textShadow: "0 0 8px #00ff41" }}>SUBJECT DETAILS</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,255,65,0.08)", border: "1px solid #0a3a0a", color: "#4a9a4a", borderRadius: 6, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: 18 }}>
          {/* ID row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={44} faceDetected={card.face_detected} />
            <div>
              <div style={{ color: "#00ff41", fontSize: 26, fontWeight: 900, fontFamily: "monospace", textShadow: "0 0 10px #00ff41", letterSpacing: "0.05em" }}>
                SBJ_{String(card.person_id).padStart(3, "0")}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                {isActive && <span style={{ background: "rgba(0,255,65,0.1)", color: "#00ff41", border: "1px solid #0a3a0a", fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 7px", fontFamily: "monospace", animation: "blink 1.5s infinite" }}>● LIVE</span>}
                {card.face_detected && <span style={{ background: "rgba(0,255,65,0.08)", color: "#00ff41", border: "1px solid #0a3a0a", fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "1px 7px", fontFamily: "monospace" }}>👤 FACE DETECTED</span>}
              </div>
            </div>
          </div>

          {/* Passport Face Photo */}
          {(card.face_b64 || card.snapshot_b64) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>
                {card.face_b64 ? "// PASSPORT PHOTO" : "// CAPTURE"}
              </div>
              <div style={{ background: card.face_b64 ? "#ffffff" : "#010a01", border: "1px solid #0a2a0a", borderRadius: 8, padding: 10, textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 6, left: 6, width: 12, height: 12, borderTop: "1px solid #00ff41", borderLeft: "1px solid #00ff41" }} />
                <div style={{ position: "absolute", top: 6, right: 6, width: 12, height: 12, borderTop: "1px solid #00ff41", borderRight: "1px solid #00ff41" }} />
                <div style={{ position: "absolute", bottom: 6, left: 6, width: 12, height: 12, borderBottom: "1px solid #00ff41", borderLeft: "1px solid #00ff41" }} />
                <div style={{ position: "absolute", bottom: 6, right: 6, width: 12, height: 12, borderBottom: "1px solid #00ff41", borderRight: "1px solid #00ff41" }} />
                <img src={`data:image/jpeg;base64,${card.face_b64 || card.snapshot_b64}`} alt="passport" style={{ maxHeight: 200, borderRadius: 4 }} />
              </div>
            </div>
          )}

          {/* Confidence bar */}
          <div style={{ background: "#010a01", border: "1px solid #0a2a0a", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <ConfBar confidence={card.confidence} />
          </div>

          {/* Time grid */}
          <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>// TEMPORAL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "ENTRY", value: card.entry_time.split(" ")[1], sub: card.entry_time.split(" ")[0] },
              { label: "EXIT", value: card.exit_time ? card.exit_time.split(" ")[1] : "ACTIVE", sub: card.exit_time ? card.exit_time.split(" ")[0] : "Still in frame" },
              { label: "DURATION", value: fmtDuration(card.duration_seconds), sub: `${card.duration_seconds}s total` },
              { label: "FRAMES", value: card.frame_count?.toLocaleString(), sub: "tracked" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: "#010a01", border: "1px solid #0a2a0a", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                <div style={{ color: "#00ff41", fontSize: 15, fontWeight: 700, fontFamily: "monospace", textShadow: "0 0 6px rgba(0,255,65,0.3)" }}>{value}</div>
                <div style={{ color: "#1a3a1a", fontSize: 9, marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Appearance */}
          <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>// APPEARANCE</div>
          <div style={{ background: "#010a01", border: "1px solid #0a2a0a", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 28 }}>
              <div><div style={{ color: "#1a3a1a", fontSize: 9, fontFamily: "monospace", marginBottom: 6 }}>UPPER BODY</div><ColorDot color={card.upper_color} /></div>
              <div><div style={{ color: "#1a3a1a", fontSize: 9, fontFamily: "monospace", marginBottom: 6 }}>LOWER BODY</div><ColorDot color={card.lower_color} /></div>
            </div>
          </div>

          {/* Position */}
          <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>// COORDINATES</div>
          <div style={{ background: "#010a01", border: "1px solid #0a2a0a", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 24 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13 }}><span style={{ color: "#1a4a1a" }}>X: </span><span style={{ color: "#00ff41" }}>{card.avg_position?.[0]}</span></span>
              <span style={{ fontFamily: "monospace", fontSize: 13 }}><span style={{ color: "#1a4a1a" }}>Y: </span><span style={{ color: "#00ff41" }}>{card.avg_position?.[1]}</span></span>
            </div>
          </div>

          {/* Face info */}
          {card.face_detected && (
            <>
              <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>// FACE DATA</div>
              <div style={{ background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ color: "#00ff41", fontSize: 13, fontFamily: "monospace" }}>✓ Face detected · {card.face_count} max simultaneous</div>
              </div>
            </>
          )}

          {/* Flags */}
          {card.notes && card.notes.length > 0 && (
            <>
              <div style={{ color: "#1a4a1a", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 6 }}>// FLAGS</div>
              <div style={{ background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.15)", borderRadius: 8, padding: "12px 14px" }}>
                {card.notes.map((n, i) => <div key={i} style={{ color: "#ff6b6b", fontSize: 12, fontFamily: "monospace", marginBottom: 3 }}>⚑ {n}</div>)}
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
  return (
    <div onClick={onClick}
      style={{ background: "#010a01", border: "1px solid #0a2a0a", borderLeft: `2px solid ${card.face_detected ? "#00ff41" : "#0a3a0a"}`, borderRadius: 8, padding: "13px 14px", cursor: "pointer", transition: "all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#021402"; e.currentTarget.style.borderColor = "#0a3a0a"; e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,65,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#010a01"; e.currentTarget.style.borderColor = "#0a2a0a"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SilhouetteIcon upper={card.upper_color} lower={card.lower_color} size={20} faceDetected={card.face_detected} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ color: "#00ff41", fontWeight: 900, fontSize: 13, fontFamily: "monospace", textShadow: "0 0 6px rgba(0,255,65,0.4)" }}>
                SBJ_{String(card.person_id).padStart(3, "0")}
              </span>
              {isActive && <span style={{ background: "rgba(0,255,65,0.1)", color: "#00ff41", border: "1px solid #0a3a0a", fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "1px 5px", fontFamily: "monospace" }}>● LIVE</span>}
              {card.face_detected && <span style={{ color: "#00ff41", fontSize: 10 }}>👤</span>}
            </div>
            <div style={{ color: "#1a4a1a", fontSize: 10, marginTop: 2, fontFamily: "monospace" }}>
              {card.entry_time.split(" ")[1]} → {card.exit_time ? card.exit_time.split(" ")[1] : "ongoing"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{fmtDuration(card.duration_seconds)}</div>
          <span style={{ color: confColor(card.confidence), fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em" }}>{card.confidence.toUpperCase()}</span>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfBar confidence={card.confidence} />

      <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 8, borderTop: "1px solid #050f05" }}>
        <div><div style={{ color: "#0a2a0a", fontSize: 8, fontFamily: "monospace", marginBottom: 3 }}>UPPER</div><ColorDot color={card.upper_color} /></div>
        <div><div style={{ color: "#0a2a0a", fontSize: 8, fontFamily: "monospace", marginBottom: 3 }}>LOWER</div><ColorDot color={card.lower_color} /></div>
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
    <div style={{ background: "#020f02", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes scanline{0%{top:-2px}100%{top:100%}}`}</style>
      <div style={{ width: 36, height: 36, border: "2px solid #0a2a0a", borderTop: "2px solid #00ff41", borderRadius: "50%", animation: "spin 0.8s linear infinite", boxShadow: "0 0 10px rgba(0,255,65,0.3)" }} />
      <div style={{ color: "#1a4a1a", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.3em" }}>INITIALIZING...</div>
    </div>
  );

  if (!data) return (
    <div style={{ background: "#020f02", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <div style={{ color: "#1a4a1a", fontSize: 40 }}>⬡</div>
      <div style={{ color: "#2a6a2a", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.2em" }}>NO DATA STREAM</div>
      <code style={{ color: "#00ff41", background: "#010a01", border: "1px solid #0a2a0a", padding: "8px 16px", borderRadius: 6, fontSize: 10, fontFamily: "monospace" }}>
        python smart_cctv_v2.py --video input.mp4
      </code>
      <button onClick={() => { fetchLatest(); fetchHistory(); }} style={{ background: "rgba(0,255,65,0.08)", border: "1px solid #0a3a0a", color: "#00ff41", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em" }}>⟳ SYNC</button>
    </div>
  );

  const cards = data.person_cards || [];
  const totalActive = cards.filter(c => !c.exit_time).length;
  const facesDetected = cards.filter(c => c.face_detected).length;
  const avgDuration = cards.length ? (cards.reduce((s, c) => s + c.duration_seconds, 0) / cards.length).toFixed(1) : 0;

  const filtered = cards
    .filter(c => {
      if (filter === "active") return !c.exit_time;
      if (filter === "high") return c.confidence === "high";
      if (filter === "flagged") return c.notes && c.notes.length > 0;
      if (filter === "face") return c.face_detected;
      return true;
    })
    .filter(c => searchId === "" || String(c.person_id).includes(searchId))
    .sort((a, b) => {
      if (sortBy === "duration") return b.duration_seconds - a.duration_seconds;
      if (sortBy === "confidence") return ({ high: 0, medium: 1, low: 2 }[a.confidence] || 0) - ({ high: 0, medium: 1, low: 2 }[b.confidence] || 0);
      return a.entry_time.localeCompare(b.entry_time);
    });

  return (
    <div style={{ background: "#020f02", minHeight: "100vh", fontFamily: "monospace", color: "#e0e0e0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #010a01; }
        ::-webkit-scrollbar-thumb { background: #0a3a0a; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanpulse { 0%{box-shadow:0 0 0px rgba(0,255,65,0)} 50%{box-shadow:0 0 8px rgba(0,255,65,0.15)} 100%{box-shadow:0 0 0px rgba(0,255,65,0)} }
      `}</style>

      {selected && <PersonModal card={selected} onClose={() => setSelected(null)} />}

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,5,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#020f02", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 10, padding: 22, width: "100%", maxWidth: 300 }}>
            <div style={{ color: "#ff4444", fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: "0.15em" }}>⚠ DELETE RECORD?</div>
            <div style={{ color: "#2a4a2a", fontSize: 10, marginBottom: 18, wordBreak: "break-all" }}>{deleteConfirm.replace(".json", "")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid #0a2a0a", color: "#2a6a2a", borderRadius: 6, padding: "9px", cursor: "pointer", fontSize: 11, letterSpacing: "0.1em" }}>CANCEL</button>
              <button onClick={() => deleteHistoryFile(deleteConfirm)} style={{ flex: 1, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.3)", color: "#ff6b6b", borderRadius: 6, padding: "9px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#010a01", borderBottom: "1px solid #0a2a0a", padding: "12px 16px", animation: "scanpulse 4s infinite" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ position: "relative", width: 34, height: 34, background: "rgba(0,255,65,0.06)", border: "1px solid #0a2a0a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            📹
            <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, background: "#00ff41", borderRadius: "50%", border: "1px solid #020f02", boxShadow: "0 0 6px #00ff41", animation: "blink 2s infinite" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#00ff41", fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textShadow: "0 0 8px rgba(0,255,65,0.4)" }}>NEXUS SURVEILLANCE</div>
            <div style={{ color: "#1a3a1a", fontSize: 9, letterSpacing: "0.1em", marginTop: 1 }}>
              {data.metadata.video_file} · {data.metadata.resolution} · {data.metadata.fps}fps · {data.metadata.model || "cv2"}
            </div>
          </div>
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} style={{ background: "rgba(0,255,65,0.06)", border: "1px solid #0a2a0a", color: "#2a6a2a", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 9, letterSpacing: "0.1em" }}>
            ◫ {history.length}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {[
            { label: "TRACKED", value: data.metadata.total_persons_tracked, color: "#e0e0e0" },
            { label: "CARDS", value: data.metadata.cards_generated, color: "#e0e0e0" },
            { label: "FACES", value: data.metadata.faces_detected ?? facesDetected, color: "#00ff41" },
            { label: "AVG", value: `${avgDuration}s`, color: "#ffd700" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#020f02", border: "1px solid #0a2a0a", borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ color, fontSize: 20, fontWeight: 900, textShadow: color === "#00ff41" ? "0 0 8px rgba(0,255,65,0.4)" : "none" }}>{value}</div>
              <div style={{ color: "#0a2a0a", fontSize: 7, letterSpacing: "0.15em", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div style={{ background: "#010a01", borderBottom: "1px solid #0a2a0a", padding: "10px 16px" }}>
          <div style={{ color: "#0a2a0a", fontSize: 8, letterSpacing: "0.15em", marginBottom: 6 }}>// ARCHIVED SESSIONS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {history.length === 0
              ? <span style={{ color: "#0a2a0a", fontSize: 10 }}>No archives</span>
              : history.map(f => (
                <button key={f} onClick={() => loadHistoryFile(f)}
                  onTouchStart={() => startLongPress(f)} onTouchEnd={cancelLongPress}
                  onMouseDown={() => startLongPress(f)} onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
                  style={{ background: "rgba(0,255,65,0.04)", border: "1px solid #0a2a0a", color: "#2a6a2a", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontSize: 8, letterSpacing: "0.06em", userSelect: "none" }}>
                  {f.replace(".json", "").substring(0, 22)}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: "10px 16px", background: "#010a01", borderBottom: "1px solid #050f05" }}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input type="text" placeholder="SEARCH ID..." value={searchId} onChange={e => setSearchId(e.target.value)}
            style={{ width: "100%", background: "#020f02", border: "1px solid #0a2a0a", borderRadius: 6, padding: "8px 12px", color: "#00ff41", fontSize: 10, outline: "none", fontFamily: "monospace", letterSpacing: "0.1em" }} />
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          {["all", "active", "high", "face", "flagged"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "rgba(0,255,65,0.12)" : "#020f02",
              border: filter === f ? "1px solid #0a3a0a" : "1px solid #050f05",
              color: filter === f ? "#00ff41" : "#1a3a1a",
              borderRadius: 4, padding: "5px 0", fontSize: 8, cursor: "pointer",
              fontWeight: filter === f ? 700 : 400, letterSpacing: "0.1em", flex: 1,
              fontFamily: "monospace",
              boxShadow: filter === f ? "0 0 6px rgba(0,255,65,0.1)" : "none",
            }}>{f.toUpperCase()}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          width: "100%", background: "#020f02", border: "1px solid #0a2a0a",
          borderRadius: 6, padding: "7px 10px", color: "#1a4a1a", fontSize: 9,
          outline: "none", fontFamily: "monospace", letterSpacing: "0.1em",
        }}>
          <option value="entry">// SORT: ENTRY TIME</option>
          <option value="duration">// SORT: DURATION</option>
          <option value="confidence">// SORT: CONFIDENCE</option>
        </select>
      </div>

      {/* Cards */}
      <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 65 }}>
        {filtered.length === 0
          ? <div style={{ color: "#0a2a0a", textAlign: "center", marginTop: 40, fontSize: 10, letterSpacing: "0.15em" }}>NO RECORDS MATCH</div>
          : filtered.map(card => <PersonCard key={card.person_id} card={card} onClick={() => setSelected(card)} />)}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#010a01", borderTop: "1px solid #0a2a0a", padding: "9px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#0a2a0a", fontSize: 8, letterSpacing: "0.15em" }}>
          {lastUpdated ? `LAST SYNC // ${lastUpdated}` : "AWAITING SYNC"}
        </div>
        <button onClick={() => { fetchLatest(); fetchHistory(); }} style={{
          background: "rgba(0,255,65,0.08)", border: "1px solid #0a3a0a",
          color: "#00ff41", borderRadius: 6, padding: "6px 16px", cursor: "pointer",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", fontFamily: "monospace",
          boxShadow: "0 0 8px rgba(0,255,65,0.1)",
        }}>⟳ SYNC</button>
      </div>
    </div>
  );
}
// redeploy Fri Mar 20 12:47:47 IST 2026
