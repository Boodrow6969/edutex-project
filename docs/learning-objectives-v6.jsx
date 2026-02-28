import { useState, useMemo, useEffect } from "react";

const P="#03428e",PL="#e8eef7",BD="#e2e8f0",TX="#1e293b",TM="#64748b",BG="#f8fafc",W="#ffffff";
const F="'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif";

const BLOOM=[
  {level:"Remember",color:"#6b7280",bg:"#f3f4f6",border:"#d1d5db",fill:"#94a3b8",verbs:["List","Define","Identify","Name","Recall","Recognize","State","Match"]},
  {level:"Understand",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe",fill:"#60a5fa",verbs:["Describe","Summarize","Explain","Paraphrase","Classify","Discuss","Interpret"]},
  {level:"Apply",color:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0",fill:"#4ade80",verbs:["Demonstrate","Execute","Implement","Solve","Use","Operate","Complete"]},
  {level:"Analyze",color:"#ca8a04",bg:"#fefce8",border:"#fef08a",fill:"#facc15",verbs:["Compare","Contrast","Examine","Differentiate","Categorize","Distinguish","Determine"]},
  {level:"Evaluate",color:"#ea580c",bg:"#fff7ed",border:"#fed7aa",fill:"#fb923c",verbs:["Justify","Critique","Assess","Judge","Defend","Prioritize","Recommend"]},
  {level:"Create",color:"#9333ea",bg:"#faf5ff",border:"#e9d5ff",fill:"#a855f7",verbs:["Design","Develop","Construct","Compose","Formulate","Generate","Plan"]},
];
const BK=["Factual","Conceptual","Procedural","Metacognitive"];
const B2V={"Remember-Factual":["list","identify","recall","name"],"Remember-Conceptual":["classify","categorize"],"Remember-Procedural":["recall steps","identify sequence"],"Remember-Metacognitive":["identify strategy"],"Understand-Factual":["describe","paraphrase","summarize"],"Understand-Conceptual":["explain","interpret","compare"],"Understand-Procedural":["clarify steps","explain process"],"Understand-Metacognitive":["explain strategy"],"Apply-Factual":["respond","provide","label"],"Apply-Conceptual":["implement","carry out","use"],"Apply-Procedural":["execute","perform","complete","demonstrate"],"Apply-Metacognitive":["apply strategy"],"Analyze-Factual":["differentiate","distinguish","select"],"Analyze-Conceptual":["organize","attribute","compare"],"Analyze-Procedural":["integrate","deconstruct","troubleshoot"],"Analyze-Metacognitive":["assess own approach"],"Evaluate-Factual":["check","verify","detect"],"Evaluate-Conceptual":["critique","judge","justify"],"Evaluate-Procedural":["test","monitor","evaluate"],"Evaluate-Metacognitive":["reflect","self-assess"],"Create-Factual":["generate","compile","assemble"],"Create-Conceptual":["design","construct","plan"],"Create-Procedural":["develop procedure","devise","produce"],"Create-Metacognitive":["create strategy"]};
const PRI=[{label:"Must",color:"#dc2626",bg:"#fef2f2",dot:"🔴"},{label:"Should",color:"#ca8a04",bg:"#fefce8",dot:"🟡"},{label:"Nice to Have",color:"#6b7280",bg:"#f9fafb",dot:"🟢"}];
const AUD=["CS Lease Support (BPO) (~65 agents)","Lease Maturity (~66 agents)","Collections (~66 agents)","Payment Operations (TBD)"];
const NA_TASKS=[
  {id:"t1",task:"Navigate the mySFS portal and locate account information",source:"Stakeholder"},
  {id:"t2",task:"Use the login widget to authenticate customers",source:"Stakeholder"},
  {id:"t3",task:"Process payments through Repay in defi Servicing",source:"Stakeholder"},
  {id:"t4",task:"Handle IVR calls from customers with portal questions",source:"ID Analysis"},
  {id:"t5",task:"Troubleshoot common mySFS login errors",source:"ID Analysis"},
  {id:"t6",task:"Explain payment processing timeline to customers",source:"Stakeholder"},
  {id:"t7",task:"Escalate unresolved portal issues per SLA guidelines",source:"ID Analysis"},
];
const INIT_OBJ=[
  {id:"1",audience:"CS Lease Support (BPO) (~65 agents)",behavior:"Navigate to the customer account record in mySFS",verb:"Navigate",bloomLevel:"Apply",bloomKnowledge:"Procedural",condition:"Given access to the mySFS system and a valid customer ID",criteria:"Within 60 seconds, locating the correct record on the first attempt",priority:"Must",requiresAssessment:true,rationale:"Core task for all downstream processes",wiifm:"This is what you'll do every call — speed here means shorter hold times.",linkedTaskId:"t1",freeformText:""},
  {id:"2",audience:"",behavior:"Authenticate customers using the login widget",verb:"Authenticate",bloomLevel:"Apply",bloomKnowledge:"Procedural",condition:"When a customer calls with a portal access issue",criteria:"Following the 4-step verification process without error",priority:"Must",requiresAssessment:true,rationale:"Security-critical",wiifm:"Protects both the customer and you.",linkedTaskId:"t2",freeformText:""},
  {id:"3",audience:"",behavior:"Troubleshoot common mySFS login errors using the guide",verb:"Troubleshoot",bloomLevel:"Analyze",bloomKnowledge:"Procedural",condition:"",criteria:"",priority:"Should",requiresAssessment:false,rationale:"",wiifm:"",linkedTaskId:"t5",freeformText:""},
];
const NA_SUM={trainingType:"New System Deployment",businessGoal:"Enable CS agents to support customers using the new mySFS portal, replacing defi CONNECT workflows, by go-live date of 5/20/2026",audience:"CS Lease Support (~65), Lease Maturity (~66), Collections (~66), Payment Ops (TBD)",currentState:"Agents use defi CONNECT for all customer portal support. No experience with mySFS interface.",desiredState:"Agents navigate mySFS confidently, process payments via Repay, troubleshoot login issues, and handle customer inquiries without escalation.",painPoints:["Agents unfamiliar with new portal layout","Payment processor change from current to Repay","IVR routing changes for portal-related calls","Timeline pressure — training must complete before go-live"]};
const STKH_SECTIONS=[
  {key:"project",title:"Project Context",color:"#3b82f6",items:[{q:"Project Name",a:"Lease customer portal change to mySFS & payment processor update"},{q:"Executive Sponsor",a:"Kelly Bennett, Sr. Product Manager, Digital"},{q:"Target Go-Live",a:"May 20, 2026"},{q:"Business Driver",a:"Vendor migration from defi CONNECT to mySFS portal — mandatory cutover, no parallel run"}]},
  {key:"system",title:"About the System",color:"#10b981",items:[{q:"System Being Introduced",a:"mySFS — the customer-facing portal where customers access lease or loan details, make payments, manage autopay, and view statements."},{q:"Main Functions",a:"Registration & Account Creation; Login / Forgot Password; Dashboard Overview; Payments (ACH, Debit Card, Apple Pay, Google Pay); Autopay & Paperless Enrollment; Contact Information Updates; Payoff Quote Requests; Transaction History; Billing Statement Access"},{q:"What It Replaces",a:"defi CONNECT customer portal — agents currently use this for all customer-facing portal support"},{q:"Key Differences",a:"New payment processor (Repay replacing current), redesigned customer dashboard layout, new login widget with different authentication flow"}]},
  {key:"audience",title:"Audience & Learner Profile",color:"#f59e0b",items:[{q:"Primary Learner Groups",a:"CS Lease Support (BPO) — ~65 agents\nLease Maturity — ~66 agents\nCollections — ~66 agents\nPayment Operations — count TBD"},{q:"Current Skill Level",a:"Intermediate to Advanced — all have 1+ years on defi CONNECT"},{q:"Technology Comfort",a:"Moderate to High — daily system users comfortable with multiple tools"},{q:"Learning Preferences",a:"Prefer hands-on practice over lecture. Previous training well-received with sandbox time."}]},
  {key:"constraints",title:"Constraints & Environment",color:"#ef4444",items:[{q:"Timeline",a:"Training must complete before May 20 go-live. No production access until cutover."},{q:"Available Time",a:"2 hours maximum per group — scheduled around call volume peaks"},{q:"Environment",a:"Sandbox available 4 weeks before go-live. Screen recordings permitted."},{q:"Known Risks",a:"Sandbox may not have full payment processing until 2 weeks before go-live."}]},
  {key:"pain",title:"Stakeholder Pain Points",color:"#9333ea",items:[{q:"Primary Concerns",a:"• Agents unfamiliar with new portal layout\n• Payment processor change from current to Repay\n• IVR routing changes for portal-related calls\n• Timeline pressure — training must complete before go-live\n• BPO agents may need more support than internal staff"}]},
];

// ─── Shared UI ──────────────────────────────────────────────────
function BB({level,size="sm"}){const b=BLOOM.find(x=>x.level===level);if(!b)return null;const s=size==="sm"?{fontSize:11,padding:"2px 8px"}:{fontSize:12,padding:"3px 10px"};return <span style={{display:"inline-block",...s,fontWeight:600,fontFamily:F,color:b.color,backgroundColor:b.bg,border:`1px solid ${b.border}`,borderRadius:4}}>{b.level}</span>;}
function PB({priority}){const p=PRI.find(x=>x.label===priority);if(!p)return null;return <span style={{display:"inline-block",fontSize:10,fontWeight:600,fontFamily:F,color:p.color,backgroundColor:p.bg,border:`1px solid ${p.color}22`,borderRadius:4,padding:"1px 6px",textTransform:"uppercase",letterSpacing:0.5}}>{p.label}</span>;}
function NABtn({onClick,label}){return <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",fontSize:11,fontFamily:F,fontWeight:500,color:P,backgroundColor:PL,border:`1px solid ${P}33`,borderRadius:4,cursor:"pointer"}}><span style={{fontSize:13}}>📋</span> {label||"Needs Analysis Data"}</button>;}
function SL({children}){return <label style={{display:"block",fontFamily:F,fontSize:11,fontWeight:600,color:TM,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{children}</label>;}
function CN({children}){return <div style={{fontFamily:F,fontSize:11,color:TM,fontStyle:"italic",marginTop:4,lineHeight:1.4}}>{children}</div>;}
function AL({l,c}){return <span style={{width:20,height:20,borderRadius:"50%",background:c,color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:F,flexShrink:0}}>{l}</span>;}

// ─── Horizontal Stepper ─────────────────────────────────────────
const STEPS=[{key:"context",num:"1",label:"Context & Gap Check"},{key:"priority",num:"2",label:"Content Priority"},{key:"tasks",num:"3",label:"Task Breakdown"},{key:"builder",num:"4",label:"Objective Builder"},{key:"validation",num:"5",label:"Validation"},{key:"export",num:"6",label:"Export"}];
function Stepper({step,onChange,status}){
  const icons={"none":"○","progress":"◑","done":"●","skip":"—"};
  return(<div style={{display:"flex",alignItems:"center",gap:0,padding:"0 20px",backgroundColor:W,borderBottom:`1px solid ${BD}`,flexShrink:0,overflow:"auto"}}>
    {STEPS.map((s,i)=>{const active=step===s.key;const st=status[s.key]||"none";return(<div key={s.key} style={{display:"flex",alignItems:"center"}}>
      <button onClick={()=>onChange(s.key)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 12px",border:"none",background:"transparent",cursor:"pointer",fontFamily:F,borderBottom:active?`2px solid ${P}`:"2px solid transparent",marginBottom:-1}}>
        <span style={{fontSize:11,color:active?P:st==="done"?"#16a34a":TM}}>{icons[st]}</span>
        <span style={{fontSize:12,fontWeight:active?600:400,color:active?P:TX,whiteSpace:"nowrap"}}>{s.label}</span>
      </button>
      {i<STEPS.length-1&&<span style={{color:BD,fontSize:11,padding:"0 2px"}}>›</span>}
    </div>);})}
  </div>);
}

// ─── Slide-over with default tab ────────────────────────────────
function SlideOver({visible,onClose,defaultTab}){
  const[activeTab,setActiveTab]=useState(defaultTab||"project");
  useEffect(()=>{if(defaultTab&&visible)setActiveTab(defaultTab);},[defaultTab,visible]);
  if(!visible)return null;
  return(<>
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:540,bottom:0,backgroundColor:"rgba(0,0,0,0.2)",zIndex:99}}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:540,backgroundColor:W,borderLeft:`1px solid ${BD}`,boxShadow:"-4px 0 20px rgba(0,0,0,0.1)",zIndex:100,display:"flex",flexDirection:"column",fontFamily:F}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${BD}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div><div style={{fontWeight:700,fontSize:16,color:TX}}>Needs Analysis Data</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><span style={{fontSize:11,fontWeight:600,color:"#16a34a",backgroundColor:"#f0fdf4",border:"1px solid #bbf7d0",padding:"1px 8px",borderRadius:4}}>Approved</span><span style={{fontSize:12,color:TM}}>Kelly Bennett • New System • Feb 4, 2026</span></div></div>
          <button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",fontSize:20,color:TM,padding:4}}>✕</button>
        </div>
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${BD}`,marginBottom:-1}}>
          {STKH_SECTIONS.map(sec=>(<button key={sec.key} onClick={()=>setActiveTab(sec.key)} style={{padding:"8px 14px",fontSize:11,fontWeight:activeTab===sec.key?600:400,fontFamily:F,color:activeTab===sec.key?sec.color:TM,border:"none",background:"transparent",cursor:"pointer",borderBottom:activeTab===sec.key?`2px solid ${sec.color}`:"2px solid transparent",whiteSpace:"nowrap"}}>{sec.title}</button>))}
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        {STKH_SECTIONS.filter(s=>s.key===activeTab).map(sec=>(<div key={sec.key}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{width:4,height:24,backgroundColor:sec.color,borderRadius:2}}/><span style={{fontSize:16,fontWeight:700,color:TX}}>{sec.title}</span></div>
          {sec.items.map((it,i)=>(<div key={i} style={{marginBottom:18,paddingBottom:16,borderBottom:i<sec.items.length-1?`1px solid ${BD}`:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:sec.color,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{it.q}</div>
            <div style={{fontSize:14,color:TX,lineHeight:1.7,whiteSpace:"pre-line"}}>{it.a}</div>
          </div>))}
        </div>))}
      </div>
      <div style={{padding:"10px 20px",borderTop:`1px solid ${BD}`,backgroundColor:BG}}><div style={{fontSize:10,color:TM,fontStyle:"italic"}}>From approved stakeholder submission — read only</div></div>
    </div>
  </>);
}

// ─── AI Review ──────────────────────────────────────────────────
function AIReview({obj,onClose}){
  if(!obj)return null;const nO=["understand","know","learn","appreciate"];const vOk=obj.verb&&!nO.some(v=>obj.verb.toLowerCase().includes(v));const hB=["Apply","Analyze","Evaluate","Create"].includes(obj.bloomLevel);
  const items=[];
  if(vOk)items.push({t:"success",x:`Observable action verb '${obj.verb}' — good. This is measurable.`});else if(obj.verb)items.push({t:"warning",x:`'${obj.verb}' may not be directly observable. Consider demonstrate, execute, or perform (Mager, 1997).`});else items.push({t:"warning",x:"No verb selected yet."});
  if(obj.condition)items.push({t:"warning",x:"Condition is well-stated but consider adding what resources are NOT available — can they use a job aid? (Dirksen, 2016)"});else items.push({t:"warning",x:"No condition specified."});
  if(obj.criteria)items.push({t:"suggestion",x:"Criterion is specific and measurable. Consider whether realistic for new vs. tenured agents."});else items.push({t:"warning",x:"No criteria specified."});
  if(hB&&!obj.requiresAssessment)items.push({t:"warning",x:`${obj.bloomLevel}-level needs performance-based assessment (Merrill, 2013).`});
  if(!obj.linkedTaskId)items.push({t:"suggestion",x:"Not linked to a parent task. Connecting strengthens traceability (Dick, Carey & Carey, 2015)."});
  const ic={success:"✓",warning:"⚠",suggestion:"💡"},cc={success:{bg:"#f0fdf4",bd:"#bbf7d0"},warning:{bg:"#fefce8",bd:"#fef08a"},suggestion:{bg:PL,bd:`${P}33`}};
  return(<div style={{marginTop:12,borderTop:`1px solid ${BD}`,paddingTop:12}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5}}>🎓 AI Review</div><button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",fontSize:14,color:TM}}>✕</button></div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>{items.map((it,i)=>{const c=cc[it.t];return <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",backgroundColor:c.bg,border:`1px solid ${c.bd}`,borderRadius:6,fontSize:12,color:TX,lineHeight:1.5}}><span style={{flexShrink:0,fontSize:14}}>{ic[it.t]}</span><span>{it.x}</span></div>;})}</div>
    <div style={{marginTop:8,fontSize:10,color:TM,fontStyle:"italic"}}>AI reviews against ABCD completeness, verb observability, and stakeholder alignment.</div>
  </div>);
}

// ─── Verb Pickers ───────────────────────────────────────────────
function BVP({onSelect,sv}){const[exp,setExp]=useState(null);return(<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{BLOOM.map(b=>(<div key={b.level} style={{position:"relative"}}><button onClick={()=>setExp(exp===b.level?null:b.level)} style={{padding:"3px 8px",fontSize:11,fontFamily:F,fontWeight:500,color:b.color,backgroundColor:exp===b.level?b.bg:"transparent",border:`1px solid ${b.border}`,borderRadius:4,cursor:"pointer"}}>{b.level} ▾</button>{exp===b.level&&(<div style={{position:"absolute",top:"100%",left:0,marginTop:4,backgroundColor:W,border:`1px solid ${BD}`,borderRadius:6,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:6,zIndex:20,display:"flex",flexWrap:"wrap",gap:3,minWidth:180}}>{b.verbs.map(v=><button key={v} onClick={()=>{onSelect(v,b.level,null);setExp(null);}} style={{padding:"3px 8px",fontSize:11,fontFamily:F,fontWeight:sv===v?700:400,color:sv===v?W:b.color,backgroundColor:sv===v?b.color:b.bg,border:`1px solid ${b.border}`,borderRadius:4,cursor:"pointer"}}>{v}</button>)}</div>)}</div>))}</div>);}
function AKP({onSelect,sv,sp,sk}){const[ec,setEc]=useState(null);return(<div><div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:11,fontFamily:F}}><thead><tr><th style={{padding:"5px 6px",background:BG,border:`1px solid ${BD}`,fontWeight:600,color:TM,fontSize:10,textAlign:"left",minWidth:75}}>Process ↓</th>{BK.map(k=><th key={k} style={{padding:"5px 6px",background:BG,border:`1px solid ${BD}`,fontWeight:600,color:TM,fontSize:10,textAlign:"center",minWidth:80}}>{k}</th>)}</tr></thead><tbody>{BLOOM.map(bl=>(<tr key={bl.level}><td style={{padding:"5px 6px",border:`1px solid ${BD}`,fontWeight:600,background:bl.bg,color:bl.color,fontSize:11}}>{bl.level}</td>{BK.map(k=>{const ck=`${bl.level}-${k}`,isSel=sp===bl.level&&sk===k,isExp=ec===ck,verbs=B2V[ck]||[];return(<td key={k} onClick={()=>setEc(isExp?null:ck)} style={{padding:0,border:`2px solid ${isSel?bl.color:BD}`,background:isSel?bl.bg:W,cursor:"pointer",position:"relative",verticalAlign:"top"}}><div style={{padding:"5px 6px",minHeight:28,display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&sv?<span style={{fontWeight:600,color:bl.color,fontSize:11}}>{sv}</span>:<span style={{color:"#cbd5e1",fontSize:10}}>·</span>}</div>{isExp&&(<div style={{position:"absolute",top:"100%",left:-1,zIndex:50,background:W,border:`1px solid ${bl.border}`,borderRadius:6,boxShadow:"0 8px 24px rgba(0,0,0,.12)",padding:6,minWidth:140}}><div style={{fontSize:10,color:TM,padding:"2px 6px",marginBottom:3}}>Select verb:</div>{verbs.map(v=><button key={v} onClick={e=>{e.stopPropagation();onSelect(v,bl.level,k);setEc(null);}} style={{display:"block",width:"100%",textAlign:"left",padding:"4px 8px",border:"none",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:F,background:v===sv?bl.bg:"transparent",color:v===sv?bl.color:TX,fontWeight:v===sv?600:400}}>{v}</button>)}</div>)}</td>);})}</tr>))}</tbody></table></div>{sp&&sk&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}><span style={{fontSize:11,color:TM}}>Classification:</span><BB level={sp}/><span style={{fontSize:11,color:TM}}>×</span><span style={{fontSize:11,fontWeight:600,color:TM,background:BG,padding:"2px 8px",borderRadius:4,border:`1px solid ${BD}`}}>{sk}</span></div>}</div>);}

// ─── Context Strip + Composed Banner ────────────────────────────
function CtxStrip({obj,tasks}){const pt=obj.linkedTaskId?tasks.find(t=>t.id===obj.linkedTaskId):null;return(<div style={{padding:"8px 16px",background:BG,border:`1px solid ${BD}`,borderRadius:6,display:"flex",alignItems:"center",gap:16,fontSize:12,fontFamily:F,flexWrap:"wrap"}}><div><span style={{color:TM,fontWeight:600}}>Parent Task: </span><span style={{color:TX}}>{pt?pt.task:<span style={{fontStyle:"italic",color:TM}}>Not linked</span>}</span></div><div style={{width:1,height:16,background:BD}}/><div><span style={{color:TM,fontWeight:600}}>Gap: </span><span style={{color:TX}}>Skill</span></div></div>);}
function CBanner({obj,idx,aud,showAI,onAI}){
  if(!obj)return null;const a=obj.audience||aud[0]||"…",ok=obj.condition&&obj.behavior&&obj.criteria,miss=[!obj.condition&&"Condition",!obj.behavior&&"Behavior",!obj.criteria&&"Criteria"].filter(Boolean);
  return(<div style={{padding:"16px 20px",backgroundColor:ok?"#f0fdf4":"#fffbeb",border:`1px solid ${ok?"#bbf7d0":"#fde68a"}`,borderRadius:8}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16,fontWeight:700,fontFamily:F,color:ok?"#16a34a":"#ca8a04"}}>{ok?"✓":"⟳"} Composed Objective {idx+1}</span>{!ok&&<span style={{fontSize:11,fontFamily:F,color:"#ca8a04"}}>— {miss.join(", ")} needed</span>}</div><button onClick={onAI} style={{padding:"4px 10px",fontSize:11,fontFamily:F,fontWeight:600,color:showAI?W:"#7c3aed",backgroundColor:showAI?"#7c3aed":"transparent",border:"1px solid #7c3aed44",borderRadius:4,cursor:"pointer"}}>🎓 AI Review</button></div>
    <div style={{fontFamily:F,fontSize:14,color:TX,lineHeight:1.7}}>{obj.condition?<span style={{fontWeight:500}}>{obj.condition}, </span>:<span style={{color:TM,fontStyle:"italic"}}>[Condition], </span>}<span style={{color:P,fontStyle:"italic"}}>{a}</span><span> will </span>{obj.behavior?<span style={{fontWeight:700}}>{obj.behavior}</span>:<span style={{color:TM,fontStyle:"italic"}}>[behavior]</span>}{obj.criteria?<span style={{color:TM}}> {obj.criteria}</span>:<span style={{color:TM,fontStyle:"italic"}}> [criteria]</span>}<span>.</span></div>
    {showAI&&<AIReview obj={obj} onClose={onAI}/>}
  </div>);
}
function ObjCard({obj,isSel,onClick}){return(<div onClick={onClick} style={{padding:"8px 12px",backgroundColor:isSel?PL:W,border:`1px solid ${isSel?P:BD}`,borderRadius:6,cursor:"pointer",marginBottom:4}}>
  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>{obj.priority&&<PB priority={obj.priority}/>}{obj.bloomLevel&&<BB level={obj.bloomLevel}/>}{obj.requiresAssessment&&<span style={{fontSize:10,color:"#0891b2",fontFamily:F,fontWeight:500}}>📋</span>}</div>
  <div style={{fontFamily:F,fontSize:12,fontWeight:isSel?600:400,color:TX,lineHeight:1.4}}>{obj.behavior||obj.freeformText||"New objective..."}</div>
  {obj.linkedTaskId&&<div style={{fontSize:10,color:TM,marginTop:3,fontFamily:F}}>↳ {NA_TASKS.find(t=>t.id===obj.linkedTaskId)?.task}</div>}
</div>);}

// ═══ SCREEN 1: Context & Gap Check ══════════════════════════════
function Screen1({gapTypes,setGapTypes}){
  const coaching=useMemo(()=>{
    if(gapTypes.knowledge&&gapTypes.skill)return "Knowledge + Skill gaps produce a mix of Understand and Apply levels. Both information delivery and hands-on practice needed.";
    if(gapTypes.knowledge)return "Knowledge gaps produce objectives at Remember and Understand levels. Expect information-delivery focused design.";
    if(gapTypes.skill)return "Skill gaps require practice-based objectives at Apply and Analyze levels. Slides alone won't close this gap.";return null;
  },[gapTypes]);
  const card={background:W,border:`1px solid ${BD}`,borderRadius:8,padding:20,fontFamily:F};
  return(<div style={{padding:24,maxWidth:920,margin:"0 auto",fontFamily:F}}>
    <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:TX}}>Context & Gap Check</h2>
    <p style={{fontSize:13,color:TM,margin:"0 0 20px"}}>Review Needs Analysis data and classify the performance gap.</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={card}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:4,height:20,backgroundColor:P,borderRadius:2}}/><span style={{fontSize:14,fontWeight:700,color:TX}}>Needs Analysis Summary</span></div>
        {[{l:"Training Type",v:NA_SUM.trainingType},{l:"Business Goal",v:NA_SUM.businessGoal},{l:"Target Audience",v:NA_SUM.audience},{l:"Current State",v:NA_SUM.currentState},{l:"Desired State",v:NA_SUM.desiredState}].map(r=>(<div key={r.l} style={{marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${BD}`}}><div style={{fontSize:11,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{r.l}</div><div style={{fontSize:13,color:TX,lineHeight:1.6}}>{r.v}</div></div>))}
        <div><div style={{fontSize:11,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Stakeholder Pain Points</div>{NA_SUM.painPoints.map((p,i)=><div key={i} style={{fontSize:13,color:TX,padding:"3px 0",lineHeight:1.5}}>• {p}</div>)}</div>
      </div>
      <div style={card}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:4,height:20,backgroundColor:"#f59e0b",borderRadius:2}}/><span style={{fontSize:14,fontWeight:700,color:TX}}>Gap Classification</span></div>
        <p style={{fontSize:13,color:TX,margin:"0 0 14px"}}>What type of gap are you addressing?</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {[{key:"knowledge",label:"Knowledge",desc:"They don't know the information",icon:"📖"},{key:"skill",label:"Skill",desc:"They can't perform the task (even if they understand it)",icon:"🔧"}].map(g=>(
            <label key={g.key} style={{display:"flex",gap:10,padding:14,borderRadius:8,cursor:"pointer",border:`2px solid ${gapTypes[g.key]?P:BD}`,background:gapTypes[g.key]?PL:W}}>
              <input type="checkbox" checked={gapTypes[g.key]} onChange={()=>setGapTypes(p=>({...p,[g.key]:!p[g.key]}))} style={{marginTop:2}}/>
              <div><div style={{fontWeight:600,fontSize:13,color:TX}}>{g.icon} {g.label}</div><div style={{fontSize:12,color:TM,marginTop:2}}>{g.desc}</div></div>
            </label>))}
        </div>
        {coaching&&<div style={{background:BG,border:`1px solid ${BD}`,borderRadius:6,padding:12,marginBottom:12}}><div style={{fontSize:10,fontWeight:600,color:TM,textTransform:"uppercase",marginBottom:3}}>💡 Coaching</div><p style={{fontSize:12,color:TX,margin:0,lineHeight:1.5}}>{coaching}</p></div>}
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:12}}><div style={{fontSize:10,fontWeight:600,color:"#ca8a04",textTransform:"uppercase",marginBottom:3}}>💡 Not a training problem?</div><p style={{fontSize:11,color:TX,margin:0,lineHeight:1.5}}>If the gap is motivation or environment, training won't solve it. Consider job aids, process changes, or incentive redesign.</p></div>
      </div>
    </div>
  </div>);
}

// ═══ SCREEN 2: Content Priority ═════════════════════════════════
function Screen2({triageItems,setTriageItems}){
  const[newItem,setNewItem]=useState("");
  const cols={must:{label:"Must",sub:"What must they absolutely do 6 months from now without a reference?",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"},should:{label:"Should",sub:"What do they need to know to function, even with a job aid?",color:"#ca8a04",bg:"#fefce8",border:"#fef08a"},nice:{label:"Nice to Have",sub:"Encounter but don't master. No objective written.",color:"#6b7280",bg:"#f8fafc",border:"#e2e8f0"}};
  const move=(id,to)=>setTriageItems(p=>p.map(i=>i.id===id?{...i,column:to}:i));
  const add=()=>{if(!newItem.trim())return;setTriageItems(p=>[...p,{id:`c-${Date.now()}`,text:newItem.trim(),column:"must",source:"Custom"}]);setNewItem("");};
  return(<div style={{padding:24,maxWidth:960,margin:"0 auto",fontFamily:F}}>
    <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:TX}}>Content Priority</h2>
    <p style={{fontSize:13,color:TM,margin:"0 0 16px"}}>Only Must and Should proceed to objectives.</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
      {Object.entries(cols).map(([key,c])=>{const items=triageItems.filter(i=>i.column===key);return(
        <div key={key} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:8,padding:12,minHeight:220}}>
          <div style={{marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:c.color}}>{c.label}</span><span style={{fontSize:11,color:c.color,float:"right"}}>{items.length}</span></div>
          <div style={{fontSize:10,color:TM,fontStyle:"italic",marginBottom:8,lineHeight:1.3}}>{c.sub}</div>
          {items.map(it=>(<div key={it.id} style={{background:W,border:`1px solid ${BD}`,borderRadius:6,padding:"7px 10px",marginBottom:5,fontSize:12,color:TX,fontFamily:F}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
              <div><div style={{lineHeight:1.4}}>{it.text}</div><div style={{fontSize:10,color:it.source==="Custom"?P:TM,marginTop:2}}>{it.source==="NA"?"From NA":"Custom"}</div></div>
              <div style={{display:"flex",gap:2,flexShrink:0}}>{Object.keys(cols).filter(k=>k!==key).map(k=><button key={k} onClick={()=>move(it.id,k)} title={cols[k].label} style={{padding:"2px 6px",fontSize:9,fontWeight:700,border:`1px solid ${cols[k].border}`,borderRadius:3,background:W,cursor:"pointer",color:cols[k].color,fontFamily:F}}>{cols[k].label[0]}</button>)}</div>
            </div>
          </div>))}
        </div>);})}
    </div>
    <div style={{display:"flex",gap:8}}><input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a custom task or skill..." style={{flex:1,padding:"7px 10px",border:`1px solid ${BD}`,borderRadius:4,fontSize:12,fontFamily:F,outline:"none"}}/><button onClick={add} style={{padding:"7px 14px",background:BG,border:`1px solid ${BD}`,borderRadius:4,cursor:"pointer",fontSize:12,color:TX,fontFamily:F}}>+ Add</button></div>
    <CN>💡 Only "Must" and "Should" get objectives. "Nice to Have" may become job aids.</CN>
  </div>);
}

// ═══ SCREEN 3: Task Breakdown ═══════════════════════════════════
function Screen3({triageItems,subTasks,setSubTasks,openNA}){
  const active=triageItems.filter(i=>i.column!=="nice");
  const[expanded,setExpanded]=useState(active[0]?.id||null);
  const addSub=(pid)=>{setSubTasks(p=>[...p,{id:`sub-${Date.now()}`,parentId:pid,text:"",isNew:"New",sort:p.filter(s=>s.parentId===pid).length+1}]);};
  const upSub=(id,f,v)=>setSubTasks(p=>p.map(s=>s.id===id?{...s,[f]:v}:s));
  const rmSub=(id)=>setSubTasks(p=>p.filter(s=>s.id!==id));
  return(<div style={{padding:24,maxWidth:900,margin:"0 auto",fontFamily:F}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
      <h2 style={{margin:0,fontSize:18,fontWeight:700,color:TX}}>Task Breakdown</h2>
      <NABtn onClick={()=>openNA("system")} label="Needs Analysis Data"/>
    </div>
    <p style={{fontSize:13,color:TM,margin:"0 0 16px"}}>Break tasks into observable sub-steps. Only "New" sub-tasks generate objectives.</p>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {active.map(task=>{const subs=subTasks.filter(s=>s.parentId===task.id);const isExp=expanded===task.id;const nc=subs.filter(s=>s.isNew==="New").length;
        return(<div key={task.id} style={{background:W,border:`1px solid ${BD}`,borderRadius:8,overflow:"hidden"}}>
          <button onClick={()=>setExpanded(isExp?null:task.id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",border:"none",background:isExp?BG:W,cursor:"pointer",fontFamily:F,textAlign:"left"}}>
            <div><div style={{fontSize:13,fontWeight:600,color:TX}}>{task.text}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}><span style={{fontSize:10,color:TM}}>{task.source==="Stakeholder"?"From NA — Stakeholder":"From NA — ID Analysis"}</span><span style={{fontSize:10,color:TM}}>•</span><span style={{fontSize:10,color:nc>0?"#16a34a":TM}}>{subs.length} sub-tasks • {nc} for objectives</span></div></div>
            <span style={{color:TM,fontSize:16}}>{isExp?"∧":"∨"}</span>
          </button>
          {isExp&&(<div style={{padding:"0 16px 16px"}}>
            {subs.map((sub,i)=>(<div key={sub.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,opacity:sub.isNew==="Already can do"?0.5:1}}>
              <span style={{fontSize:11,color:TM,width:20,textAlign:"right"}}>{i+1}.</span>
              <input value={sub.text} onChange={e=>upSub(sub.id,"text",e.target.value)} placeholder="Describe the sub-task…" style={{flex:1,padding:"6px 8px",border:`1px solid ${BD}`,borderRadius:4,fontSize:12,fontFamily:F,outline:"none"}}/>
              <select value={sub.isNew} onChange={e=>upSub(sub.id,"isNew",e.target.value)} style={{padding:"5px 8px",border:`1px solid ${BD}`,borderRadius:4,fontSize:11,fontFamily:F,color:sub.isNew==="New"?"#16a34a":sub.isNew==="Uncertain"?"#ca8a04":TM}}>
                <option value="New">New</option><option value="Already can do">Already can do</option><option value="Uncertain">Uncertain ❓</option>
              </select>
              <button onClick={()=>rmSub(sub.id)} style={{border:"none",background:"none",cursor:"pointer",color:TM,fontSize:14}}>✕</button>
            </div>))}
            <button onClick={()=>addSub(task.id)} style={{padding:"6px 12px",fontSize:11,fontFamily:F,color:P,background:"transparent",border:`1px dashed ${P}66`,borderRadius:4,cursor:"pointer",marginTop:4}}>+ Add step</button>
          </div>)}
        </div>);
      })}
    </div>
    <div style={{marginTop:16,background:BG,border:`1px solid ${BD}`,borderRadius:8,padding:14,display:"flex",alignItems:"center",gap:10}}><span>🔗</span><div><div style={{fontSize:12,fontWeight:600,color:TX}}>Task Analysis Sync</div><div style={{fontSize:11,color:TM}}>Not started. When completed, tasks sync bidirectionally.</div></div></div>
  </div>);
}

// ═══ SCREEN 4: Objective Builder ════════════════════════════════
function Screen4({objs,setObjs,selId,setSelId,openNA,showAI,setShowAI,theory,setTheory,audMode,setAudMode}){
  const sel=objs.find(o=>o.id===selId);const selIdx=objs.findIndex(o=>o.id===selId);
  const[viewMode,setViewMode]=useState("guided");
  const chg=(f,v)=>setObjs(p=>p.map(o=>o.id===selId?{...o,[f]:v}:o));
  const verbSel=(v,bl,bk)=>setObjs(p=>p.map(o=>o.id===selId?{...o,verb:v,bloomLevel:bl,...(bk?{bloomKnowledge:bk}:{})}:o));
  const composedText=(o)=>{if(!o)return"";const p=[];if(o.condition)p.push(o.condition+",");p.push((o.audience||AUD[0])+" will");if(o.behavior)p.push(o.behavior);if(o.criteria)p.push(o.criteria);return p.join(" ")||o.freeformText||"";};
  const addObj=()=>{const n={id:`${Date.now()}`,audience:"",behavior:"",verb:"",bloomLevel:"",bloomKnowledge:"",condition:"",criteria:"",priority:"Should",requiresAssessment:false,rationale:"",wiifm:"",linkedTaskId:null,freeformText:""};setObjs(p=>[...p,n]);setSelId(n.id);return n;};
  const iS={width:"100%",padding:"7px 10px",fontFamily:F,fontSize:13,color:TX,border:`1px solid ${BD}`,borderRadius:4,outline:"none",boxSizing:"border-box",lineHeight:1.5};
  const secD={marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${BD}`};

  return(<div style={{display:"flex",flex:1,overflow:"hidden",fontFamily:F}}>
    {/* Sidebar */}
    <div style={{width:300,borderRight:`1px solid ${BD}`,backgroundColor:BG,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"10px 12px 8px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <SL>Objectives ({objs.length})</SL>
        <div style={{display:"flex",border:`1px solid ${BD}`,borderRadius:4,overflow:"hidden"}}>
          {[{k:"guided",l:"Guided"},{k:"freeform",l:"Freeform"}].map(m=><button key={m.k} onClick={()=>setViewMode(m.k)} style={{padding:"3px 8px",fontSize:10,fontFamily:F,fontWeight:viewMode===m.k?600:400,border:"none",background:viewMode===m.k?P:W,color:viewMode===m.k?W:TM,cursor:"pointer"}}>{m.l}</button>)}
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"8px 12px"}}>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><SL>Parent Tasks</SL><NABtn onClick={()=>openNA("system")} label="Needs Analysis Data"/></div>
          {NA_TASKS.map(t=>{const lk=objs.some(o=>o.linkedTaskId===t.id);return <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",marginBottom:2,backgroundColor:lk?"#f0fdf4":W,border:`1px solid ${lk?"#bbf7d0":BD}`,borderRadius:4,fontSize:11,fontFamily:F}}><span style={{flexShrink:0,width:12,height:12,borderRadius:3,backgroundColor:lk?"#16a34a":"#e2e8f0",color:W,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700}}>{lk?"✓":""}</span><span style={{flex:1,lineHeight:1.3,color:TX}}>{t.task}</span></div>;})}
          <div style={{fontSize:10,color:TM,marginTop:3,fontStyle:"italic"}}>{NA_TASKS.filter(t=>!objs.some(o=>o.linkedTaskId===t.id)).length} tasks without objectives</div>
        </div>
        <div style={{borderTop:`1px solid ${BD}`,margin:"4px 0 8px"}}/>
        {objs.map(o=><ObjCard key={o.id} obj={o} isSel={selId===o.id} onClick={()=>setSelId(o.id)}/>)}
        <button onClick={addObj} style={{width:"100%",marginTop:6,padding:"7px",fontFamily:F,fontSize:11,fontWeight:500,color:P,backgroundColor:"transparent",border:`1px dashed ${P}66`,borderRadius:6,cursor:"pointer"}}>+ Add Objective</button>
      </div>
    </div>

    {/* Editor */}
    <div style={{flex:1,backgroundColor:W,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {sel?(<div style={{flex:1,overflow:"auto"}}>
        {viewMode==="freeform"?(
          <div style={{padding:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:TX}}>Freeform Objective</div>
              <NABtn onClick={()=>openNA("project")}/>
            </div>
            {(sel.behavior||sel.condition||sel.criteria)&&!sel.freeformText&&(
              <div style={{marginBottom:12,padding:"10px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:6}}>
                <div style={{fontSize:10,fontWeight:600,color:"#0284c7",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>📝 Reference — your structured ABCD data</div>
                <div style={{fontSize:12,color:TX,lineHeight:1.5}}>{composedText(sel)}</div>
                <div style={{fontSize:10,color:TM,fontStyle:"italic",marginTop:4}}>This data is preserved. Switch back to Guided view anytime.</div>
              </div>)}
            <textarea rows={5} value={sel.freeformText||composedText(sel)} onChange={e=>chg("freeformText",e.target.value)} placeholder="Write your complete objective here." style={{...iS,resize:"vertical",fontSize:14,lineHeight:1.6,minHeight:120}}/>
            <div style={{display:"flex",gap:12,marginTop:16}}>
              <div style={{flex:1}}><SL>Bloom's Level (optional)</SL><select value={sel.bloomLevel||""} onChange={e=>chg("bloomLevel",e.target.value)} style={{...iS,fontSize:12}}><option value="">— Select —</option>{BLOOM.map(b=><option key={b.level} value={b.level}>{b.level}</option>)}</select></div>
              <div style={{flex:1}}><SL>Priority (optional)</SL><select value={sel.priority||""} onChange={e=>chg("priority",e.target.value)} style={{...iS,fontSize:12}}><option value="">— Select —</option>{PRI.map(p=><option key={p.label} value={p.label}>{p.label}</option>)}</select></div>
              <div style={{flex:1}}><SL>Assessment</SL><div style={{display:"flex",gap:4}}>{[true,false].map(v=><button key={String(v)} onClick={()=>chg("requiresAssessment",v)} style={{flex:1,padding:"6px",fontFamily:F,fontSize:11,fontWeight:sel.requiresAssessment===v?600:400,color:sel.requiresAssessment===v?(v?"#16a34a":"#dc2626"):TM,backgroundColor:sel.requiresAssessment===v?(v?"#f0fdf4":"#fef2f2"):"transparent",border:`1px solid ${sel.requiresAssessment===v?(v?"#bbf7d0":"#fecaca"):BD}`,borderRadius:4,cursor:"pointer"}}>{v?"Yes":"No"}</button>)}</div></div>
            </div>
            <div style={{marginTop:16}}><SL>Link to Parent Task</SL><select value={sel.linkedTaskId||""} onChange={e=>chg("linkedTaskId",e.target.value||null)} style={{...iS,fontSize:12}}><option value="">— None —</option>{NA_TASKS.map(t=><option key={t.id} value={t.id}>{t.task}</option>)}</select><CN>Links this objective to a parent task for traceability.</CN></div>
          </div>
        ):(
          <div>
            <div style={{padding:"12px 20px 0"}}><CtxStrip obj={sel} tasks={NA_TASKS}/></div>
            <div style={{padding:"10px 20px 0"}}><CBanner obj={sel} idx={selIdx} aud={AUD} showAI={showAI} onAI={()=>setShowAI(!showAI)}/></div>
            {sel.freeformText&&(<div style={{margin:"10px 20px 0",padding:"10px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:6}}>
              <div style={{fontSize:10,fontWeight:600,color:"#0284c7",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>📝 Reference — your freeform text</div>
              <div style={{fontSize:12,color:TX,lineHeight:1.5}}>{sel.freeformText}</div>
              <div style={{fontSize:10,color:TM,fontStyle:"italic",marginTop:4}}>Use this to populate ABCD fields. Your freeform text is preserved.</div>
            </div>)}
            <div style={{padding:"16px 20px"}}>
              <div style={secD}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><AL l="A" c="#3b82f6"/><SL>Audience</SL><NABtn onClick={()=>openNA("audience")} label="Audience Data"/><span style={{fontSize:10,fontFamily:F,fontWeight:500,color:audMode==="custom"?"#ca8a04":P,backgroundColor:audMode==="custom"?"#fefce8":PL,padding:"1px 6px",borderRadius:3}}>{audMode==="custom"?"Custom":"From NA"}</span></div>
                <select value={audMode==="custom"?"__custom__":(sel.audience||AUD[0])} onChange={e=>{if(e.target.value==="__custom__"){setAudMode("custom");chg("audience","");}else{setAudMode("picklist");chg("audience",e.target.value);}}} style={{...iS,fontSize:12}}>{AUD.map(a=><option key={a} value={a}>{a}</option>)}<option value="__custom__">Other — type custom</option></select>
                {audMode==="custom"&&<input type="text" value={sel.audience} onChange={e=>chg("audience",e.target.value)} placeholder="Describe audience…" style={{...iS,marginTop:6}}/>}
                <CN>Auto-populated from Needs Analysis.</CN></div>
              <div style={secD}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><AL l="B" c="#10b981"/><SL>Behavior</SL></div>
                <div style={{display:"flex",gap:4,marginBottom:8}}>{[{k:"bloom",l:"Bloom's Revised",s:"Standard 6-level"},{k:"anderson",l:"Anderson-Krathwohl 2D",s:"Process × Knowledge"}].map(t=><button key={t.k} onClick={()=>setTheory(t.k)} style={{flex:1,padding:"8px 10px",textAlign:"left",fontFamily:F,borderRadius:6,cursor:"pointer",border:`2px solid ${theory===t.k?P:BD}`,background:theory===t.k?PL:W}}><div style={{fontSize:12,fontWeight:600,color:theory===t.k?P:TX}}>{t.l}</div><div style={{fontSize:10,color:TM}}>{t.s}</div></button>)}</div>
                <div style={{marginBottom:8}}><SL>Action Verb</SL>{theory==="bloom"?<BVP onSelect={verbSel} sv={sel.verb}/>:<AKP onSelect={verbSel} sv={sel.verb} sp={sel.bloomLevel} sk={sel.bloomKnowledge}/>}</div>
                <textarea rows={2} value={sel.behavior} onChange={e=>chg("behavior",e.target.value)} style={{...iS,resize:"vertical"}}/>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}><span style={{fontSize:11,color:TM}}>Bloom:</span><BB level={sel.bloomLevel} size="md"/>{theory==="anderson"&&sel.bloomKnowledge&&<><span style={{fontSize:11,color:TM}}>×</span><span style={{fontSize:11,fontWeight:600,color:TM,background:BG,padding:"2px 8px",borderRadius:4,border:`1px solid ${BD}`}}>{sel.bloomKnowledge}</span></>}</div>
                <CN>Start with an observable action verb.</CN></div>
              <div style={secD}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><AL l="C" c="#f59e0b"/><SL>Condition</SL><NABtn onClick={()=>openNA("system")} label="System Info"/></div>
                <textarea rows={2} value={sel.condition} onChange={e=>chg("condition",e.target.value)} placeholder="Under what circumstances will the learner perform this?" style={{...iS,resize:"vertical"}}/><CN>Describe situation, tools, or constraints.</CN></div>
              <div style={secD}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><AL l="D" c="#ef4444"/><SL>Degree / Criteria</SL></div>
                <textarea rows={2} value={sel.criteria} onChange={e=>chg("criteria",e.target.value)} placeholder="How well must they perform?" style={{...iS,resize:"vertical"}}/><CN>Time limits, accuracy, benchmarks.</CN></div>
              <div style={{display:"flex",gap:16,...secD}}>
                <div style={{flex:1}}><SL>Priority</SL><div style={{display:"flex",gap:4}}>{PRI.map(p=><button key={p.label} onClick={()=>chg("priority",p.label)} style={{flex:1,padding:"5px 6px",fontFamily:F,fontSize:11,fontWeight:sel.priority===p.label?600:400,color:sel.priority===p.label?p.color:TM,backgroundColor:sel.priority===p.label?p.bg:"transparent",border:`1px solid ${sel.priority===p.label?p.color+"44":BD}`,borderRadius:4,cursor:"pointer",whiteSpace:"nowrap"}}>{p.label}</button>)}</div></div>
                <div style={{flex:1}}><SL>Requires Assessment</SL><div style={{display:"flex",gap:4}}>{[true,false].map(v=><button key={String(v)} onClick={()=>chg("requiresAssessment",v)} style={{flex:1,padding:"5px 8px",fontFamily:F,fontSize:11,fontWeight:sel.requiresAssessment===v?600:400,color:sel.requiresAssessment===v?(v?"#16a34a":"#dc2626"):TM,backgroundColor:sel.requiresAssessment===v?(v?"#f0fdf4":"#fef2f2"):"transparent",border:`1px solid ${sel.requiresAssessment===v?(v?"#bbf7d0":"#fecaca"):BD}`,borderRadius:4,cursor:"pointer"}}>{v?"Yes":"No"}</button>)}</div></div>
              </div>
              <div style={secD}><SL>Link to Parent Task</SL><select value={sel.linkedTaskId||""} onChange={e=>chg("linkedTaskId",e.target.value||null)} style={{...iS,fontSize:12}}><option value="">— None —</option>{NA_TASKS.map(t=><option key={t.id} value={t.id}>{t.task}</option>)}</select></div>
              <div style={secD}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><SL>WIIFM</SL><span style={{fontSize:10,color:TM,fontStyle:"italic"}}>(why this matters to the learner)</span></div><textarea rows={2} value={sel.wiifm||""} onChange={e=>chg("wiifm",e.target.value)} placeholder="Why should the learner care?" style={{...iS,resize:"vertical"}}/><CN>Carries to storyboard and learner-facing materials.</CN></div>
              <div><SL>Rationale (optional)</SL><textarea rows={2} value={sel.rationale} onChange={e=>chg("rationale",e.target.value)} placeholder="Business justification…" style={{...iS,resize:"vertical"}}/></div>
            </div>
          </div>
        )}
      </div>):<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:TM,fontSize:14}}>Select an objective or add one to begin</div>}
    </div>
  </div>);
}

// ═══ SCREEN 5: Validation ═══════════════════════════════════════
function Screen5({objs,tasks}){
  const linked=objs.filter(o=>o.linkedTaskId);const unlT=tasks.filter(t=>!objs.some(o=>o.linkedTaskId===t.id));const unlO=objs.filter(o=>!o.linkedTaskId);
  const bd={};objs.forEach(o=>{if(o.bloomLevel)bd[o.bloomLevel]=(bd[o.bloomLevel]||0)+1;});const maxB=Math.max(...Object.values(bd),1);
  const pc={Must:0,Should:0,"Nice to Have":0};objs.forEach(o=>{if(o.priority)pc[o.priority]=(pc[o.priority]||0)+1;});
  const needA=objs.filter(o=>o.requiresAssessment);const highNA=objs.filter(o=>["Analyze","Evaluate","Create"].includes(o.bloomLevel)&&!o.requiresAssessment);
  const unclass=objs.filter(o=>!o.bloomLevel).length;const noPri=objs.filter(o=>!o.priority).length;
  const topB=Object.entries(bd).sort((a,b)=>b[1]-a[1])[0];
  const bInterp={"Remember":"Heavy Remember suggests content better served by a job aid.","Understand":"Needs clear examples and non-examples, not just definitions.","Apply":"Requires hands-on practice — slides alone won't close this gap.","Analyze":"Requires scenario-based practice with varied conditions.","Evaluate":"Common in leadership or QA training, not typical for system rollouts.","Create":"Common in design or strategy training."};
  const card={background:W,border:`1px solid ${BD}`,borderRadius:8,padding:20,marginBottom:14,fontFamily:F};
  const hdr=(icon,title)=><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{fontSize:16}}>{icon}</span><span style={{fontSize:15,fontWeight:700,color:TX}}>{title}</span></div>;

  return(<div style={{padding:"20px 24px",fontFamily:F,maxWidth:820,margin:"0 auto"}}>
    <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:TX}}>📊 Validation Dashboard</h2>
    <p style={{fontSize:13,color:TM,margin:"0 0 20px"}}>All advisory. Nothing blocks export.</p>

    <div style={card}>{hdr("🔗","Traceability")}
      <div style={{fontSize:12,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Business Goal</div>
      <div style={{fontSize:13,color:TX,lineHeight:1.5,padding:"10px 14px",background:BG,borderRadius:6,marginBottom:14,border:`1px solid ${BD}`}}>{NA_SUM.businessGoal}</div>
      <div style={{fontSize:12,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Parent Tasks → Objectives</div>
      <div style={{border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden",marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 100px 80px",padding:"6px 12px",background:BG,borderBottom:`1px solid ${BD}`,fontSize:10,fontWeight:600,color:TM,textTransform:"uppercase",letterSpacing:0.5}}><span>Parent Task</span><span style={{textAlign:"center"}}>Objectives</span><span style={{textAlign:"center"}}>Status</span></div>
        {tasks.map(t=>{const ct=objs.filter(o=>o.linkedTaskId===t.id).length;return(<div key={t.id} style={{display:"grid",gridTemplateColumns:"1fr 100px 80px",padding:"8px 12px",borderBottom:`1px solid ${BD}`,fontSize:12,alignItems:"center"}}><span style={{color:TX}}>{t.task}</span><span style={{textAlign:"center",color:TX}}>{ct}</span><span style={{textAlign:"center"}}>{ct>0?"✅":"⚠️"}</span></div>);})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,fontSize:13}}>
        <div>{linked.length===objs.length?"✅":"⚠️"} {linked.length}/{objs.length} objectives linked to parent tasks</div>
        <div>{unlT.length===0?"✅":"⚠️"} {tasks.length-unlT.length}/{tasks.length} parent tasks have objectives</div>
      </div>
      {unlO.length>0&&<div style={{marginTop:10,background:PL,border:`1px solid ${P}22`,borderRadius:6,padding:10}}><div style={{fontSize:11,fontWeight:600,color:P,marginBottom:4}}>⚠️ {unlO.length} orphan objective{unlO.length!==1?"s":""}:</div>{unlO.map(o=><div key={o.id} style={{fontSize:12,color:P,padding:"1px 0"}}>• {o.behavior||o.freeformText||"Untitled"}</div>)}</div>}
      <CN>💡 If an objective can't trace to the business goal through a parent task, it may not belong. Orphans are the #1 cause of scope creep.</CN>
    </div>

    <div style={card}>{hdr("📈","Bloom's Distribution")}
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
        {BLOOM.map(bl=>{const c=bd[bl.level]||0;return(<div key={bl.level} style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,width:75,textAlign:"right",color:bl.color,fontWeight:600}}>{bl.level}</span><div style={{flex:1,height:20,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${(c/maxB)*100}%`,background:bl.fill,borderRadius:4,minWidth:c>0?28:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{c>0&&<span style={{fontSize:10,fontWeight:700,color:W}}>{c}</span>}</div></div><span style={{fontSize:12,color:TM,width:20,textAlign:"right"}}>{c}</span></div>);})}
      </div>
      {topB&&<div style={{fontSize:12,color:TM,fontStyle:"italic",marginBottom:10}}>💡 Weighted toward {topB[0]}. {topB[0]==="Apply"?"Appropriate for new system deployment.":"Review whether this matches training goals."}</div>}
      <div style={{border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"90px 40px 1fr",padding:"6px 10px",background:BG,borderBottom:`1px solid ${BD}`,fontSize:10,fontWeight:600,color:TM,textTransform:"uppercase"}}><span>Level</span><span style={{textAlign:"center"}}>#</span><span>Design Implication</span></div>
        {BLOOM.map((bl,i)=>(<div key={bl.level} style={{display:"grid",gridTemplateColumns:"90px 40px 1fr",padding:"6px 10px",borderBottom:i<5?`1px solid ${BD}`:"none",fontSize:12,alignItems:"start"}}><BB level={bl.level}/><span style={{textAlign:"center",color:TX,fontWeight:600}}>{bd[bl.level]||0}</span><span style={{color:TM,lineHeight:1.4}}>{bInterp[bl.level]}</span></div>))}
      </div>
      {unclass>0&&<div style={{marginTop:8,fontSize:12,color:TM}}>ℹ️ {unclass} unclassified.</div>}
    </div>

    <div style={card}>{hdr("🎯","Priority Breakdown")}
      <div style={{border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden"}}>
        {PRI.map((p,i)=>{const desc={Must:"Directly impacts business goal. Majority of seat time and assessment.",Should:"Important but survivable at go-live. Day 30 refresher candidate.","Nice to Have":"Low impact if omitted. Cut first. Consider job aid."};return(<div key={p.label} style={{display:"grid",gridTemplateColumns:"140px 1fr",padding:"10px 14px",borderBottom:i<2?`1px solid ${BD}`:"none",alignItems:"start"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span>{p.dot}</span><span style={{fontWeight:700,color:p.color,fontSize:13}}>{p.label}: {pc[p.label]}</span></div><span style={{fontSize:12,color:TM,lineHeight:1.4}}>{desc[p.label]}</span></div>);})}
      </div>
      {noPri>0&&<div style={{marginTop:8,fontSize:12,color:TM}}>ℹ️ {noPri} without priority.</div>}
    </div>

    <div style={card}>{hdr("📋","Assessment Alignment")}
      <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:13}}>
        <div>{needA.length} objective{needA.length!==1?"s":""} flagged for formal assessment</div>
        {highNA.length>0&&<><div>⚠️ {highNA.length} high-Bloom without assessment:</div>{highNA.map(o=><div key={o.id} style={{fontSize:12,color:"#92400e",paddingLeft:20}}>• {o.bloomLevel}: {(o.behavior||o.freeformText||"").substring(0,60)}…</div>)}</>}
        <div>— {objs.length-needA.length} without formal assessment requirement</div>
      </div>
      <CN>💡 Assessment type assigned in Assessment Builder. Apply+ requires performance observation, not multiple-choice.</CN>
    </div>

    <div style={card}>{hdr("🔗","Task Analysis Sync")}
      <div style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:TX}}><span>⚠️</span><div>Task Analysis not yet completed. Objectives based on Needs Analysis data and manual breakdown.<div style={{marginTop:8}}><button style={{padding:"6px 14px",fontSize:12,fontWeight:600,fontFamily:F,color:W,background:P,border:"none",borderRadius:4,cursor:"pointer"}}>Start Task Analysis →</button></div></div></div>
    </div>
  </div>);
}

// ═══ SCREEN 6: Export ═══════════════════════════════════════════
function Screen6({objs,tasks,onCreateObjective}){
  const orphanTasks=tasks.filter(t=>!objs.some(o=>o.linkedTaskId===t.id));
  const grouped={};objs.forEach(o=>{const tk=o.linkedTaskId?tasks.find(t=>t.id===o.linkedTaskId)?.task:"Ungrouped";if(!grouped[tk])grouped[tk]=[];grouped[tk].push(o);});
  const actions=[
    {icon:"📝",label:"Push to Storyboard",desc:"Each objective seeds a module block in the storyboard editor"},
    {icon:"📋",label:"Push to Assessment Builder",desc:`${objs.filter(o=>o.requiresAssessment).length} assessed objectives create assessment stubs`},
    {icon:"📄",label:"Export Objectives Table",desc:"Download as .docx or .pdf for stakeholder review"},
    {icon:"📎",label:"Copy to Design Strategy",desc:"Insert into HLDD objectives section"},
  ];
  return(<div style={{padding:"20px 24px",fontFamily:F,maxWidth:820,margin:"0 auto"}}>
    <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:TX}}>Export & Downstream Handoff</h2>
    <p style={{fontSize:13,color:TM,margin:"0 0 16px"}}>Export always works regardless of completeness. Missing fields are blank, not blocked.</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      {actions.map(a=>(<button key={a.label} style={{display:"flex",alignItems:"flex-start",gap:10,padding:16,background:W,border:`1px solid ${BD}`,borderRadius:8,cursor:"pointer",textAlign:"left",fontFamily:F}}>
        <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
        <div><div style={{fontSize:13,fontWeight:600,color:TX}}>{a.label}</div><div style={{fontSize:11,color:TM,marginTop:2}}>{a.desc}</div></div>
      </button>))}
    </div>

    {/* Orphan warning — below push cards, above all objectives */}
    {orphanTasks.length>0&&(<div style={{marginBottom:16,padding:"14px 18px",background:"#fefce8",border:"1px solid #fef08a",borderRadius:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:14}}>⚠️</span><span style={{fontSize:13,fontWeight:700,color:"#ca8a04"}}>{orphanTasks.length} parent task{orphanTasks.length!==1?"s":""} from Needs Analysis have no matching objectives:</span></div>
      {orphanTasks.map(t=><div key={t.id} style={{fontSize:12,color:"#92400e",padding:"2px 0 2px 26px"}}>• {t.task}</div>)}
      <div style={{marginTop:10,paddingLeft:26}}><button onClick={onCreateObjective} style={{padding:"6px 14px",fontSize:12,fontWeight:600,fontFamily:F,color:W,background:P,border:"none",borderRadius:4,cursor:"pointer"}}>Create Objectives</button></div>
    </div>)}

    <div style={{background:W,border:`1px solid ${BD}`,borderRadius:8,padding:20}}>
      <div style={{fontSize:14,fontWeight:700,color:TX,marginBottom:14}}>All Objectives ({objs.length})</div>
      {Object.entries(grouped).map(([taskName,items])=>(<div key={taskName} style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:P,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${BD}`}}>Parent Task: {taskName}</div>
        {items.map(o=>{const txt=o.freeformText||(o.condition?o.condition+", ":"")+(o.audience||AUD[0])+" will "+(o.behavior||"[behavior]")+(o.criteria?", "+o.criteria:"");return(
          <div key={o.id} style={{padding:"8px 0",borderBottom:`1px solid ${BD}22`}}>
            <div style={{fontSize:13,color:TX,lineHeight:1.5}}>{txt}</div>
            <div style={{display:"flex",gap:6,marginTop:4}}>{o.bloomLevel&&<BB level={o.bloomLevel}/>}{o.priority&&<PB priority={o.priority}/>}{o.requiresAssessment&&<span style={{fontSize:10,color:"#0891b2",fontFamily:F,fontWeight:500}}>📋 Assess</span>}</div>
          </div>);})}
      </div>))}
    </div>
  </div>);
}

// ═══ MAIN APP ═══════════════════════════════════════════════════
export default function LearningObjectivesWizard(){
  const[step,setStep]=useState("context");
  const[gapTypes,setGapTypes]=useState({knowledge:false,skill:false});
  const[triageItems,setTriageItems]=useState([
    {id:"tri1",text:"Navigate the mySFS portal",column:"must",source:"NA"},
    {id:"tri2",text:"Authenticate customers via login widget",column:"must",source:"NA"},
    {id:"tri3",text:"Process payments through Repay",column:"should",source:"NA"},
    {id:"tri4",text:"Handle IVR portal questions",column:"should",source:"NA"},
    {id:"tri5",text:"Troubleshoot login errors",column:"must",source:"NA"},
    {id:"tri6",text:"Explain payment timelines",column:"nice",source:"NA"},
    {id:"tri7",text:"Escalate unresolved issues per SLA",column:"should",source:"NA"},
  ]);
  const[subTasks,setSubTasks]=useState([
    {id:"sub1",parentId:"tri1",text:"Open mySFS portal URL",isNew:"New",sort:1},
    {id:"sub2",parentId:"tri1",text:"Enter customer ID in search",isNew:"New",sort:2},
    {id:"sub3",parentId:"tri1",text:"Verify account matches customer",isNew:"New",sort:3},
    {id:"sub4",parentId:"tri2",text:"Click login widget in toolbar",isNew:"New",sort:1},
    {id:"sub5",parentId:"tri2",text:"Enter customer email",isNew:"New",sort:2},
    {id:"sub6",parentId:"tri2",text:"Verify security questions",isNew:"New",sort:3},
    {id:"sub7",parentId:"tri2",text:"Confirm authentication success",isNew:"Already can do",sort:4},
  ]);
  const[objs,setObjs]=useState(INIT_OBJ);
  const[selId,setSelId]=useState("1");
  const[soOpen,setSoOpen]=useState(false);
  const[soTab,setSoTab]=useState("project");
  const[showAI,setShowAI]=useState(false);
  const[theory,setTheory]=useState("bloom");
  const[audMode,setAudMode]=useState("picklist");

  const openNA=(tab)=>{setSoTab(tab||"project");setSoOpen(true);};

  // Create Objectives from Export: navigate to builder + add blank objective
  const createObjFromExport=()=>{
    const n={id:`${Date.now()}`,audience:"",behavior:"",verb:"",bloomLevel:"",bloomKnowledge:"",condition:"",criteria:"",priority:"Should",requiresAssessment:false,rationale:"",wiifm:"",linkedTaskId:null,freeformText:""};
    setObjs(p=>[...p,n]);setSelId(n.id);setStep("builder");
  };

  const status=useMemo(()=>{const s={};s.context=(gapTypes.knowledge||gapTypes.skill)?"done":"none";s.priority=triageItems.some(i=>i.column!=="nice")?"done":"none";s.tasks=subTasks.length>0?"progress":"none";s.builder=objs.length>0?"progress":"none";s.validation=objs.length>0?"progress":"none";s.export="none";return s;},[gapTypes,triageItems,subTasks,objs]);

  const nextStep=()=>{const i=STEPS.findIndex(s=>s.key===step);if(i<STEPS.length-1)setStep(STEPS[i+1].key);};
  const prevStep=()=>{const i=STEPS.findIndex(s=>s.key===step);if(i>0)setStep(STEPS[i-1].key);};
  const skipToBuilder=()=>setStep("builder");

  return(
    <div style={{fontFamily:F,height:"100vh",display:"flex",flexDirection:"column",backgroundColor:BG,color:TX}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px",backgroundColor:W,borderBottom:`1px solid ${BD}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:6,height:24,backgroundColor:P,borderRadius:2}}/><span style={{fontSize:15,fontWeight:700,color:TX}}>Learning Objectives</span><span style={{fontSize:11,color:TM}}>mySFS Portal Training</span></div>
        <div style={{display:"flex",gap:6}}>
          <NABtn onClick={()=>openNA("project")}/>
          <button style={{padding:"5px 14px",fontSize:12,fontFamily:F,fontWeight:600,color:W,backgroundColor:P,border:"none",borderRadius:4,cursor:"pointer"}}>Save</button>
        </div>
      </div>
      {/* Stepper */}
      <Stepper step={step} onChange={setStep} status={status}/>
      {/* Nav bar: Back / Continue / Skip */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"6px 20px",backgroundColor:W,borderBottom:`1px solid ${BD}`,gap:6,flexShrink:0}}>
        {step!=="context"&&<button onClick={prevStep} style={{padding:"4px 12px",fontSize:11,fontFamily:F,color:TM,background:W,border:`1px solid ${BD}`,borderRadius:4,cursor:"pointer"}}>← Back</button>}
        {step!=="export"&&<button onClick={nextStep} style={{padding:"4px 12px",fontSize:11,fontFamily:F,fontWeight:600,color:W,background:P,border:"none",borderRadius:4,cursor:"pointer"}}>Continue →</button>}
        {step!=="builder"&&step!=="validation"&&step!=="export"&&<button onClick={skipToBuilder} style={{padding:"4px 12px",fontSize:11,fontFamily:F,color:TM,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>skip to builder</button>}
      </div>
      {/* Content */}
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        {step==="context"&&<Screen1 gapTypes={gapTypes} setGapTypes={setGapTypes}/>}
        {step==="priority"&&<Screen2 triageItems={triageItems} setTriageItems={setTriageItems}/>}
        {step==="tasks"&&<Screen3 triageItems={triageItems} subTasks={subTasks} setSubTasks={setSubTasks} openNA={openNA}/>}
        {step==="builder"&&<Screen4 objs={objs} setObjs={setObjs} selId={selId} setSelId={setSelId} openNA={openNA} showAI={showAI} setShowAI={setShowAI} theory={theory} setTheory={setTheory} audMode={audMode} setAudMode={setAudMode}/>}
        {step==="validation"&&<Screen5 objs={objs} tasks={NA_TASKS}/>}
        {step==="export"&&<Screen6 objs={objs} tasks={NA_TASKS} onCreateObjective={createObjFromExport}/>}
      </div>
      <SlideOver visible={soOpen} onClose={()=>setSoOpen(false)} defaultTab={soTab}/>
    </div>
  );
}
