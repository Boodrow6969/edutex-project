import { useState } from "react";

// ============================================================
// EDUTex Analysis Tab v2 — ID Planning Workspace
// Uses mySFS portal project as realistic demo data
// ============================================================

const BRAND = {
  primary: "#03428e",
  primaryLight: "#e8eef6",
  primaryDark: "#022d61",
  accent: "#f59e0b",
  success: "#16a34a",
  warning: "#ea580c",
  danger: "#dc2626",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
};

// ============================================================
// MOCK DATA — mySFS Portal Project
// ============================================================

const mockStakeholderData = {
  projectName: "Lease Customer Portal Change to mySFS & Payment Processor Update",
  sponsor: "Kelly Bennett, Sr. Product Manager",
  department: "Digital",
  trainingType: "New System / Software Deployment",
  goLiveDate: "5/20/2026",
  submittedBy: "Kelly Bennett",
  submittedDate: "2/4/2026",
  systemName: "mySFS",
  systemPurpose:
    "mySFS is the customer facing portal where customers can access the details of their lease or loan with SFS.",
  replaces: "mySFS replaces the defi CONNECT portal. Repay payment processor replaces defi native ACH functionality.",
  connectedSystems: "defi Servicing, Repay, EDW, EDMS (doc repository)",
  businessProblem:
    "Customer satisfaction with defi CONNECT portal is low. Lack of payment options (only ACH today) and lack of visibility into their account. No end of lease information within the customer's current portal.",
  consequencesEmployee:
    "Increase in customer support calls if mySFS not meeting needs. Huge downstream impacts if Repay payment integration not working correctly.",
  consequencesCustomer:
    "Increased support calls, customer frustration, not making their payments.",
  successMeasures:
    "JD Power CSAT, autopay/paperless enrollment increases, reduction in call center volume, increase in vehicles returned on time.",
  rawTasks: {
    customer: [
      "Register as a user",
      "Login and Forgot Password",
      "View lease account information on Dashboard",
      "Make a payment (view/cancel pending, view history)",
      "Enroll or unenroll in autopay",
      "Enroll or unenroll in paperless billing",
      "Obtain a payoff quote",
      "Update email, mailing address, or phone numbers",
      "Report their end of lease intent",
      "Perform vehicle self-assessment",
    ],
    agent: [
      "Take customer payments within defi Servicing (via Repay)",
      "Setup customer for autopay within defi Servicing (via Repay)",
      "Unlock customer mySFS account (using login widget)",
      "Reset customer mySFS MFA preference (using login widget)",
      "Answer customer questions about mySFS portal",
    ],
  },
  audiences: [
    { role: "CS Lease Support (BPO)", count: "~65", frequency: "Daily" },
    { role: "Lease Maturity", count: "~66", frequency: "Daily" },
    { role: "Collections", count: "~66", frequency: "Daily" },
    { role: "Recovery", count: "?", frequency: "?" },
    { role: "CET team", count: "~12", frequency: "?" },
    { role: "Payment Operations", count: "?", frequency: "Daily" },
    { role: "Fraud", count: "?", frequency: "Occasionally" },
    { role: "Compliance", count: "?", frequency: "Occasionally" },
    { role: "Default Services", count: "?", frequency: "?" },
  ],
  roleDifferences:
    "All teams: payment training in defi Servicing + mySFS overview. CS Lease Support & Lease Maturity: deeper mySFS training + login widget.",
  techComfort: "Moderate - needs some guidance but adapts",
  existingSystemExp: "All agents use defi Servicing since 2023",
  changeChampions: "Danny Rodriguez, Robert (TBD)",
  postGoLiveSupport:
    "IVR option routed to Lease Maturity team internally. BPO agents may also receive these calls.",
  rollout: "Big bang (communication to customers may be phased)",
  trainingTiming: "1 week before go-live",
  formatPreferences:
    "Job aids for BPO agents, live training for Lease Maturity, eLearning for other SFS teams",
  sandboxAvailable: "Yes, expected 3/19/2026 (UAT environment)",
  existingDocs:
    "Documentation for mySFS exists but needs updating with new look/feel for retail and lease additions",
  smes: [
    { name: "Kelly Bennett", role: "Product Manager", contact: "Email, Teams" },
    {
      name: "Danny Rodriguez",
      role: "Director, Lease Maturity",
      contact: "Email, Teams",
    },
  ],
  constraints:
    "Cannot release at month-end, month-start, or busy payment days (15th) or weekends. Need to incorporate defi Servicing payment training. Deliver materials to BPO for their agents.",
  stakeholderConcerns:
    "Scope of training across many teams. Incorporating defi Servicing payment training. Ensuring BPO receives materials.",
  successVision:
    "Business stakeholders feel their teams are prepared and are not concerned about team knowledge.",
};

// ============================================================
// SECTION 1: PROJECT OVERVIEW
// ============================================================

function ProjectOverview({ data }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: BRAND.primary }}
          >
            1
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-gray-900">
              Project Overview
            </h2>
            <p className="text-xs text-gray-500">{data.projectName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            {data.trainingType}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InfoField label="Project Name" value={data.projectName} />
            <InfoField label="Sponsor" value={data.sponsor} />
            <InfoField label="Department" value={data.department} />
            <InfoField label="Go-Live Date" value={data.goLiveDate} />
            <InfoField label="System" value={data.systemName} />
            <InfoField
              label="Replaces"
              value={data.replaces}
            />
            <InfoField
              label="Connected Systems"
              value={data.connectedSystems}
            />
            <InfoField label="Submitted By" value={`${data.submittedBy} on ${data.submittedDate}`} />
          </div>
          <div className="mt-4">
            <InfoField label="System Purpose" value={data.systemPurpose} />
          </div>

          {/* Stakeholder source badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data from stakeholder submission by {data.submittedBy}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

// ============================================================
// SECTION 2: AUDIENCE PROFILES
// ============================================================

const DELIVERY_OPTIONS = [
  "eLearning",
  "vILT",
  "ILT",
  "Job Aid",
  "Video",
  "OJT/Coaching",
];

const TECH_COMFORT = ["Low", "Moderate", "High"];

const defaultAudience = {
  id: "",
  roleName: "",
  headcount: "",
  frequency: "",
  techComfort: "Moderate",
  priorExperience: "",
  whatsDifferent: "",
  deliveryFormat: [],
  notes: "",
};

function AudienceProfiles({ stakeholderData }) {
  const [audiences, setAudiences] = useState([
    {
      id: "aud-1",
      roleName: "CS Lease Support (BPO)",
      headcount: "~65",
      frequency: "Daily",
      techComfort: "Moderate",
      priorExperience: "defi Servicing since 2023, defi CONNECT portal",
      whatsDifferent: "New payment processor (Repay), new portal UI, login widget for customer support",
      deliveryFormat: ["Job Aid", "eLearning"],
      notes: "BPO team — materials must be delivered to BPO for their own agent training. They handle overflow portal calls.",
    },
    {
      id: "aud-2",
      roleName: "Lease Maturity",
      headcount: "~66",
      frequency: "Daily",
      techComfort: "Moderate",
      priorExperience: "defi Servicing since 2023",
      whatsDifferent: "Primary team for portal support calls via IVR routing. Need deep mySFS knowledge + login widget + Repay payments",
      deliveryFormat: ["vILT", "Job Aid"],
      notes: "Designated as first-line portal support via IVR. Need deepest training on mySFS customer experience.",
    },
    {
      id: "aud-3",
      roleName: "All Other SFS Teams",
      headcount: "~150+",
      frequency: "Daily to Occasionally",
      techComfort: "Moderate",
      priorExperience: "defi Servicing since 2023",
      whatsDifferent: "Repay payment processing in defi Servicing. General awareness of mySFS for customer conversations.",
      deliveryFormat: ["eLearning"],
      notes: "Collections, Recovery, CET, Payment Ops, Fraud, Compliance, Default Services. Consolidated into one track — primarily payment training + portal overview.",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  const addAudience = () => {
    const newAud = {
      ...defaultAudience,
      id: `aud-${Date.now()}`,
    };
    setAudiences([...audiences, newAud]);
    setEditingId(newAud.id);
  };

  const updateAudience = (id, updates) => {
    setAudiences(
      audiences.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const removeAudience = (id) => {
    setAudiences(audiences.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleDelivery = (id, format) => {
    const aud = audiences.find((a) => a.id === id);
    const newFormats = aud.deliveryFormat.includes(format)
      ? aud.deliveryFormat.filter((f) => f !== format)
      : [...aud.deliveryFormat, format];
    updateAudience(id, { deliveryFormat: newFormats });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: BRAND.primary }}
          >
            2
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Audience Profiles
            </h2>
            <p className="text-xs text-gray-500">
              {audiences.length} audience{audiences.length !== 1 ? "s" : ""}{" "}
              defined — who needs training and what's different for each group
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStakeholderRef(!showStakeholderRef)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Stakeholder Data
          </button>
          <button
            onClick={addAudience}
            className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors flex items-center gap-1"
            style={{ backgroundColor: BRAND.primary }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Audience
          </button>
        </div>
      </div>

      {/* Stakeholder reference panel */}
      {showStakeholderRef && (
        <div className="mx-5 mb-4 p-4 rounded-lg border border-blue-200" style={{ backgroundColor: "#f0f5fb" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Stakeholder Data — Audience Info
            </span>
            <button onClick={() => setShowStakeholderRef(false)} className="text-blue-400 hover:text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Roles listed by stakeholder:</span>
              <div className="mt-1 space-y-1">
                {stakeholderData.audiences.map((a, i) => (
                  <div key={i} className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {a.role} — {a.count} — {a.frequency}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Role differences:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.roleDifferences}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tech comfort:</span>
              <span className="text-xs text-gray-600 ml-1">{stakeholderData.techComfort}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Prior system experience:</span>
              <span className="text-xs text-gray-600 ml-1">{stakeholderData.existingSystemExp}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Change Champions:</span>
              <span className="text-xs text-gray-600 ml-1">{stakeholderData.changeChampions}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Format preferences:</span>
              <span className="text-xs text-gray-600 ml-1">{stakeholderData.formatPreferences}</span>
            </div>
          </div>
        </div>
      )}

      {/* Audience cards */}
      <div className="px-5 pb-5 space-y-3">
        {audiences.map((aud) => (
          <AudienceCard
            key={aud.id}
            audience={aud}
            isEditing={editingId === aud.id}
            onEdit={() => setEditingId(editingId === aud.id ? null : aud.id)}
            onUpdate={(updates) => updateAudience(aud.id, updates)}
            onRemove={() => removeAudience(aud.id)}
            onToggleDelivery={(format) => toggleDelivery(aud.id, format)}
          />
        ))}
        {audiences.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No audiences defined yet. Click "Add Audience" to start.
          </div>
        )}
      </div>
    </div>
  );
}

function AudienceCard({
  audience,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  onToggleDelivery,
}) {
  return (
    <div
      className={`border rounded-lg transition-all ${isEditing ? "border-blue-300 shadow-sm" : "border-gray-200"}`}
    >
      {/* Summary row — always visible */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onEdit}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {audience.roleName || "Untitled Audience"}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {audience.headcount && <span>{audience.headcount} people</span>}
              {audience.frequency && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{audience.frequency}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delivery format pills */}
        <div className="flex items-center gap-1.5 mr-3">
          {audience.deliveryFormat.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor:
                  f === "vILT" || f === "ILT"
                    ? "#dcfce7"
                    : f === "Job Aid"
                      ? "#fef3c7"
                      : f === "eLearning"
                        ? "#dbeafe"
                        : "#f3e8ff",
                color:
                  f === "vILT" || f === "ILT"
                    ? "#166534"
                    : f === "Job Aid"
                      ? "#92400e"
                      : f === "eLearning"
                        ? "#1e40af"
                        : "#6b21a8",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isEditing ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded edit form */}
      {isEditing && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Role / Group Name *
              </label>
              <input
                type="text"
                value={audience.roleName}
                onChange={(e) => onUpdate({ roleName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., CS Lease Support (BPO)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Headcount
              </label>
              <input
                type="text"
                value={audience.headcount}
                onChange={(e) => onUpdate({ headcount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., ~65"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Frequency of Use
              </label>
              <input
                type="text"
                value={audience.frequency}
                onChange={(e) => onUpdate({ frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Daily"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tech Comfort
            </label>
            <div className="flex gap-2">
              {TECH_COMFORT.map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdate({ techComfort: level })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    audience.techComfort === level
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Prior Experience
            </label>
            <input
              type="text"
              value={audience.priorExperience}
              onChange={(e) => onUpdate({ priorExperience: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="What systems/processes do they already know?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              What's Different for This Group
            </label>
            <textarea
              value={audience.whatsDifferent}
              onChange={(e) => onUpdate({ whatsDifferent: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="What changes specifically for this audience?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Delivery Format
            </label>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_OPTIONS.map((format) => (
                <button
                  key={format}
                  onClick={() => onToggleDelivery(format)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    audience.deliveryFormat.includes(format)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              value={audience.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="Additional context about this audience..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onRemove()}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Remove audience
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SECTION 3: TASKS & COMPETENCIES
// ============================================================

const INTERVENTION_TYPES = [
  { value: "training", label: "Training", color: "#dbeafe", textColor: "#1e40af" },
  { value: "job-aid", label: "Job Aid", color: "#fef3c7", textColor: "#92400e" },
  { value: "awareness", label: "Awareness", color: "#f3e8ff", textColor: "#6b21a8" },
  { value: "not-training", label: "Not Training", color: "#fee2e2", textColor: "#991b1b" },
  { value: "existing", label: "Already Known", color: "#f3f4f6", textColor: "#374151" },
];

const COMPLEXITY = [
  { value: "low", label: "Low", color: "#86efac" },
  { value: "medium", label: "Med", color: "#fde047" },
  { value: "high", label: "High", color: "#fca5a5" },
];

function TasksCompetencies({ stakeholderData, audiences }) {
  const [tasks, setTasks] = useState([
    {
      id: "t-1",
      description: "Take customer payments within defi Servicing (via Repay)",
      source: "agent",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity", "All Other SFS Teams"],
      intervention: "training",
      complexity: "high",
      priority: true,
      notes: "New payment processor — completely different workflow from current ACH process. High-stakes: payment errors have major downstream impacts.",
    },
    {
      id: "t-2",
      description: "Setup customer for autopay within defi Servicing (via Repay)",
      source: "agent",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity", "All Other SFS Teams"],
      intervention: "training",
      complexity: "medium",
      priority: false,
      notes: "",
    },
    {
      id: "t-3",
      description: "Unlock customer mySFS account (using login widget)",
      source: "agent",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity"],
      intervention: "training",
      complexity: "low",
      priority: false,
      notes: "New tool. CS Lease Support & Lease Maturity only per stakeholder.",
    },
    {
      id: "t-4",
      description: "Reset customer mySFS MFA preference (using login widget)",
      source: "agent",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity"],
      intervention: "job-aid",
      complexity: "low",
      priority: false,
      notes: "Straightforward procedure — job aid is sufficient.",
    },
    {
      id: "t-5",
      description: "Answer customer questions about mySFS portal functionality",
      source: "agent",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity"],
      intervention: "training",
      complexity: "medium",
      priority: true,
      notes: "Requires understanding the customer experience end-to-end: registration, payments, autopay, paperless, payoff quotes, end-of-lease features.",
    },
    {
      id: "t-6",
      description: "Navigate customer through mySFS registration process",
      source: "ID-identified",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity"],
      intervention: "training",
      complexity: "medium",
      priority: true,
      notes: "ID added: Not in original stakeholder list but implied by 'answer customer questions.' Agents need to walk customers through registration on the phone.",
    },
    {
      id: "t-7",
      description: "Troubleshoot common mySFS payment errors",
      source: "ID-identified",
      audiences: ["CS Lease Support (BPO)", "Lease Maturity"],
      intervention: "training",
      complexity: "high",
      priority: true,
      notes: "ID added: Stakeholder flagged payment issues as highest-stakes scenario. Agents need escalation path knowledge.",
    },
    {
      id: "t-8",
      description: "General awareness of mySFS portal features and capabilities",
      source: "agent",
      audiences: ["All Other SFS Teams"],
      intervention: "awareness",
      complexity: "low",
      priority: false,
      notes: "For teams that don't directly support portal customers but may encounter questions. Overview-level only.",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);
  const [filterIntervention, setFilterIntervention] = useState(null);

  const addTask = () => {
    const newTask = {
      id: `t-${Date.now()}`,
      description: "",
      source: "ID-identified",
      audiences: [],
      intervention: "training",
      complexity: "medium",
      priority: false,
      notes: "",
    };
    setTasks([...tasks, newTask]);
    setEditingId(newTask.id);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleAudience = (taskId, audName) => {
    const task = tasks.find((t) => t.id === taskId);
    const newAuds = task.audiences.includes(audName)
      ? task.audiences.filter((a) => a !== audName)
      : [...task.audiences, audName];
    updateTask(taskId, { audiences: newAuds });
  };

  const filteredTasks = filterIntervention
    ? tasks.filter((t) => t.intervention === filterIntervention)
    : tasks;

  const trainingCount = tasks.filter((t) => t.intervention === "training").length;
  const jobAidCount = tasks.filter((t) => t.intervention === "job-aid").length;
  const awarenessCount = tasks.filter((t) => t.intervention === "awareness").length;

  const audienceNames = audiences.map((a) => a.roleName).filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: BRAND.primary }}
            >
              3
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Tasks & Competencies
              </h2>
              <p className="text-xs text-gray-500">
                {tasks.length} items — Tag each task with audience, intervention type, and complexity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStakeholderRef(!showStakeholderRef)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Stakeholder Data
            </button>
            <button
              onClick={addTask}
              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors flex items-center gap-1"
              style={{ backgroundColor: BRAND.primary }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setFilterIntervention(null)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${!filterIntervention ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === "training" ? null : "training")}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === "training" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
          >
            Training ({trainingCount})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === "job-aid" ? null : "job-aid")}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === "job-aid" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
          >
            Job Aid ({jobAidCount})
          </button>
          <button
            onClick={() => setFilterIntervention(filterIntervention === "awareness" ? null : "awareness")}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterIntervention === "awareness" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
          >
            Awareness ({awarenessCount})
          </button>
        </div>
      </div>

      {/* Stakeholder reference */}
      {showStakeholderRef && (
        <div className="mx-5 mb-4 p-4 rounded-lg border border-blue-200" style={{ backgroundColor: "#f0f5fb" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Stakeholder Data — Tasks Listed
            </span>
            <button onClick={() => setShowStakeholderRef(false)} className="text-blue-400 hover:text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 text-xs">Customer Tasks:</span>
              <div className="mt-1 space-y-0.5">
                {stakeholderData.rawTasks.customer.map((t, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Agent Tasks:</span>
              <div className="mt-1 space-y-0.5">
                {stakeholderData.rawTasks.agent.map((t, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <span className="font-medium text-gray-700 text-xs">High-stakes scenarios:</span>
            <p className="text-xs text-gray-600 mt-0.5">
              Anything related to acceptance of payments from mySFS or defi Servicing. Errors in payment posting or unclear status could result in duplicate payments and major dissatisfaction.
            </p>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="px-5 pb-5 space-y-2">
        {filteredTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isEditing={editingId === task.id}
            onEdit={() =>
              setEditingId(editingId === task.id ? null : task.id)
            }
            onUpdate={(updates) => updateTask(task.id, updates)}
            onRemove={() => removeTask(task.id)}
            audienceNames={audienceNames}
            onToggleAudience={(name) => toggleAudience(task.id, name)}
          />
        ))}
        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No tasks match the current filter.
          </div>
        )}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No tasks defined yet. Click "Add Task" or import from stakeholder data.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  audienceNames,
  onToggleAudience,
}) {
  const intervention = INTERVENTION_TYPES.find(
    (i) => i.value === task.intervention
  );
  const complexity = COMPLEXITY.find((c) => c.value === task.complexity);

  return (
    <div
      className={`border rounded-lg transition-all ${isEditing ? "border-blue-300 shadow-sm" : "border-gray-200"}`}
    >
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onEdit}
      >
        {/* Priority indicator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ priority: !task.priority });
          }}
          className={`flex-shrink-0 ${task.priority ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
          title={task.priority ? "High priority" : "Mark as priority"}
        >
          <svg className="w-4 h-4" fill={task.priority ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Task description */}
        <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
          {task.description || "Untitled task"}
        </span>

        {/* Source badge */}
        {task.source === "ID-identified" && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 flex-shrink-0 font-medium">
            ID
          </span>
        )}

        {/* Complexity dot */}
        {complexity && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: complexity.color }}
            title={`Complexity: ${complexity.label}`}
          />
        )}

        {/* Intervention badge */}
        {intervention && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: intervention.color,
              color: intervention.textColor,
            }}
          >
            {intervention.label}
          </span>
        )}

        {/* Audience count */}
        <span className="text-xs text-gray-400 flex-shrink-0">
          {task.audiences.length} aud.
        </span>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isEditing ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded edit */}
      {isEditing && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Task Description *
            </label>
            <textarea
              value={task.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="What does the learner need to be able to do?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Intervention Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTERVENTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onUpdate({ intervention: type.value })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      task.intervention === type.value
                        ? "border-gray-400 font-medium"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    style={
                      task.intervention === type.value
                        ? { backgroundColor: type.color, color: type.textColor }
                        : {}
                    }
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Complexity
              </label>
              <div className="flex gap-1.5">
                {COMPLEXITY.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onUpdate({ complexity: c.value })}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                      task.complexity === c.value
                        ? "border-gray-400 font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    style={
                      task.complexity === c.value
                        ? { backgroundColor: c.color }
                        : {}
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Applies To (Audiences)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {audienceNames.map((name) => (
                <button
                  key={name}
                  onClick={() => onToggleAudience(name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    task.audiences.includes(name)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {name}
                </button>
              ))}
              {audienceNames.length === 0 && (
                <span className="text-xs text-gray-400">
                  Define audiences in Section 2 first
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ID Notes
            </label>
            <textarea
              value={task.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              placeholder="Design rationale, stakeholder context, risk notes..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Remove task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SECTION 4: TRAINING DECISION & CONSTRAINTS
// ============================================================

function TrainingDecisionAndConstraints({ stakeholderData }) {
  const [isTrainingSolution, setIsTrainingSolution] = useState("yes");
  const [solutionRationale, setSolutionRationale] = useState(
    "Training is appropriate for the skill/knowledge gaps: agents have never used Repay for payments, and mySFS is a new portal replacing defi CONNECT. However, post-go-live support structure (IVR routing, Change Champions) and job aids are critical complements."
  );
  const [nonTrainingFactors, setNonTrainingFactors] = useState(
    "1. Repay integration stability — if the payment processor has bugs, no amount of training fixes that.\n2. mySFS portal UX — if the interface is confusing for customers, call volume increases regardless.\n3. IVR routing setup — support calls need to reach trained agents, not get lost in general queue."
  );
  const [constraints, setConstraints] = useState([
    "Cannot release at month-end, month-start, busy payment days (15th), or weekends",
    "BPO team needs materials delivered separately — they train their own agents",
    "Sandbox not available until 3/19/2026 — compressed timeline for content capture",
    "Must incorporate defi Servicing payment training (Repay) from vendor/defi team",
    "Training must complete 1 week before 5/20 go-live",
  ]);
  const [assumptions, setAssumptions] = useState([
    "UAT environment will be representative of production UI",
    "Repay payment flow in defi Servicing will be finalized before training development starts",
    "Danny/Robert will be available as Change Champions for Lease Maturity team",
  ]);
  const [newConstraint, setNewConstraint] = useState("");
  const [newAssumption, setNewAssumption] = useState("");
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: BRAND.primary }}
          >
            4
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Training Decision & Constraints
            </h2>
            <p className="text-xs text-gray-500">
              Is training the right solution? What shapes the design?
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowStakeholderRef(!showStakeholderRef)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Stakeholder Data
        </button>
      </div>

      {/* Stakeholder reference */}
      {showStakeholderRef && (
        <div className="mx-5 mb-4 p-4 rounded-lg border border-blue-200" style={{ backgroundColor: "#f0f5fb" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Stakeholder Data — Context
            </span>
            <button onClick={() => setShowStakeholderRef(false)} className="text-blue-400 hover:text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 text-xs">Business Problem:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.businessProblem}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Consequences (Employee):</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.consequencesEmployee}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Consequences (Customer):</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.consequencesCustomer}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Constraints:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.constraints}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Stakeholder Concerns:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.stakeholderConcerns}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Existing Materials:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.existingDocs}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Sandbox:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.sandboxAvailable}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-5 space-y-6">
        {/* Training decision toggle */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Is training the right solution?
          </label>
          <div className="flex gap-2">
            {[
              { value: "yes", label: "Yes", desc: "Training is appropriate" },
              {
                value: "partial",
                label: "Partially",
                desc: "Training is part of the solution",
              },
              { value: "no", label: "No", desc: "Not a training problem" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIsTrainingSolution(opt.value)}
                className={`flex-1 text-left px-4 py-3 rounded-lg border transition-colors ${
                  isTrainingSolution === opt.value
                    ? opt.value === "yes"
                      ? "border-green-500 bg-green-50"
                      : opt.value === "partial"
                        ? "border-amber-500 bg-amber-50"
                        : "border-red-500 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rationale */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Solution Rationale
          </label>
          <textarea
            value={solutionRationale}
            onChange={(e) => setSolutionRationale(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            rows={3}
            placeholder="Why is training appropriate (or not)? What's the training-as-%-of-solution estimate?"
          />
        </div>

        {/* Non-training factors */}
        {(isTrainingSolution === "partial" || isTrainingSolution === "no") && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Non-Training Factors
            </label>
            <textarea
              value={nonTrainingFactors}
              onChange={(e) => setNonTrainingFactors(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="What factors outside of training need to be addressed?"
            />
          </div>
        )}

        {/* Constraints */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Constraints
          </label>
          <div className="space-y-1.5 mb-2">
            {constraints.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-gray-700 flex-1">{c}</span>
                <button
                  onClick={() =>
                    setConstraints(constraints.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-300 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newConstraint.trim()) {
                  setConstraints([...constraints, newConstraint.trim()]);
                  setNewConstraint("");
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Add a constraint..."
            />
          </div>
        </div>

        {/* Assumptions */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Assumptions
          </label>
          <div className="space-y-1.5 mb-2">
            {assumptions.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700 flex-1">{a}</span>
                <button
                  onClick={() =>
                    setAssumptions(assumptions.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-300 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAssumption.trim()) {
                  setAssumptions([...assumptions, newAssumption.trim()]);
                  setNewAssumption("");
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Add an assumption..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 5: SUCCESS CRITERIA
// ============================================================

function SuccessCriteria({ stakeholderData }) {
  const [level1, setLevel1] = useState("Post-training survey targeting 4.0+ average. Specific focus on confidence with Repay payment process.");
  const [level2, setLevel2] = useState("Agents demonstrate ability to process a payment in defi Servicing via Repay in sandbox assessment. Lease Maturity agents pass mySFS customer-scenario knowledge check at 80%+.");
  const [level3, setLevel3] = useState("Within 30 days post-launch: agents take payments in defi without escalation. Lease Maturity resolves mySFS portal inquiries on first call.");
  const [level4, setLevel4] = useState("JD Power CSAT improvement. Reduction in call center volume for portal-related issues. Autopay/paperless enrollment rates increase. Vehicles returned on time.");
  const [showStakeholderRef, setShowStakeholderRef] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: BRAND.primary }}
          >
            5
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Success Criteria
            </h2>
            <p className="text-xs text-gray-500">
              Map stakeholder success measures to Kirkpatrick evaluation levels
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowStakeholderRef(!showStakeholderRef)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Stakeholder Data
        </button>
      </div>

      {showStakeholderRef && (
        <div className="mx-5 mb-4 p-4 rounded-lg border border-blue-200" style={{ backgroundColor: "#f0f5fb" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Stakeholder Data — Success Measures
            </span>
            <button onClick={() => setShowStakeholderRef(false)} className="text-blue-400 hover:text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 text-xs">How they'll measure success:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.successMeasures}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Acceptable performance at launch:</span>
              <p className="text-xs text-gray-600 mt-0.5">Agents can take payments in defi Servicing. Can assist with mySFS lock issues. Are knowledgeable about mySFS functionality.</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Proficient after 30 days:</span>
              <p className="text-xs text-gray-600 mt-0.5">Taking payments without challenges. Assisting customers with mySFS questions with ease.</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 text-xs">Stakeholder's success vision:</span>
              <p className="text-xs text-gray-600 mt-0.5">{stakeholderData.successVision}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-5 space-y-4">
        {[
          {
            level: "Level 1: Reaction",
            desc: "How will you measure learner satisfaction and engagement?",
            value: level1,
            setter: setLevel1,
            color: "#dbeafe",
            borderColor: "#93c5fd",
          },
          {
            level: "Level 2: Learning",
            desc: "How will you verify knowledge/skill acquisition?",
            value: level2,
            setter: setLevel2,
            color: "#dcfce7",
            borderColor: "#86efac",
          },
          {
            level: "Level 3: Behavior",
            desc: "How will you confirm on-the-job application?",
            value: level3,
            setter: setLevel3,
            color: "#fef3c7",
            borderColor: "#fde047",
          },
          {
            level: "Level 4: Results",
            desc: "What business metrics should move?",
            value: level4,
            setter: setLevel4,
            color: "#fce7f3",
            borderColor: "#f9a8d4",
          },
        ].map((item) => (
          <div
            key={item.level}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: item.color,
              borderColor: item.borderColor,
            }}
          >
            <label className="block text-sm font-semibold text-gray-900 mb-0.5">
              {item.level}
            </label>
            <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
            <textarea
              value={item.value}
              onChange={(e) => item.setter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AnalysisTabV2() {
  const [audiences] = useState([
    { roleName: "CS Lease Support (BPO)" },
    { roleName: "Lease Maturity" },
    { roleName: "All Other SFS Teams" },
  ]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: BRAND.gray100 }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer">Workspace</span>
          <span>/</span>
          <span className="hover:text-blue-600 cursor-pointer">Course</span>
          <span>/</span>
          <span className="text-gray-900">Needs Analysis</span>
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
            Needs Analysis
          </span>
        </nav>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex gap-1 px-6">
          <button className="px-4 py-2 text-sm font-medium text-blue-700 relative">
            Analysis
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: BRAND.primary }}
            />
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Stakeholders
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Objectives
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <ProjectOverview data={mockStakeholderData} />
        <AudienceProfiles stakeholderData={mockStakeholderData} />
        <TasksCompetencies
          stakeholderData={mockStakeholderData}
          audiences={audiences}
        />
        <TrainingDecisionAndConstraints
          stakeholderData={mockStakeholderData}
        />
        <SuccessCriteria stakeholderData={mockStakeholderData} />
      </div>
    </div>
  );
}
