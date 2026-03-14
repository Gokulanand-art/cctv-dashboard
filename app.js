import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://cctv-backend-production.up.railway.app";

const COLOR_HEX = {
  Red: "#e53e3e", Orange: "#dd6b20", Yellow: "#d69e2e", Green: "#38a169",
  Cyan: "#00b5d8", Blue: "#3182ce", Purple: "#805ad5", Pink: "#d53f8c",
  White: "#e2e8f0", Black: "#1a202c", Gray: "#718096", Mixed: "#a0aec0",
  Unknown: "#4a5568",
};

function fmtDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Number(s).toFixed(1)}s`;
}
function confColor(c) { return c === "high" ? "#68d391" : c === "medium" ? "#f6ad55" : "#fc8181"; }
function confBg(c) { return c === "high" ? "#1a2e1a" : c === "medium" ? "#2d1f00" : "#2d0f0f"; }

function ColorDot({ color }) {
  const hex = COLOR_HEX[color] || "#718096";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 14, borderRadius: 3, background: hex, flexShrink: 0, boxShadow: `0 0 6px ${hex}55`, border: color === "White" ? "1px solid #4a5568" : "none" }} />
      <span style={{ color: "#cbd5e0", fontSize: 13 }}>{color}</span>
    </span>
  );
}

function MiniSilhouette({ upper, lower, size = 40 }) {
  const uh = COLOR_HEX[upper] || "#718096";
  const lh = COLOR_HEX[lower] || "#4a5568";
  return (
    <svg width={size} height={size * 2.2} viewBox="0 0 40 88" fill="none">
      <circle cx="20" cy="10" r="9" fill="#c8a882" />
      <rect x="8" y="20" width="24" height="30" rx="4" fill={uh} />
      <rect x="8" y="50" width="24" height="28" rx="3" fill={lh} />
      <rect x="2" y="22" width="7" height="22" rx="3" fill={uh} opacity="0.85" />
      <rect x="31" y="22" width="7" height="22" rx="3" fill={uh} opacity="0.85" />
    </svg>
  );
}

function PersonModal({ card, onClose }) {
  if (!card) return null;
  const isActive = !card.exit_time;
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0d1117", borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: "20px 20px 50px", border: "1px solid #1e293b", borderBottom: "none" }}>
        <div style={{ width: 40, height: 4, background: "#1e293b", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <MiniSilhouette upper={card.upper_color} lower={card.lower_color} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "#e2e8f0", fontSize: 26, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>
              Person #{String(card.person_id).padStart(3, "0")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ background: confBg(card.confidence), color: confColor(card.confidence), fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "2px 10px" }}>{card.confidence.toUpperCase()} CONFIDENCE</span>
              {isActive && <span style={{ background: "#1a3327", color: "#48bb78", border: "1px solid #2f6846", fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "2px 10px" }}>● ACTIVE</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", color: "#718096", borderRadius: 8, width: 36, height: 36, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Entry Time", value: card.entry_time.split(" ")[1], sub: card.entry_time.split(" ")[0] },
            { label: "Exit Time", value: card.exit_time ? card.exit_time.split(" ")[1] : "—", sub: card.exit_time ? card.exit_time.split(" ")[0] : "Still active" },
            { label: "Duration", value: fmtDuration(card.duration_seconds), sub: `${card.duration_seconds}s total` },
            { label: "Frames Seen", value: card.frame_count?.toLocaleString(), sub: "video frames" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: "#080d14", borderRadius: 10, padding: "12px 14px", border: "1px solid #1e293b" }}>
              <div style={{ color: "#4a5568", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>{label.toUpperCase()}</div>
              <div style={{ color: "#90cdf4", fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}</div>
              <div style={{ color: "#4a5568", fontSize: 11, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#080d14", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #1e293b" }}>
          <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 12 }}>APPEARANCE</div>
          <div style={{ display: "flex", gap: 32 }}>
            <div><div style={{ color: "#718096", fontSize: 12, marginBottom: 8 }}>Upper Body</div><ColorDot color={card.upper_color} /></div>
            <div><div style={{ color: "#718096", fontSize: 12, marginBottom: 8 }}>Lower Body</div><ColorDot color={card.lower_color} /></div>
          </div>
        </div>

        <div style={{ background: "#080d14", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #1e293b" }}>
          <div style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.1em", marginBottom: 10 }}>AVERAGE POSITION</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ color: "#cbd5e0", fontSize: 15 }}><span style={{ color: "#4a5568" }}>X: </span><span style={{ fontFamily: "'Space Mono', monospace", color: "#90cdf4" }}>{card.avg_position?.[0]}</span></span>
            <span style={{ color: "#cbd5e0", fontSize: 15 }}><span style={{ color: "#4a5568" }}>Y: </span><span style={{ fontFamily: "'Space Mono', monospace", color: "#90cdf4" }}>{card.avg_position?.[1]}</span></span>
          </div>
        </div>

        {card.notes && card.notes.length > 0 && (
          <div style={{ background: "#1a1200", borderRadius: 12, padding: 16, border: "1px solid #3d2e00" }}>
            <div style={{ color: "#744210", fontSize: 11, letterSpacing: "0.1em", marginBottom: 8 }}>FLAGS</div>
            {card.notes.map((n, i) => <div key={i} style={{ color: "#f6ad55", fontSize: 14, marginBottom: 4 }}>⚑ {n}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonCard({ card, onClick }) {
  const isActive = !card.exit_time;
  return (
    <div onClick={onClick} style={{ background: "#111827", border: "1.5px solid #1e293b", borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MiniSilhouette upper={card.upper_color} lower={card.lower_color} size={24} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, fontFamily: "'Space Mono', monospace" }}>P{String(card.person_id).padStart(3, "0")}</span>
              {isActive && <span style={{ background: "#1a3327", color: "#48bb78", border: "1px solid #2f6846", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 6px" }}>● ACTIVE</span>}
            </div>
            <div style={{ color: "#718096", fontSize: 12, marginTop: 2 }}>{card.entry_time.split(" ")[1]} → {card.exit_time ? card.exit_time.split(" ")[1] : "ongoing"}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#90cdf4", fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmtDuration(card.duration_seconds)}</div>
          <span style={{ background: confBg(card.confidence), color: confColor(card.confidence), fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 7px" }}>{card.confidence.toUpperCase()}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <div><div style={{ color: "#4a5568", fontSize: 10, marginBottom: 3 }}>UPPER</div><ColorDot color={card.upper_color} /></div>
        <div><div style={{ color: "#4a5568", fontSize: 10, marginBottom: 3 }}>LOWER</div><ColorDot color={card.lower_color} /></div>
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

  useEffect(() => {
    fetchLatest(); fetchHistory();
    const interval = setInterval(fetchLatest, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ background: "#060b14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "system-ui" }}>
      <div style={{ color: "#4299e1", fontSize: 40 }}>📹</div>
      <div style={{ color: "#4a5568", fontSize: 14 }}>Connecting to backend...</div>
    </div>
  );

  if (!data) return (
    <div style={{ background: "#060b14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "system-ui", padding: 24 }}>
      <div style={{ color: "#e53e3e", fontSize: 40 }}>📭</div>
      <div style={{ color: "#718096", fontSize: 16 }}>No video processed yet</div>
      <code style={{ color: "#4299e1", background: "#0d1117", padding: "8px 16px", borderRadius: 8, fontSize: 11 }}>python3 smart_cctv_system.py --video video.mp4</code>
    </div>
  );

  const cards = data.person_cards || [];
  const totalActive = cards.filter(c => !c.exit_time).length;
  const avgDuration = cards.length ? Math.round(cards.reduce((s, c) => s + c.duration_seconds, 0) / cards.length) : 0;
  const filtered = cards
    .filter(c => { if (filter === "active") return !c.exit_time; if (filter === "high") return c.confidence === "high"; if (filter === "flagged") return c.notes && c.notes.length > 0; return true; })
    .filter(c => searchId === "" || String(c.person_id).includes(searchId))
    .sort((a, b) => { if (sortBy === "duration") return b.duration_seconds - a.duration_seconds; if (sortBy === "confidence") return ({ high: 0, medium: 1, low: 2 }[a.confidence] || 0) - ({ high: 0, medium: 1, low: 2 }[b.confidence] || 0); return a.entry_time.localeCompare(b.entry_time); });

  return (
    <div style={{ background: "#060b14", minHeight: "100vh", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#e2e8f0" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }`}</style>

      {selected && <PersonModal card={selected} onClose={() => setSelected(null)} />}

      <div style={{ background: "#080d14", borderBottom: "1px solid #1e293b", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ background: "linear-gradient(135deg, #1a365d, #2b6cb0)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📹</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>Smart CCTV Person Card</div>
            <div style={{ color: "#4a5568", fontSize: 11 }}>{data.metadata.video_file} · {data.metadata.resolution} · {data.metadata.fps}fps</div>
          </div>
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} style={{ marginLeft: "auto", background: "#0d1117", border: "1px solid #1e293b", color: "#718096", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>📁 {history.length}</button>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-around" }}>
          {[{ label: "TRACKED", value: data.metadata.total_persons_tracked }, { label: "CARDS", value: data.metadata.cards_generated }, { label: "ACTIVE", value: totalActive, accent: true }, { label: "AVG", value: fmtDuration(avgDuration) }].map(({ label, value, accent }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ color: accent ? "#68d391" : "#90cdf4", fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}</div>
              <div style={{ color: "#4a5568", fontSize: 9, letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {showHistory && (
        <div style={{ background: "#0a0f1a", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {history.length === 0 ? <span style={{ color: "#4a5568", fontSize: 12 }}>No archived videos yet</span>
            : history.map(f => <button key={f} onClick={() => loadHistoryFile(f)} style={{ background: "#111827", border: "1px solid #1e293b", color: "#90cdf4", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontFamily: "'Space Mono', monospace" }}>{f.replace(".json", "").substring(0, 20)}</button>)}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", background: "#0a0f1a" }}>
        <input type="text" placeholder="Search by ID..." value={searchId} onChange={e => setSearchId(e.target.value)}
          style={{ width: "100%", background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, marginBottom: 10, outline: "none" }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["all", "active", "high", "flagged"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#1a365d" : "#0d1117", border: filter === f ? "1px solid #2b6cb0" : "1px solid #1e293b", color: filter === f ? "#90cdf4" : "#4a5568", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: filter === f ? 700 : 400, textTransform: "uppercase", flex: 1 }}>{f}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8, padding: "7px 10px", color: "#718096", fontSize: 12, outline: "none" }}>
          <option value="entry">Sort: Entry Time</option>
          <option value="duration">Sort: Duration</option>
          <option value="confidence">Sort: Confidence</option>
        </select>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 60 }}>
        {filtered.length === 0
          ? <div style={{ color: "#2d3748", textAlign: "center", marginTop: 40, fontSize: 13 }}>No cards match filter</div>
          : filtered.map(card => <PersonCard key={card.person_id} card={card} onClick={() => setSelected(card)} />)}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#080d14", borderTop: "1px solid #1e293b", padding: "8px 16px", textAlign: "center" }}>
        <div style={{ color: "#2f6846", fontSize: 11 }}>● Auto-refreshes every 10s {lastUpdated && `· ${lastUpdated}`}</div>
      </div>
    </div>
  );
}
