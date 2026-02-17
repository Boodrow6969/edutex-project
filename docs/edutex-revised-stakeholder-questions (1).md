# EDUTex Stakeholder Needs Analysis — Revised Token Form Questions
## New System / Software Deployment Type

**Document Purpose:** Revised question set for the stakeholder-facing token form, incorporating gaps identified by comparing the current token form against the real-world PDF needs analysis (Lease Maturity Customer Portal project, completed by Kelly Bennett).

**Architecture Note:** The form uses static sections (all training types) and dynamic sections (type-specific). This document covers the **New System/Software Deployment** type. Questions marked [STATIC] appear for all types. Questions marked [DYNAMIC] appear only for this type.

---

## Section 1: Project Context [STATIC]

### 1.1 Project Name *
**Question:** What is the name of this project or initiative?

**Guidance:** Give this project a short, descriptive name so everyone can reference it easily. It doesn't need to be the final course title.

*Examples: "2026 Salesforce Migration Training," "Q3 Safety Policy Update," "New Hire Onboarding Redesign"*

> **Status:** Unchanged.

---

### 1.2 Executive Sponsor *
**Question:** Who is the executive sponsor or leader requesting this training?

**Guidance:** This is the leader who initiated or approved this training request. They're typically the person accountable for the business outcome the training supports.

*Examples: "Maria Chen, VP of Operations," "Tom Parker, Director of Compliance"*

> **Status:** Unchanged.

---

### 1.3 Your Role *
**Question:** What is your role in relation to this training project?

**Guidance:** Select the role that best describes your relationship to this project.

**Options:**
- Executive Sponsor (I approved or initiated this request)
- Department Manager (I manage the team that needs training)
- Subject Matter Expert (I have deep knowledge of the content area)
- Project Manager (I'm coordinating the initiative this training supports)
- Other (please describe in the next field)

> **Status:** Unchanged.

---

### 1.4 Target Date *
**Question:** What is the target date or deadline for this training to be available?

**Guidance:** If there's a specific date this training needs to be ready (like a system go-live or regulatory deadline), enter it here. If it's more of a general timeframe, describe that instead.

*Examples: "March 15, 2026 — system go-live," "By end of Q2, flexible on exact date"*

> **Status:** Unchanged.

---

## Section 2: About the System [DYNAMIC — New System]

### 2.1 System Name and Purpose *
**Question:** What system, software, or tool is being introduced? In one or two sentences, what is its main purpose?

**Guidance:** Provide the name of the system being deployed, including version if known. If it's custom-built, describe what it does.

*Examples: "Salesforce Lightning — migrating from Classic," "Workday HCM — new implementation," "Custom warehouse management app built by our internal dev team"*

> **Status:** Combined from current form + PDF 1.1/1.2.

---

### 2.2 System Capabilities *
**Question:** What are the system's main functions or capabilities? List the key things people can do in it.

**Guidance:** Think about what the system lets users accomplish — not feature names, but actions. List as many as you can.

*Examples: "Create and assign support tickets, run weekly performance reports, update customer records after calls"*

> **Status:** NEW. Current form asks about tasks/workflows but not the system's overall capability set. The PDF (1.3) captured a rich capability list that informed every downstream design decision. Capabilities first, then "which of these must people do."

---

### 2.3 What Does This Replace? *
**Question:** What existing tools, systems, or processes does this replace? If it's entirely new functionality, describe what people do today without it.

**Guidance:** Help us understand what changes for the learners. Are they switching from one system to another, or learning something entirely new?

*Examples: "Replacing our legacy Excel-based tracking with a proper CRM," "This is an addition — they'll keep using current tools but add this for reporting," "Currently done manually with paper forms"*

> **Status:** Unchanged.

---

### 2.4 Connected Systems
**Question:** What other systems does this connect to or interact with?

**Guidance:** List any systems that send data to or receive data from the new system. This helps us understand the broader workflow and identify where handoffs or errors might occur.

*Examples: "Salesforce connects to our ERP for order data and to Marketo for marketing automation," "The portal pulls from the servicing system and sends payments through a third-party processor"*

> **Status:** NEW. Absent from current form. The PDF captured critical integration points (defi Servicing, Repay, EDW, EDMS) that directly shaped training scope — the Repay integration alone became a separate training track.

---

## Section 3: Business Justification [DYNAMIC — New System]

### 3.1 Business Problem *
**Question:** What business problem does this system solve? What inefficiency, cost, or limitation does it address?

**Guidance:** Help us understand why this system matters. What's broken, slow, expensive, or missing today that this system fixes?

*Examples: "Customer satisfaction is low because they can only pay by one method," "We're spending 40 hours/week on manual data entry that this automates," "We have no visibility into field operations without this dashboard"*

> **Status:** NEW. Biggest gap in current form. The PDF's Section 2 captured critical context (low customer satisfaction, lack of payment options, no lease-end visibility) that shaped the entire training strategy.

---

### 3.2 Consequences of Poor Employee Adoption *
**Question:** What are the consequences if employees struggle to use this system effectively?

**Guidance:** Think about what happens to the business if your internal team can't use the system well after launch. Consider impact on customers, call volume, processing times, errors, and compliance.

*Examples: "Delayed customer service, increased call times," "Payment processing errors that affect revenue," "Compliance findings in the next audit"*

> **Status:** NEW. PDF (2.2) captured critical info: increased support calls, downstream payment processing impacts. Feeds directly into training priority and risk assessment.

---

### 3.3 Consequences of Poor Customer/End-User Adoption
**Question:** If this system has external users (customers, partners, vendors), what are the consequences if they struggle to use it?

**Guidance:** Not all systems have external users — skip this if yours is internal only. If there are external users, think about what happens when they get stuck.

*Examples: "Increased support calls, customer frustration, abandoned transactions," "Partners stop using the portal and revert to email/phone"*

> **Status:** NEW. PDF asked this separately from employee consequences (2.3) and got different, actionable info. Conditional — not all projects have external users.

---

### 3.4 Success Metrics *
**Question:** How will you measure success after launch? What specific metrics or observable changes would tell you this worked?

**Guidance:** Think beyond "people completed the training." What business metric would improve? What would you see people doing differently? Be as specific as you can.

*Examples: "Call resolution time drops from 12 minutes to 8 minutes," "Self-service portal usage reaches 60% within 90 days," "Autopay enrollment increases by 25%," "Zero payment processing errors in the first 30 days"*

> **Status:** MODIFIED. Current form asks vague "How will you know this training was successful?" This version pushes for specific, measurable metrics.

---

## Section 4: What Users Need to Do [DYNAMIC — New System]

### 4.1 Critical Tasks *
**Question:** What are the main tasks or workflows people will need to perform in the new system?

**Guidance:** Think about a typical day or week. What does someone actually do in this system? If different roles do different things, list them separately.

*Examples: "Create and assign support tickets, run weekly performance reports, update customer records after calls, escalate cases that meet certain criteria"*

> **Status:** Unchanged. Wording tightened.

---

### 4.2 High-Stakes Situations *
**Question:** What are the most complex or high-stakes situations? Where would mistakes be costly or visible?

**Guidance:** Help us identify where we need to focus extra training attention. What tasks, if done wrong, would cause the most damage?

*Examples: "Processing a payment incorrectly could result in double-charges," "Approving the wrong access level could create a security breach," "Submitting incorrect regulatory data triggers an audit"*

> **Status:** NEW. PDF (3.4) surfaced the payment processing risk. Directly informs assessment design and practice scenario priorities.

---

### 4.3 Acceptable Performance at Launch *
**Question:** What does "proficient use" look like by the go-live date? What should people be able to do independently?

**Guidance:** Be realistic — we can always build advanced training later. Focus on the must-haves for Day 1.

*Examples: "Create, edit, and close a support ticket. Search for existing tickets. Run the daily queue report. That's it for go-live — advanced reporting can wait."*

> **Status:** Unchanged.

---

### 4.4 Proficient Performance at 30 Days
**Question:** What does proficient performance look like 30 days after launch? What additional capabilities should people have by then?

**Guidance:** After a month of use, what should people be able to do beyond the Day 1 basics? This helps us plan follow-up training, advanced modules, or performance support.

*Examples: "Handle edge cases without escalating," "Run and interpret advanced reports," "Troubleshoot common errors independently"*

> **Status:** NEW. PDF split launch (3.5) from 30-day (3.6) performance and got meaningfully different answers. Critical for phasing training delivery.

---

## Section 5: Who Will Use This System [STATIC — enhanced]

### 5.1 Audience by Role *
**Question:** What job roles will use this system? For each role, provide the approximate number of users and how often they'll use it.

**Format:** Repeating row fields:

| Role / Title | Approx. # of Users | Frequency (Daily / Weekly / Occasionally) |
|---|---|---|

**Guidance:** Include everyone who will interact with the system, even occasionally.

> **Status:** MODIFIED. Current form is a single open text field. PDF's tabular format (4.1) produced far more actionable data.

---

### 5.2 Role-Based Differences
**Question:** Do different roles use the system differently? If yes, describe how usage differs by role.

**Options:**
- No, everyone uses it the same way
- Yes (please describe)

**Guidance:** If some roles need deeper training on certain features, or use the system in a completely different way, tell us here. This determines whether we build one training track or several.

*Example: "All teams need payment processing training. But CS Support and Maturity teams also need detailed portal training so they can answer customer questions."*

> **Status:** NEW. PDF (4.2) captured critical role-based training differentiation.

---

### 5.3 Technology Comfort Level *
**Question:** How would you describe the typical user's comfort level with technology?

**Options:**
- Very comfortable — picks up new systems quickly
- Moderate — needs some guidance but adapts
- Limited — will need significant support and practice

> **Status:** NEW. Absent from current form. Present in PDF (4.3).

---

### 5.4 Prior System Experience
**Question:** Are users currently using a similar system that this replaces? If yes, how long have they used it?

**Options:**
- Yes — How long? ___
- No, this is their first system of this type

**Guidance:** If people are switching from a familiar system, we can focus on what's different. If it's entirely new, we need more ground-up instruction.

> **Status:** NEW. Absent from current form. Present in PDF (4.4).

---

### 5.5 Change Champions / Super Users
**Question:** Will there be super users, power users, or Change Champions who support others during and after the transition? If so, have they been identified?

**Options:**
- Yes — Who? ___
- No
- Not yet determined

**Guidance:** Change Champions get extra training ahead of the rollout so they can coach others. If you're planning them, let us know — they need their own training track.

> **Status:** MODIFIED. Currently buried in "Who else should we involve?" Separated because Change Champions require their own training timeline.

---

### 5.6 Post-Go-Live Support Structure *
**Question:** What support will be available to users after go-live?

**Guidance:** What resources will users have when they get stuck?

*Examples: "IT help desk dedicated queue for 30 days," "Vendor 24/7 chat for 90 days," "IVR option routing to internal support team," "No dedicated support — rely on training and job aids"*

> **Status:** MODIFIED. Separated from Change Champions. PDF (4.6) captured detailed IVR routing plan.

---

## Section 6: Rollout Plan [STATIC]

### 6.1 Rollout Approach *
**Question:** How will the system be rolled out?

**Options:**
- Big bang — everyone goes live at once
- Phased — groups go live at different times
- Pilot first, then broader rollout
- Not yet determined

> **Status:** Unchanged.

---

### 6.2 Phase Details (if phased or pilot)
**Question:** If phased or pilot, which groups go first and when?

**Format:** Repeating row fields:

| Group | Target Go-Live Date |
|---|---|

> **Status:** Unchanged.

---

### 6.3 Training-to-Go-Live Timing *
**Question:** When do users need to complete training relative to their go-live date?

**Guidance:** How far in advance should training be completed? Too early and people forget; too late and they're not ready.

*Examples: "1 week before go-live," "Same week," "2 weeks before, with refresher the day before"*

> **Status:** NEW. Absent from current form. PDF (5.3): "1 week seems ok — don't want to do it further in advance or they will forget."

---

## Section 7: Training Constraints and Resources [STATIC — expanded]

### 7.1 Delivery Format Preference
**Question:** Do you have a preference for how this training is delivered? Select any formats that would work. If different roles need different formats, note that.

**Options:**
- Self-paced eLearning
- Virtual instructor-led (live online session)
- In-person classroom
- Blended (combination of formats)
- Job aid / quick reference guide
- Video / recorded walkthrough
- On-the-job coaching or mentoring
- No preference — recommend what works best

> **Status:** MODIFIED. Added prompt for role-specific format needs.

---

### 7.2 Training Environment / Sandbox *
**Question:** Can the training team get access to a demo environment or sandbox?

**Options:**
- Yes — available now
- Yes — but not until: ___ (date)
- No — we'll work from documentation and demos
- Unsure — I need to check with IT/the vendor

> **Status:** MODIFIED. Added date field for "not until" option.

---

### 7.3 Realistic Data Availability
**Question:** Can we use realistic (or realistic-looking) data in training?

**Options:**
- Yes
- No — we will need to use dummy data
- Don't know

> **Status:** NEW. Absent from current form. Present in PDF (6.3).

---

### 7.4 Existing Documentation
**Question:** Does any training, documentation, or reference material already exist for this topic?

**Guidance:** List anything related — even if outdated.

*Examples: "2023 onboarding deck in SharePoint," "Vendor user guide PDF," "Nothing formal — tribal knowledge"*

> **Status:** Unchanged.

---

### 7.5 Vendor-Provided Training
**Question:** Does the vendor provide any training, documentation, or learning resources?

**Guidance:** List vendor-provided resources — webinars, help articles, certification courses, videos, user guides.

*Examples: "Vendor offers a 3-day admin certification," "Online help center," "1-hour recorded demo," "Nothing useful — developer-facing docs"*

> **Status:** Unchanged.

---

### 7.6 Scheduling Constraints
**Question:** Are there scheduling constraints or blackout dates we should know about?

**Guidance:** Dates or periods when training cannot be scheduled.

*Examples: "Cannot release at month-end/month-start," "Avoid the 15th — heavy payment day," "Holiday freeze Dec 15 – Jan 5"*

> **Status:** NEW. Absent from current form. PDF (6.6) captured payment-date constraints.

---

### 7.7 Training Budget
**Question:** Is there a training budget allocated?

**Options:**
- Yes — Amount or range: ___
- No dedicated budget
- Don't know

> **Status:** NEW. Absent from current form. Present in PDF (6.7).

---

### 7.8 Other Constraints
**Question:** Are there any other constraints, limitations, or special considerations?

**Guidance:** Technology, language, accessibility, organizational factors, anything else.

*Examples: "30-minute windows between shifts," "Must be in English and Spanish," "Some learners don't have laptops"*

> **Status:** Retained as catch-all after specific constraint questions.

---

## Section 8: Subject Matter Experts and Stakeholders [STATIC]

### 8.1 Subject Matter Experts
**Question:** Who are the subject matter experts we can work with?

**Format:** Repeating row fields:

| Name | Role | Best Contact Method |
|---|---|---|

> **Status:** MODIFIED. Separated from approvers. PDF (6.5) has dedicated SME table.

---

### 8.2 Reviewers and Approvers
**Question:** Who else should we involve? Please distinguish between people who provide input/expertise and people with approval authority.

**Guidance:** Training projects move fastest when there's a clear distinction between input and approval. When too many people have approval authority, feedback conflicts and timelines stall.

*Examples: "Jake Torres, Senior Analyst — input/expertise," "Maria Lopez, VP Operations — final approver," "Legal — approval on compliance language only"*

> **Status:** Retained. Input vs. approval distinction is a current form strength.

---

## Section 9: Concerns and Final Thoughts [STATIC]

### 9.1 Concerns
**Question:** What concerns do you have about this rollout or the training?

**Guidance:** What's the biggest risk? Telling us now helps us plan for it.

*Examples: "Scope across so many teams," "Getting third-party materials on time," "Not enough time"*

> **Status:** NEW as standalone. PDF (7.1) captured scope anxiety and coordination risks.

---

### 9.2 Success Definition
**Question:** What would make this training a success in your eyes?

**Guidance:** Beyond metrics — what would you personally need to see or hear to feel confident?

*Examples: "Business stakeholders feel their teams are prepared," "No surprises on go-live day," "Call center doesn't get overwhelmed week one"*

> **Status:** NEW as standalone. PDF (7.2) captured a qualitative stakeholder-confidence metric distinct from quantitative metrics in 3.4.

---

### 9.3 Anything Else
**Question:** Is there anything else we should know?

> **Status:** Retained.

---

## Change Summary

### Added (11 new questions):
| # | Question | Rationale |
|---|---|---|
| 2.2 | System Capabilities | Rich capability list drove all design decisions in PDF |
| 2.4 | Connected Systems | Integration points created separate training tracks |
| 3.1 | Business Problem | No business justification existed — biggest gap |
| 3.2 | Consequences (Employee) | Failure impact drives training priority |
| 3.3 | Consequences (Customer) | Different from employee consequences; conditional |
| 4.2 | High-Stakes Situations | Identifies practice/assessment focus areas |
| 4.4 | 30-Day Proficiency | Launch vs. 30-day split enables phased training |
| 7.3 | Realistic Data | Affects development timeline |
| 7.6 | Scheduling Constraints | Prevents go-live scheduling conflicts |
| 7.7 | Training Budget | Low-effort, prevents scope misalignment |
| 9.1 | Concerns | Captures risk early |

### Modified (6 questions):
| # | Question | Change |
|---|---|---|
| 3.4 | Success Metrics | Pushes for specific measurable metrics |
| 5.1 | Audience by Role | Structured table replaces open text |
| 5.5 | Change Champions | Separated from "who else" question |
| 5.6 | Post-Go-Live Support | Separated from Change Champions |
| 7.1 | Delivery Format | Added role-specific format prompt |
| 7.2 | Sandbox | Added date field for "not yet" option |

### New Static questions (applicable to all types):
| # | Question | Rationale |
|---|---|---|
| 5.2 | Role-Based Differences | Determines single vs. multi-track training |
| 5.3 | Technology Comfort Level | Calibrates design complexity |
| 5.4 | Prior System Experience | Affects instructional framing |
| 6.3 | Training-to-Go-Live Timing | Affects delivery scheduling |
| 8.1 | SME Contacts (separated) | Cleaner than combining with approvers |
| 9.2 | Success Definition (qualitative) | Captures stakeholder-confidence metric |

### Retained strengths from current form:
- Training type detection/routing
- Executive sponsor field
- Respondent role classification
- Input vs. approval authority distinction
- Vendor training resources question

### Removed: None.

---

## Total Question Count

| Section | Count | Static/Dynamic |
|---|---|---|
| 1. Project Context | 4 | Static |
| 2. About the System | 4 | Dynamic |
| 3. Business Justification | 4 | Dynamic |
| 4. What Users Need to Do | 4 | Dynamic |
| 5. Who Will Use This System | 6 | Static (enhanced) |
| 6. Rollout Plan | 3 | Static |
| 7. Constraints and Resources | 8 | Static (expanded) |
| 8. SMEs and Stakeholders | 2 | Static |
| 9. Concerns and Final Thoughts | 3 | Static |
| **TOTAL** | **38** | 12 Dynamic + 26 Static |

Of these, 22 are required (*), 16 are optional. Estimated completion time: 25-35 minutes.
