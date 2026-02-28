import { useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────
const BLOOM_LEVELS = [
  { level: "Remember", color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db", when: "Recall facts", verbs: ["List", "Define", "Identify", "Name", "Recall", "Recognize", "State", "Match"] },
  { level: "Understand", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", when: "Explain concepts", verbs: ["Describe", "Summarize", "Explain", "Paraphrase", "Classify", "Discuss", "Interpret"] },
  { level: "Apply", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", when: "Use in situations", verbs: ["Demonstrate", "Execute", "Implement", "Solve", "Use", "Operate", "Complete"] },
  { level: "Analyze", color: "#ca8a04", bg: "#fefce8", border: "#fef08a", when: "Break down, compare", verbs: ["Compare", "Contrast", "Examine", "Differentiate", "Categorize", "Distinguish", "Determine"] },
  { level: "Evaluate", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", when: "Make judgments", verbs: ["Justify", "Critique", "Assess", "Judge", "Defend", "Prioritize", "Recommend"] },
  { level: "Create", color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff", when: "Produce new work", verbs: ["Design", "Develop", "Construct", "Compose", "Formulate", "Generate", "Plan"] },
];

const PRIORITIES = [
  { label: "Must", color: "#dc2626", bg: "#fef2f2" },
  { label: "Should", color: "#ca8a04", bg: "#fefce8" },
  { label: "Nice to Have", color: "#6b7280", bg: "#f9fafb" },
];

const SAMPLE_AUDIENCES = [
  "CS Lease Support Representatives (45 agents)",
  "Collections Specialists (60 agents)",
  "Recovery Team Members (35 agents)",
  "All Customer Service Representatives (approximately 200 agents)",
];

const SAMPLE_TASKS_FROM_NA = [
  { id: "t1", task: "Navigate mySFS portal", source: "Stakeholder" },
  { id: "t2", task: "Process lease maturity status changes", source: "Stakeholder" },
  { id: "t3", task: "Handle customer inquiries about maturity options", source: "Stakeholder" },
  { id: "t4", task: "Escalate complex cases to Lease Maturity team", source: "Stakeholder" },
  { id: "t5", task: "Process payments via Repay processor", source: "Stakeholder" },
  { id: "t6", task: "Guide customers through vehicle self-assessment", source: "ID Analysis" },
];

const SAMPLE_OBJECTIVES = [
  {
    id: "1",
    audience: "All Customer Service Representatives (approximately 200 agents)",
    behavior: "Navigate to the customer account record in mySFS",
    verb: "Navigate",
    bloomLevel: "Apply",
    condition: "Given access to the mySFS system and a valid customer ID",
    criteria: "Within 60 seconds, locating the correct record on the first attempt",
    priority: "Must",
    requiresAssessment: true,
    rationale: "Core task required for all downstream lease maturity processes",
    linkedTaskId: "t1",
  },
  {
    id: "2",
    audience: "",
    behavior: "Determine the appropriate customer contact method based on account status",
    verb: "Determine",
    bloomLevel: "Analyze",
    condition: "Given a customer account with active lease maturity flags and contact history",
    criteria: "Selecting the correct contact method per the decision matrix with 95% accuracy",
    priority: "Should",
    requiresAssessment: true,
    rationale: "",
    linkedTaskId: "t3",
  },
  {
    id: "3",
    audience: "",
    behavior: "Process a customer payment using the Repay payment processor",
    verb: "Process",
    bloomLevel: "Apply",
    condition: "Given an authenticated customer session with a valid payment method on file",
    criteria: "Successfully completing the transaction with correct amount and confirmation number generated",
    priority: "Must",
    requiresAssessment: true,
    rationale: "",
    linkedTaskId: "t5",
  },
];

const SAMPLE_STAKEHOLDER_DATA = {
  projectContext: {
    title: "PROJECT CONTEXT",
    items: [
      { q: "What is the name of this project or initiative?", a: "Lease customer portal change to mySFS & payment processor update" },
      { q: "Who is the executive sponsor or leader requesting this training?", a: "Kelly Bennett, Sr. Product Manager, Digital" },
      { q: "What is your role in relation to this training project?", a: "Other (please describe in the next field)" },
      { q: "Please describe your role in this project.", a: "Test submitter" },
      { q: "What is the target date or deadline for this training to be available?", a: "5/20/2026" },
    ],
  },
  aboutTheSystem: {
    title: "ABOUT THE SYSTEM",
    items: [
      { q: "What system, software, or tool is being introduced?", a: "mySFS — the customer-facing portal where customers can access the details of their lease or loan with SFS." },
      { q: "What are the system's main functions or capabilities?", a: "New Customer Registration Process; Login and Forgot Password; View information on the dashboard; Make payments using ACH, Debit, ApplePay or GooglePay; Turn on/off autopay and paperless billing; Update contact information; Receive a payoff quote; View pending payments and transaction history; Access billing statements." },
    ],
  },
  audience: {
    title: "AUDIENCE & LEARNER PROFILE",
    items: [
      { q: "Who are the primary learners?", a: "CS Lease Support (45), Collections (60), Recovery (35), Lease Maturity (15), Payment Operations (25), Correspondence (20)" },
      { q: "What is their current skill level with the existing system?", a: "Intermediate to Advanced — most have 1+ years on defi CONNECT" },
      { q: "What technology comfort level do they have?", a: "High — daily system users, comfortable with web-based tools" },
    ],
  },
};

const SAMPLE_AI_REVIEW = {
  overall: "good",
  items: [
    { type: "success", text: "Observable action verb 'Navigate' — good. This is measurable." },
    { type: "warning", text: "Condition is well-stated but consider adding what resources are NOT available — can they use a job aid? This affects whether you're testing recall or recognition (Dirksen, 2016)." },
    { type: "suggestion", text: "The 60-second criterion is specific and measurable. Consider whether this is realistic for new agents vs. tenured — your audience data shows a mix of experience levels." },
  ],
};

// ─── Styles ──────────────────────────────────────────────────────────
const P = "#03428e";
const PL = "#e8eef7";
const BD = "#e2e8f0";
const TX = "#1e293b";
const TM = "#64748b";
const BG = "#f8fafc";
const W = "#ffffff";
const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Small Components ────────────────────────────────────────────────
function BloomBadge({ level, size = "sm" }) {
  const b = BLOOM_LEVELS.find((bl) => bl.level === level);
  if (!b) return null;
  const s = size === "sm" ? { fontSize: 11, padding: "2px 8px" } : { fontSize: 12, padding: "3px 10px" };
  return (
    <span style={{ display: "inline-block", ...s, fontWeight: 600, fontFamily: F, color: b.color, backgroundColor: b.bg, border: `1px solid ${b.border}`, borderRadius: 4, letterSpacing: 0.2 }}>
      {b.level}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITIES.find((pr) => pr.label === priority);
  if (!p) return null;
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, fontFamily: F, color: p.color, backgroundColor: p.bg, border: `1px solid ${p.color}22`, borderRadius: 4, padding: "1px 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {p.label}
    </span>
  );
}

function StakeholderDataButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", fontSize: 11, fontFamily: F, fontWeight: 500, color: P, backgroundColor: PL, border: `1px solid ${P}33`, borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}
    >
      <span style={{ fontSize: 13 }}>📋</span>
      {label || "Stakeholder Data"}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <label style={{ display: "block", fontFamily: F, fontSize: 11, fontWeight: 600, color: TM, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {children}
    </label>
  );
}

function CoachingNote({ children }) {
  return <div style={{ fontFamily: F, fontSize: 11, color: TM, fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>{children}</div>;
}

// ─── Stakeholder Data Slide-over ─────────────────────────────────────
function StakeholderSlideOver({ visible, onClose, section }) {
  if (!visible) return null;

  const sections = section ? [SAMPLE_STAKEHOLDER_DATA[section]].filter(Boolean) : Object.values(SAMPLE_STAKEHOLDER_DATA);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 520, backgroundColor: W, borderLeft: `1px solid ${BD}`, boxShadow: "-4px 0 20px rgba(0,0,0,0.1)", zIndex: 100, display: "flex", flexDirection: "column", fontFamily: F }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BD}` }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>Bill Roberts</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 8px", borderRadius: 4 }}>Approved</span>
            <span style={{ fontSize: 12, color: TM }}>New System</span>
            <span style={{ fontSize: 12, color: TM }}>Submitted Feb 24, 2026</span>
          </div>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: TM, padding: "4px 8px" }}>✕</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {sections.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TX, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${BD}` }}>
              {sec.title}
            </div>
            {sec.items.map((item, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: TM, marginBottom: 2, lineHeight: 1.4 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: TX, lineHeight: 1.5 }}>{item.a}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 20px", borderTop: `1px solid ${BD}`, backgroundColor: BG }}>
        <div style={{ fontSize: 10, color: TM, fontStyle: "italic" }}>From approved stakeholder submission — read only</div>
      </div>
    </div>
  );
}

// ─── AI Review Panel ─────────────────────────────────────────────────
function AIReviewPanel({ visible, review, onClose }) {
  if (!visible || !review) return null;

  const iconMap = { success: "✓", warning: "⚠", suggestion: "💡" };
  const colorMap = {
    success: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    warning: { color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
    suggestion: { color: P, bg: PL, border: `${P}33` },
  };

  return (
    <div style={{ margin: "0 20px 16px", padding: 14, backgroundColor: "#f8f9ff", border: `1px solid ${P}22`, borderRadius: 8, fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: P, textTransform: "uppercase", letterSpacing: 0.5 }}>
          🎓 AI Review
        </div>
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: TM }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {review.items.map((item, i) => {
          const c = colorMap[item.type];
          return (
            <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 12, color: TX, lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0, fontSize: 14 }}>{iconMap[item.type]}</span>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: TM, fontStyle: "italic" }}>
        AI reviews your objective against ABCD completeness, verb observability, and alignment with stakeholder data. It does not write objectives for you.
      </div>
    </div>
  );
}

// ─── ABCD Guidance (full width, collapsible) ─────────────────────────
function ABCDGuidance({ expanded, onToggle }) {
  return (
    <div style={{ backgroundColor: W, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 600, color: TX }}
      >
        <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: PL, color: P, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>i</span>
        Writing Effective Learning Objectives
        <span style={{ marginLeft: "auto", color: TM, fontSize: 16 }}>{expanded ? "∧" : "∨"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          <p style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: TX, margin: "0 0 6px" }}>Use the ABCD Format</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
            {[
              { label: "Audience", sub: "Who is the learner?", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Behavior", sub: "What will they do? (action verb)", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "Condition", sub: "Under what circumstances?", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Degree", sub: "How well? (criterion)", bg: "#f0fdf4", border: "#bbf7d0" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "8px 10px", backgroundColor: item.bg, border: `1px solid ${item.border}`, borderRadius: 6 }}>
                <div style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: TX }}>{item.label}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: TM, marginTop: 1 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: TX, margin: "0 0 6px" }}>Bloom's Taxonomy Levels</p>
          <div style={{ border: `1px solid ${BD}`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", padding: "6px 10px", backgroundColor: BG, borderBottom: `1px solid ${BD}` }}>
              {["Level", "Use when learners need to...", "Example verbs"].map((h) => (
                <span key={h} style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: TM, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>
            {BLOOM_LEVELS.map((b, i) => (
              <div key={b.level} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", padding: "5px 10px", borderBottom: i < BLOOM_LEVELS.length - 1 ? `1px solid ${BD}` : "none", alignItems: "center" }}>
                <BloomBadge level={b.level} />
                <span style={{ fontFamily: F, fontSize: 12, color: TX }}>{b.when}</span>
                <span style={{ fontFamily: F, fontSize: 12, color: TM }}>{b.verbs.slice(0, 3).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Verb Picker (compact) ───────────────────────────────────────────
function VerbPicker({ onSelect, selectedVerb }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ marginTop: 6 }}>
      <SectionLabel>Action Verb — click to select</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {BLOOM_LEVELS.map((b) => (
          <div key={b.level} style={{ position: "relative" }}>
            <button
              onClick={() => setExpanded(expanded === b.level ? null : b.level)}
              style={{ padding: "3px 8px", fontSize: 11, fontFamily: F, fontWeight: 500, color: b.color, backgroundColor: expanded === b.level ? b.bg : "transparent", border: `1px solid ${b.border}`, borderRadius: 4, cursor: "pointer" }}
            >
              {b.level} ▾
            </button>
            {expanded === b.level && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, backgroundColor: W, border: `1px solid ${BD}`, borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 6, zIndex: 20, display: "flex", flexWrap: "wrap", gap: 3, minWidth: 180 }}>
                {b.verbs.map((v) => (
                  <button
                    key={v}
                    onClick={() => { onSelect(v, b.level); setExpanded(null); }}
                    style={{ padding: "3px 8px", fontSize: 11, fontFamily: F, fontWeight: selectedVerb === v ? 700 : 400, color: selectedVerb === v ? W : b.color, backgroundColor: selectedVerb === v ? b.color : b.bg, border: `1px solid ${b.border}`, borderRadius: 4, cursor: "pointer" }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Objective Card ──────────────────────────────────────────────────
function ObjectiveCard({ obj, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ padding: "8px 12px", backgroundColor: isSelected ? PL : W, border: `1px solid ${isSelected ? P : BD}`, borderRadius: 6, cursor: "pointer", transition: "all 0.15s" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
        <PriorityBadge priority={obj.priority} />
        <BloomBadge level={obj.bloomLevel} />
        {obj.requiresAssessment && (
          <span style={{ fontSize: 10, color: "#0891b2", fontFamily: F, fontWeight: 500 }}>📋 Assess</span>
        )}
      </div>
      <div style={{ fontFamily: F, fontSize: 12, fontWeight: isSelected ? 600 : 400, color: TX, lineHeight: 1.4 }}>
        {obj.behavior}
      </div>
      {obj.linkedTaskId && (
        <div style={{ fontSize: 10, color: TM, marginTop: 3, fontFamily: F }}>
          ↳ {SAMPLE_TASKS_FROM_NA.find(t => t.id === obj.linkedTaskId)?.task}
        </div>
      )}
    </div>
  );
}

// ─── Composed Objective Banner ───────────────────────────────────────
function ComposedObjectiveBanner({ objective, courseAudiences }) {
  if (!objective) return null;
  const audience = objective.audience || courseAudiences[0] || "…";
  const hasAll = objective.condition && objective.behavior && objective.criteria;

  return (
    <div style={{ margin: "0 20px", padding: "14px 18px", backgroundColor: hasAll ? "#f0fdf4" : "#fffbeb", border: `1px solid ${hasAll ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F, color: hasAll ? "#16a34a" : "#ca8a04", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {hasAll ? "✓ Composed Objective" : "⟳ Building Objective..."}
        </div>
        {!hasAll && (
          <div style={{ fontSize: 10, fontFamily: F, color: "#ca8a04" }}>
            {[!objective.condition && "Condition", !objective.behavior && "Behavior", !objective.criteria && "Criteria"].filter(Boolean).join(", ")} needed
          </div>
        )}
      </div>
      <div style={{ fontFamily: F, fontSize: 14, color: TX, lineHeight: 1.7 }}>
        {objective.condition ? <span style={{ fontWeight: 500 }}>{objective.condition}, </span> : <span style={{ color: TM, fontStyle: "italic" }}>[Condition], </span>}
        <span style={{ color: P, fontStyle: "italic" }}>{audience}</span>
        <span> will </span>
        {objective.behavior ? <span style={{ fontWeight: 700 }}>{objective.behavior}</span> : <span style={{ color: TM, fontStyle: "italic" }}>[behavior]</span>}
        {objective.criteria ? <span style={{ color: TM }}> {objective.criteria}</span> : <span style={{ color: TM, fontStyle: "italic" }}> [criteria]</span>}
        <span>.</span>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────
export default function LearningObjectivesV2() {
  const [selectedId, setSelectedId] = useState("1");
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [objectives, setObjectives] = useState(SAMPLE_OBJECTIVES);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [slideOverSection, setSlideOverSection] = useState(null);
  const [aiReviewVisible, setAiReviewVisible] = useState(false);
  const [audienceMode, setAudienceMode] = useState("picklist"); // picklist | custom

  const selected = objectives.find((o) => o.id === selectedId);

  const handleFieldChange = (field, value) => {
    setObjectives((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, [field]: value } : o))
    );
  };

  const handleVerbSelect = (verb, bloomLevel) => {
    setObjectives((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, verb, bloomLevel } : o))
    );
  };

  const openSlideOver = (section) => {
    setSlideOverSection(section || null);
    setSlideOverOpen(true);
  };

  const inputStyle = { width: "100%", padding: "7px 10px", fontFamily: F, fontSize: 13, color: TX, border: `1px solid ${BD}`, borderRadius: 4, outline: "none", boxSizing: "border-box", lineHeight: 1.5 };
  const sectionGap = { marginBottom: 16 };

  return (
    <div style={{ fontFamily: F, height: "100vh", display: "flex", flexDirection: "column", backgroundColor: BG, color: TX }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", backgroundColor: W, borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 26, backgroundColor: P, borderRadius: 2 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TX, fontFamily: F }}>Learning Objectives</h1>
            <span style={{ fontSize: 11, color: TM }}>CRM Lease Maturity — Customer Portal Training</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: F, fontSize: 11, color: TM, padding: "3px 8px", backgroundColor: BG, borderRadius: 4 }}>
            {objectives.length} objectives
          </span>
          <button
            onClick={() => openSlideOver(null)}
            style={{ padding: "5px 10px", fontSize: 11, fontFamily: F, fontWeight: 500, color: P, backgroundColor: "transparent", border: `1px solid ${P}44`, borderRadius: 4, cursor: "pointer" }}
          >
            📋 Full Stakeholder Data
          </button>
          <button
            onClick={() => setAiReviewVisible(!aiReviewVisible)}
            style={{ padding: "5px 10px", fontSize: 11, fontFamily: F, fontWeight: 500, color: aiReviewVisible ? W : "#7c3aed", backgroundColor: aiReviewVisible ? "#7c3aed" : "transparent", border: `1px solid #7c3aed44`, borderRadius: 4, cursor: "pointer" }}
          >
            🎓 AI Review
          </button>
          <button style={{ padding: "5px 14px", fontSize: 12, fontFamily: F, fontWeight: 600, color: W, backgroundColor: P, border: "none", borderRadius: 4, cursor: "pointer" }}>
            Save
          </button>
        </div>
      </div>

      {/* ── Composed Objective (always visible) ── */}
      <div style={{ paddingTop: 12, paddingBottom: 4 }}>
        <ComposedObjectiveBanner objective={selected} courseAudiences={SAMPLE_AUDIENCES} />
      </div>

      {/* ── Guidance (full width, below composed) ── */}
      <div style={{ padding: "8px 20px 4px" }}>
        <ABCDGuidance expanded={guidanceOpen} onToggle={() => setGuidanceOpen(!guidanceOpen)} />
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Sidebar ── */}
        <div style={{ width: 320, borderRight: `1px solid ${BD}`, backgroundColor: BG, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ flex: 1, overflow: "auto", padding: "10px 12px" }}>

            {/* Tasks from NA */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <SectionLabel>Tasks from Needs Analysis</SectionLabel>
                <StakeholderDataButton onClick={() => openSlideOver("aboutTheSystem")} label="Source" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {SAMPLE_TASKS_FROM_NA.map((t) => {
                  const linked = objectives.some((o) => o.linkedTaskId === t.id);
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
                        backgroundColor: linked ? "#f0fdf4" : W,
                        border: `1px solid ${linked ? "#bbf7d0" : BD}`,
                        borderRadius: 4, fontSize: 12, fontFamily: F, color: TX,
                      }}
                    >
                      <span style={{ flexShrink: 0, width: 14, height: 14, borderRadius: 3, backgroundColor: linked ? "#16a34a" : "#e2e8f0", color: W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                        {linked ? "✓" : ""}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.3 }}>{t.task}</span>
                      <span style={{ fontSize: 9, color: TM, flexShrink: 0 }}>{t.source}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: TM, fontFamily: F, marginTop: 4, fontStyle: "italic" }}>
                {SAMPLE_TASKS_FROM_NA.filter(t => !objectives.some(o => o.linkedTaskId === t.id)).length} tasks without objectives
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${BD}`, margin: "4px 0 10px" }} />

            {/* Objective Cards */}
            <SectionLabel>Objectives ({objectives.length})</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
              {objectives.map((obj) => (
                <ObjectiveCard key={obj.id} obj={obj} isSelected={selectedId === obj.id} onClick={() => setSelectedId(obj.id)} />
              ))}
            </div>

            <button style={{ width: "100%", marginTop: 8, padding: "8px", fontFamily: F, fontSize: 12, fontWeight: 500, color: P, backgroundColor: "transparent", border: `1px dashed ${P}66`, borderRadius: 6, cursor: "pointer" }}>
              + Add Objective
            </button>
          </div>
        </div>

        {/* ── Center: Editor ── */}
        <div style={{ flex: 1, backgroundColor: W, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selected ? (
            <div style={{ flex: 1, overflow: "auto" }}>

              {/* AI Review */}
              {aiReviewVisible && <div style={{ paddingTop: 14 }}><AIReviewPanel visible={true} review={SAMPLE_AI_REVIEW} onClose={() => setAiReviewVisible(false)} /></div>}

              <div style={{ padding: "16px 20px" }}>

                {/* A — Audience */}
                <div style={sectionGap}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <SectionLabel>A — Audience</SectionLabel>
                    <StakeholderDataButton onClick={() => openSlideOver("audience")} label="Audience Data" />
                    {!selected.audience ? (
                      <span style={{ fontSize: 10, fontFamily: F, fontWeight: 500, color: P, backgroundColor: PL, padding: "1px 6px", borderRadius: 3 }}>From NA</span>
                    ) : (
                      <span style={{ fontSize: 10, fontFamily: F, fontWeight: 500, color: "#ca8a04", backgroundColor: "#fefce8", padding: "1px 6px", borderRadius: 3 }}>Custom</span>
                    )}
                  </div>
                  {SAMPLE_AUDIENCES.length > 1 ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select
                        value={selected.audience || SAMPLE_AUDIENCES[0]}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setAudienceMode("custom");
                            handleFieldChange("audience", "");
                          } else {
                            setAudienceMode("picklist");
                            handleFieldChange("audience", e.target.value);
                          }
                        }}
                        style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                      >
                        {SAMPLE_AUDIENCES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                        <option value="__custom__">Other — type custom audience</option>
                      </select>
                    </div>
                  ) : (
                    <input type="text" value={selected.audience || SAMPLE_AUDIENCES[0] || ""} onChange={(e) => handleFieldChange("audience", e.target.value)} style={inputStyle} />
                  )}
                  {audienceMode === "custom" && (
                    <input type="text" value={selected.audience} onChange={(e) => handleFieldChange("audience", e.target.value)} placeholder="Describe the specific audience for this objective..." style={{ ...inputStyle, marginTop: 6 }} />
                  )}
                  <CoachingNote>Auto-populated from Needs Analysis. Select a specific audience group or choose "Other" to customize.</CoachingNote>
                </div>

                {/* B — Behavior */}
                <div style={sectionGap}>
                  <SectionLabel>B — Behavior</SectionLabel>
                  <VerbPicker onSelect={handleVerbSelect} selectedVerb={selected.verb} />
                  <div style={{ marginTop: 8 }}>
                    <textarea rows={2} value={selected.behavior} onChange={(e) => handleFieldChange("behavior", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ fontFamily: F, fontSize: 11, color: TM }}>Bloom Level:</span>
                    <BloomBadge level={selected.bloomLevel} size="md" />
                  </div>
                  <CoachingNote>Start with an observable action verb. Avoid "understand" or "know" — use verbs that describe what the learner will visibly do.</CoachingNote>
                </div>

                {/* C — Condition */}
                <div style={sectionGap}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <SectionLabel>C — Condition</SectionLabel>
                    <StakeholderDataButton onClick={() => openSlideOver("aboutTheSystem")} label="System Info" />
                  </div>
                  <textarea rows={2} value={selected.condition} onChange={(e) => handleFieldChange("condition", e.target.value)} placeholder="Given access to…, After completing…, When presented with…" style={{ ...inputStyle, resize: "vertical" }} />
                  <CoachingNote>Describe the situation, tools, or constraints the learner faces when performing this behavior.</CoachingNote>
                </div>

                {/* D — Degree */}
                <div style={sectionGap}>
                  <SectionLabel>D — Degree / Criteria</SectionLabel>
                  <textarea rows={2} value={selected.criteria} onChange={(e) => handleFieldChange("criteria", e.target.value)} placeholder="With 100% accuracy…, Within 3 minutes…, According to the job aid…" style={{ ...inputStyle, resize: "vertical" }} />
                  <CoachingNote>What standard must be met? Time limits, accuracy rates, quality benchmarks.</CoachingNote>
                </div>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${BD}`, margin: "4px 0 14px" }} />

                {/* Priority + Assessment (inline, compact) */}
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", ...sectionGap }}>
                  <div style={{ flex: 1 }}>
                    <SectionLabel>Priority</SectionLabel>
                    <div style={{ display: "flex", gap: 4 }}>
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => handleFieldChange("priority", p.label)}
                          style={{
                            flex: 1, padding: "5px 6px", fontFamily: F, fontSize: 11, fontWeight: selected.priority === p.label ? 600 : 400,
                            color: selected.priority === p.label ? p.color : TM,
                            backgroundColor: selected.priority === p.label ? p.bg : "transparent",
                            border: `1px solid ${selected.priority === p.label ? p.color + "44" : BD}`,
                            borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <SectionLabel>Requires Assessment</SectionLabel>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[true, false].map((val) => (
                        <button
                          key={String(val)}
                          onClick={() => handleFieldChange("requiresAssessment", val)}
                          style={{
                            flex: 1, padding: "5px 8px", fontFamily: F, fontSize: 11, fontWeight: selected.requiresAssessment === val ? 600 : 400,
                            color: selected.requiresAssessment === val ? (val ? "#16a34a" : "#dc2626") : TM,
                            backgroundColor: selected.requiresAssessment === val ? (val ? "#f0fdf4" : "#fef2f2") : "transparent",
                            border: `1px solid ${selected.requiresAssessment === val ? (val ? "#bbf7d0" : "#fecaca") : BD}`,
                            borderRadius: 4, cursor: "pointer",
                          }}
                        >
                          {val ? "Yes" : "No"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div style={sectionGap}>
                  <SectionLabel>Rationale (optional)</SectionLabel>
                  <textarea rows={2} value={selected.rationale} onChange={(e) => handleFieldChange("rationale", e.target.value)} placeholder="Why this objective matters for the business goal or learner success…" style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: TM, fontSize: 14 }}>
              Select an objective to edit
            </div>
          )}
        </div>
      </div>

      {/* ── Stakeholder Slide-over ── */}
      <StakeholderSlideOver visible={slideOverOpen} onClose={() => setSlideOverOpen(false)} section={slideOverSection} />

      {/* Overlay when slide-over is open */}
      {slideOverOpen && (
        <div
          onClick={() => setSlideOverOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 520, bottom: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 99 }}
        />
      )}
    </div>
  );
}
