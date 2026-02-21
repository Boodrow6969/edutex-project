# EDUTex Dummy Stakeholder Data — All 4 Training Types

**Context:** All scenarios take place at **Apex Financial Services**, a captive auto finance company. Each represents a different department/group with a different training type.

---

---

# TYPE 1: NEW SYSTEM / SOFTWARE DEPLOYMENT

**Scenario:** The Retail Lending division is deploying a new dealer portal ("DealerConnect") that replaces the legacy fax-and-email funding process.

---

## STATIC / SHARED QUESTIONS

### SHARED_01 — Project Name
Dealer portal migration to DealerConnect & funding workflow update

### SHARED_02 — Requesting Department
Retail Lending — Karen Wallace, Sr. Product Manager

### SHARED_03 — Target Completion Date
7/15/2026

### SHARED_04 — Why Now?
The legacy funding process relies on fax transmissions and manual email attachments for deal packages. Dealers complain about turnaround time, and we lose contracts to competitors who fund same-day. DealerConnect enables electronic deal submission, real-time status tracking, and automated stipulation management. The board approved the platform in Q3 2025 as part of the digital transformation initiative.

### SHARED_05 — What Happens If We Do Nothing?
Dealer satisfaction scores continue to decline (currently 62%, target 80%). We lose market share to competitors with faster funding. Manual processing errors cost approximately $340K annually in rework and buybacks. Compliance risk increases as fax-based document handling doesn't meet updated CFPB record-retention requirements.

### SHARED_06 — Audience by Role Table
| Role | Headcount | Frequency |
|---|---|---|
| Funding Analysts | ~45 | Daily |
| Credit Underwriters | ~30 | Daily |
| Dealer Relationship Managers | ~20 | Daily |
| Funding Operations Supervisors | ~8 | Daily |
| Dealer Principal/F&I Managers (external) | ~500 | Daily |

### SHARED_07 — Do Different Roles Need Different Training?
Yes. Funding Analysts need the deepest training — they process every deal through DealerConnect from submission to funding. Credit Underwriters interact with the credit decision module only. Dealer Relationship Managers need enough knowledge to support dealers and troubleshoot issues. Supervisors need reporting and exception-handling views. External dealer users get a separate onboarding track focused on deal submission and status tracking.

### SHARED_08 — Technology Comfort Level
Funding Analysts and Underwriters: Moderate to High — they use the current LOS daily. DRMs: High — they're already on Salesforce CRM. Dealer F&I Managers: Variable — ranges from very tech-savvy at large dealer groups to paper-heavy at small independents.

### SHARED_09 — Prior System Experience
All internal staff have used the legacy LOS (LoanStar) for 3+ years. Dealers have used our current fax/email process; some also use RouteOne or DealerTrack for other lenders. DealerConnect replaces LoanStar for deal submission and adds features that don't exist today.

### SHARED_10 — Change Champions
Yes — Marcus Chen (Senior Funding Analyst, 12 years) and Diane Okafor (DRM, very respected by dealer network). Both participated in UAT and are enthusiastic about the platform. Marcus can demo internal workflows; Diane can speak dealer language.

### SHARED_11 — Post-Go-Live Support
Dedicated DealerConnect help desk for first 90 days (internal and dealer-facing). Knowledge base articles being developed by product team. Diane Okafor will run weekly "office hours" for dealer questions during the first month.

### SHARED_12 — Rollout Plan
| Phase | Target Date | Audience |
|---|---|---|
| Phase 1: Pilot | 5/15/2026 | Top 25 dealers by volume + Funding Team A (15 analysts) |
| Phase 2: Regional | 6/15/2026 | Remaining Midwest dealers + all Funding Analysts |
| Phase 3: National | 7/15/2026 | All remaining dealers + Underwriters + DRMs |

### SHARED_13 — Sandbox / Practice Environment
UAT environment available starting 4/1/2026. Product team confirmed it will have realistic dealer data and sample deal packages. Dealers will get a sandbox with test VINs and dummy customer records.

### SHARED_14 — Realistic Data in Sandbox?
Yes — product team is building a data set with 200 sample deals across different vehicle types, credit tiers, and program types. Includes deals that trigger common exceptions (missing stips, credit freeze, duplicate applications).

### SHARED_15 — Vendor Training
DealerConnect vendor (TechDrive Solutions) will provide a 2-hour admin training for IT and a 1-hour platform overview webinar. We need to build everything else specific to our workflows and policies.

### SHARED_16 — Delivery Format Preference
Internal: Virtual instructor-led for Funding Analysts (hands-on practice needed). eLearning for Underwriters and DRMs (narrower scope). Supervisors: Short reference guide + dashboard walkthrough.
External dealers: Self-paced eLearning + quick-start job aid. Can't pull F&I managers into scheduled training — they need on-demand.

### SHARED_17 — Constraints or Limitations
Cannot deploy training during month-end close (last 3 business days of any month). UAT environment not stable until 4/1/2026. Dealer training must be completable in under 30 minutes — dealers won't commit more than that. All training must be accessible on tablets (dealers often work from the showroom floor).

### SHARED_18 — Existing Materials or Training
LoanStar training materials exist but are outdated (last updated 2023). DealerConnect vendor has generic platform documentation — not customized to our workflows. Product team has screen mockups and a process flow diagram.

### SHARED_19 — Key SMEs or Contacts
| Name | Role | Contact | Expertise |
|---|---|---|---|
| Karen Wallace | Sr. Product Manager | karen.wallace@apexfs.com | Business requirements, roadmap |
| Marcus Chen | Senior Funding Analyst | marcus.chen@apexfs.com | Current funding workflow, power user |
| Diane Okafor | Dealer Relationship Mgr | diane.okafor@apexfs.com | Dealer perspective, change champion |
| Raj Mehta | IT Lead — DealerConnect | raj.mehta@apexfs.com | Technical integration, environment access |
| Vince Palermo | Compliance Officer | vince.palermo@apexfs.com | Regulatory requirements for deal docs |

### SHARED_20 — Additional Concerns
The biggest risk is dealer adoption. If dealers keep faxing because it's easier, the whole initiative fails. Training needs to demonstrate that DealerConnect is genuinely faster. Also, some funding analysts are anxious about losing their "system expertise" — they're the LoanStar power users and feel threatened by the change.

---

## NEW SYSTEM DYNAMIC QUESTIONS

### SYS_01 — System Name and Purpose
DealerConnect — a web-based dealer portal for electronic auto loan deal submission, real-time funding status, stipulation management, and automated document collection. Built by TechDrive Solutions, hosted in our AWS environment.

### SYS_02 — Key Capabilities
Electronic deal package submission (no more fax), real-time funding pipeline with status tracking, automated stipulation checklist with dealer upload portal, integrated credit decision display, e-contracting module, reporting dashboard for dealers and internal teams, API integration with our LOS and DMS systems.

### SYS_03 — What It Replaces
Replaces the current fax/email deal submission process and the dealer-facing portion of LoanStar. Internal funding workflows in LoanStar remain but now receive deals electronically from DealerConnect instead of from manual data entry.

### SYS_04 — Connected Systems
LoanStar (legacy LOS — receives funded deals), Salesforce CRM (dealer contact records), Equifax/TransUnion (credit pulls), RouteOne/DealerTrack (some dealers will submit through these and they feed into DealerConnect via API), DocuSign (e-contracting).

### SYS_05 — Business Goal Driving Deployment
Reduce average funding turnaround from 72 hours to under 24 hours. Increase dealer satisfaction from 62% to 80%+. Reduce processing errors by 60%. Meet CFPB electronic record-retention requirements by EOY 2026.

### SYS_06 — Consequences If Employees Struggle
Deals get stuck in the pipeline. Dealers call their DRM complaining, then call competitors. Funding errors increase (wrong amounts, missing documents) leading to buyback risk. Supervisors become bottlenecks handling exceptions that analysts should resolve independently.

### SYS_07 — Consequences If External Users (Dealers) Struggle
Dealers revert to faxing — defeats the entire initiative. They badmouth the platform to other dealers. Worst case: they route volume to competing lenders. Small independent dealers with less tech support may drop us entirely.

### SYS_08 — Success Metrics Post-Launch
| Metric | Current | 30-Day Target | 90-Day Target |
|---|---|---|---|
| Electronic submission rate | 0% | 60% | 90% |
| Avg funding turnaround | 72 hrs | 36 hrs | 24 hrs |
| Dealer satisfaction score | 62% | 70% | 80% |
| Processing error rate | 4.2% | 2.5% | 1.5% |
| Help desk call volume | N/A | Declining trend | <20/day |

### SYS_09 — Typical User Scenario / Walkthrough
A dealer F&I manager completes a sale, opens DealerConnect, selects the lending program, enters deal structure (vehicle, customer, terms), uploads stips (proof of income, insurance), and submits. The deal lands in a Funding Analyst's queue. Analyst reviews the package, checks stips against the checklist, verifies credit decision, and either funds or sends back to dealer with specific stip requests. Dealer gets a notification, uploads the missing doc, analyst re-reviews and funds.

### SYS_10 — Most Common Situations
Deal submission with complete documentation (happy path), deal submission with missing stipulations (most common — about 40% of deals), dealer status check ("where's my funding?"), payment of dealer reserve/holdback after funding.

### SYS_11 — Most Complex / High-Stakes Situations
Multi-vehicle fleet deals for commercial dealers (complex pricing), deals flagged for fraud review (manual hold + compliance involvement), deals requiring exception pricing approval (over rate/term guidelines), buyback scenarios where funded deal has documentation deficiency.

### SYS_12 — Launch vs. Proficient Performance
At launch (Day 1): Analysts can process a clean deal submission end-to-end, identify and request missing stips, and escalate exceptions to supervisor. Dealers can submit a deal and check status. At 30 days: Analysts handle common exceptions independently, use reporting to manage their queue, and coach dealers on common submission errors. Dealers complete 90%+ of submissions without calling their DRM.

---

---

# TYPE 2: PERFORMANCE PROBLEM

**Scenario:** The Collections department is experiencing a spike in early-stage delinquency cure rates dropping, and right-party contact rates are down. Leadership suspects agents aren't following the updated contact strategy.

---

## STATIC / SHARED QUESTIONS

### SHARED_01 — Project Name
Collections contact strategy performance improvement

### SHARED_02 — Requesting Department
Collections — Brian Hargrove, Director of Collections

### SHARED_03 — Target Completion Date
4/30/2026

### SHARED_04 — Why Now?
Our 30-day delinquency cure rate has dropped from 68% to 54% over the last two quarters. At the same time, we rolled out an updated contact strategy in September that prioritizes early engagement and behavioral segmentation. The strategy was communicated via email and a one-page memo, but there was no formal training. Collections leadership believes agents are still using the old approach — calling everyone the same way regardless of risk segment.

### SHARED_05 — What Happens If We Do Nothing?
Delinquency flows into 60+ day buckets, increasing charge-off risk. We're currently trending $2.1M above charge-off forecast for the quarter. Regulatory scrutiny increases (CFPB expects documented contact strategies). Agent turnover may increase — the good agents feel frustrated that the new strategy isn't being followed and they're picking up slack.

### SHARED_06 — Audience by Role Table (Performance Problem version)
| Role | Headcount | Frequency of Affected Task |
|---|---|---|
| Collections Agents (Tier 1 — Early Stage) | ~80 | Daily — 60+ calls/day |
| Collections Agents (Tier 2 — Late Stage) | ~35 | Daily — 30+ calls/day |
| Collections Team Leads | ~12 | Daily — monitoring + coaching |
| Collections QA Analysts | ~4 | Daily — call reviews |

### SHARED_07 — Do Different Roles Need Different Training?
Yes. Tier 1 agents need the most intensive training — the new strategy changes their entire call approach for early-stage accounts. Tier 2 agents need awareness of the strategy but their late-stage process didn't change much. Team Leads need to understand the strategy deeply enough to coach to it and recognize non-compliance during monitoring. QA Analysts need updated scorecards aligned to the new strategy.

### SHARED_10 — Change Champions
Not formally, but Tamara Reese (Tier 1 agent, 8 years) consistently has the best cure rates and naturally coaches her peers. She intuitively follows the new strategy already. Could be a powerful peer advocate.

### SHARED_11 — Post-Training Support
Team Leads will reinforce through weekly coaching sessions. QA will update their monitoring scorecard to reflect the new contact strategy elements. A quick-reference card at each workstation would help agents during calls.

### SHARED_16 — Delivery Format Preference
Cannot take agents off the phones for more than 2 hours at a time. Prefer a blended approach: short eLearning module they can do between call blocks, followed by a live practice session with role-play scenarios. Agents are in-office (not remote).

### SHARED_17 — Constraints or Limitations
Cannot train during the last week of any month (highest call volume). Only one team can be off-phones at a time. No budget for external trainers. The call recording system can provide sample calls for training examples — Brian can authorize access.

### SHARED_18 — Existing Materials or Training
The one-page contact strategy memo from September. Updated call scripts (PDF, never formally trained). Legacy collections training from onboarding (2+ years old for most agents). QA scorecard (not yet updated for new strategy).

### SHARED_19 — Key SMEs or Contacts
| Name | Role | Contact | Expertise |
|---|---|---|---|
| Brian Hargrove | Director, Collections | brian.hargrove@apexfs.com | Strategy owner, business metrics |
| Tamara Reese | Senior Collections Agent | tamara.reese@apexfs.com | Top performer, peer credibility |
| Devon Park | Collections Team Lead | devon.park@apexfs.com | Coaching, day-to-day operations |
| Lisa Chung | QA Manager | lisa.chung@apexfs.com | Call quality, scorecard criteria |
| Nina Aslam | Workforce Management | nina.aslam@apexfs.com | Scheduling, off-phone time windows |

### SHARED_20 — Additional Concerns
Some veteran agents are resistant — they believe their old approach works fine and see the new strategy as micromanagement. A few agents have said "I've been doing this for 10 years, I don't need someone telling me how to make a call." Brian wants training to address this attitude without being confrontational.

---

## PERFORMANCE PROBLEM DYNAMIC QUESTIONS

### PERF_01 — The Problem or Opportunity
30-day delinquency cure rate dropped from 68% to 54% over two quarters. Right-party contact rate declined from 42% to 31%. Average calls-to-cure increased from 4.2 to 6.8. These changes coincide with the rollout of the new behavioral segmentation contact strategy that was communicated but never formally trained.

### PERF_02 — Current vs. Desired Performance
Currently: Agents treat every delinquent account the same — generic opening, identical call cadence regardless of risk segment, no use of the behavioral indicators in the system. They call high-risk and low-risk accounts at the same frequency and with the same script.
Desired: Agents identify the account's behavioral segment (displayed in the collections system), use segment-specific talk tracks, follow the prescribed contact cadence for each segment, and document the segmentation-related notes properly. High-risk accounts get earlier, more frequent contact with hardship-focused language. Low-risk accounts get a lighter touch with self-cure options.

### PERF_03 — How Do You Know There's a Problem?
QA call reviews show only 23% of agents reference the behavioral segment during calls. System logs show agents aren't opening the segment detail panel — they go straight to the dialer. Cure rates by segment show no differentiation (should see higher cure in low-risk if strategy is being followed). Brian's team lead ride-alongs confirmed agents skip the segmentation step.

### PERF_04 — What Has Already Been Tried?
September: Email distribution of the new strategy document + one-page summary posted in break room. October: Team leads told to "mention it in huddles." November: Brian sent a follow-up email with a chart showing declining metrics. December: Nothing formal — holiday season. January: Brian escalated to VP requesting training support.

### PERF_05 — Root Causes — Environment
The behavioral segment indicator is in the collections system but it's 3 clicks deep — agents have to open the account, click "Customer Profile," then expand "Behavioral Segment." It's not visible on the main queue screen. The segment-specific talk tracks are in a PDF on the shared drive — agents can't reference them during a live call easily.

### PERF_06 — Root Causes — Knowledge, Skill, Motivation
Knowledge: Agents know there's a new strategy (the email went out) but most don't understand WHY segmentation matters or HOW to adjust their approach based on segment. They can't articulate the difference between a high-risk and low-risk behavioral segment.
Skill: Agents who understand the segments still struggle to pivot their talk track mid-call when the conversation doesn't follow the script. The new approach requires more adaptive conversation skills.
Motivation: Veteran agents see no personal benefit — their compensation is based on total promises-to-pay, not cure rate by segment. Some feel the new strategy second-guesses their judgment.

### PERF_07 — High-Stakes Situations
Accounts in the 25-30 day window — if not cured, they roll to 60+ days where recovery rates drop dramatically. Bankruptcy-risk accounts that need immediate hardship referral. Accounts where the customer has already made a partial payment but agents fail to recognize the behavioral signal and apply aggressive tactics anyway, causing the customer to disengage entirely.

### PERF_08 — Success Metrics
| Metric | Current | Target | Timeframe |
|---|---|---|---|
| 30-day cure rate | 54% | 65% | 90 days post-training |
| Right-party contact rate | 31% | 40% | 60 days |
| Segment panel access rate | 23% of calls | 80%+ | 30 days |
| QA score — strategy adherence | N/A (not yet scored) | 75%+ | 60 days |
| Calls-to-cure ratio | 6.8 | 5.0 | 90 days |

---

---

# TYPE 3: COMPLIANCE / POLICY CHANGE

**Scenario:** Apex Financial Services is implementing updated fair lending documentation requirements in response to a recent CFPB examination finding. All customer-facing staff must follow new adverse action notice procedures.

---

## STATIC / SHARED QUESTIONS

### SHARED_01 — Project Name
Fair Lending adverse action notice compliance update

### SHARED_02 — Requesting Department
Compliance — Rachel Dominguez, VP of Regulatory Compliance

### SHARED_03 — Target Completion Date
3/31/2026

### SHARED_04 — Why Now?
Our most recent CFPB examination identified deficiencies in how we document and communicate adverse action decisions. The examination report cited inconsistent reason codes, delayed notice delivery, and incomplete adverse action logs. We have a 120-day remediation window — the clock started January 2, 2026. All customer-facing staff who touch credit decisions or communicate adverse actions must be trained and assessed before the remediation deadline.

### SHARED_05 — What Happens If We Do Nothing?
Regulatory enforcement action — potentially a consent order with financial penalties. Reputational damage. Individual staff could face personal regulatory sanctions for willful non-compliance. Continued fair lending risk exposure across the portfolio.

### SHARED_06 — Audience by Role Table (Compliance version — "Who Must Comply")
| Role | Headcount | Frequency of Affected Task |
|---|---|---|
| Credit Underwriters | ~30 | Daily — every declined/conditioned application |
| Retail Lending Processors | ~25 | Daily — adverse action notice generation |
| Customer Service Reps | ~50 | Weekly — customer inquiries about denials |
| Branch Managers | ~15 | Weekly — escalated complaints |
| Compliance Analysts | ~6 | Daily — review and audit |

### SHARED_07 — Do Different Roles Need Different Training?
Yes. Underwriters need training on proper reason code selection and documentation — they're the source of the problem. Processors need training on notice generation, timing requirements, and the new logging procedure. Customer Service needs to understand what the notices mean so they can explain them to customers. Branch Managers need enough knowledge to handle escalated complaints. Compliance Analysts need the full picture plus audit procedures.

### SHARED_10 — Change Champions
Not applicable in the same way — this is mandatory. However, Patricia Yoon (Senior Underwriter, 15 years) is well-respected and already follows best practices. She could serve as a peer reference during training.

### SHARED_11 — Post-Training Support
Updated adverse action procedures manual (Compliance is writing this). Job aids at each workstation with the reason code matrix. Monthly QA audit of adverse action files for first 6 months. Compliance hotline for questions.

### SHARED_16 — Delivery Format Preference
Compliance requires documented completion — needs an eLearning module with a scored assessment (80% passing threshold). Rachel wants a short live session to address questions before the eLearning, especially for Underwriters. Must track completion in the LMS for exam documentation.

### SHARED_17 — Constraints or Limitations
Hard deadline: 3/31/2026 — no extensions. Must document 100% completion for all in-scope staff. Assessment must demonstrate comprehension (not just clicking through). Training content must be reviewed and approved by Legal before deployment. Some staff are on leave or FMLA — need a makeup window through 4/15.

### SHARED_18 — Existing Materials or Training
Original adverse action training from 2021 onboarding. CFPB examination findings (redacted version approved for training use). Updated reason code matrix (draft — Compliance is finalizing). Current adverse action procedures manual (being revised).

### SHARED_19 — Key SMEs or Contacts
| Name | Role | Contact | Expertise |
|---|---|---|---|
| Rachel Dominguez | VP, Regulatory Compliance | rachel.dominguez@apexfs.com | Regulatory requirements, exam findings |
| Patricia Yoon | Senior Underwriter | patricia.yoon@apexfs.com | Current workflow, peer credibility |
| Anthony Russo | Associate General Counsel | anthony.russo@apexfs.com | Legal review, notice language |
| Maria Santos | Compliance Analyst | maria.santos@apexfs.com | Audit procedures, documentation |
| Greg Pham | IT — LOS Administrator | greg.pham@apexfs.com | System changes for reason code fields |

### SHARED_20 — Additional Concerns
Some underwriters push back on "more documentation" — they feel it slows them down and they were already doing it "well enough." Rachel needs training to convey that the CFPB finding was serious and this isn't optional. However, she doesn't want to create a fear-based culture — she wants people to understand WHY proper adverse action documentation matters for customers, not just for regulators.

---

## COMPLIANCE DYNAMIC QUESTIONS

### COMP_01 — What's Changing and Why?
Three things are changing: (1) Reason code selection — underwriters must now use specific, granular reason codes instead of generic ones. The current top reason code used is "Does not meet credit criteria" which is too vague — CFPB wants specific factors like "Insufficient length of credit history" or "Excessive revolving balance relative to limits." (2) Notice timing — adverse action notices must be generated within 24 hours of decision instead of the current batch process (some notices were going out 7+ days later). (3) Documentation — every adverse action must have a completed log entry with the specific factors considered, the reason codes selected, and the underwriter's narrative justification.

### COMP_02 — Source of the Requirement
CFPB examination finding from the November 2025 exam cycle. Specifically cites ECOA Section 701 and Regulation B Section 1002.9 requirements for specificity in adverse action notices. Our examination report (File #2025-CF-0847) requires remediation by April 30, 2026, with training completion as a documented remediation step.

### COMP_03 — Consequences of Non-Compliance
For the company: Potential consent order, civil money penalties (estimated $500K-$2M range based on similar actions), required independent compliance review for 3 years. For individuals: Regulatory sanctions for willful non-compliance, potential impact to licensing. For customers: Receiving vague or late adverse action notices denies them the information they need to improve their credit standing — this is the consumer harm the CFPB cares most about.

### COMP_04 — Specific Behaviors That Must Change
Underwriters must: Open the reason code detail panel for every declined application, select specific reason codes from the updated matrix (minimum 2, maximum 4), write a brief narrative justification, and submit within the same business session. Processors must: Verify notice generation within 24 hours, confirm delivery method matches customer preference (mail vs. electronic), and log delivery in the tracking system. Customer Service must: Use the standardized explanation script when customers call about adverse actions, and escalate (not improvise) when customers dispute reason codes.

### COMP_05 — How Will Compliance Be Verified?
Monthly QA audit: Compliance team pulls a random sample of 50 adverse action files per month and scores them against a rubric. Automated system checks: LOS will flag any adverse action without completed reason codes or narrative. Annual reassessment: All in-scope staff retake a shorter version of the assessment annually. CFPB follow-up: Examiners will review our remediation documentation at the next exam cycle.

### COMP_06 — Scope and Exceptions
All staff who make or communicate credit decisions on consumer applications. This includes retail auto loans, lease applications, and refinance applications. Does NOT include commercial/fleet lending (separate regulatory framework). Exception: Staff on FMLA or extended leave have a makeup window through 4/15/2026 but must complete before returning to active duties.

### COMP_07 — Previous Training on This Topic
Initial adverse action training during onboarding (covers basics but not the updated requirements). Annual compliance refresher includes fair lending as a topic but at a general level — not the specific procedural changes required here. No targeted training on reason code specificity or the 24-hour notice requirement has ever been delivered.

---

---

# TYPE 4: ROLE CHANGE / EXPANSION

**Scenario:** Apex Financial Services is expanding the Dealer Relationship Manager role to include portfolio performance responsibility. DRMs previously only managed dealer relationships — now they'll also own dealer-level delinquency and portfolio quality metrics.

---

## STATIC / SHARED QUESTIONS

### SHARED_01 — Project Name
DRM role expansion — portfolio performance responsibility

### SHARED_02 — Requesting Department
Retail Lending Strategy — Janet Kowalski, SVP of Retail Lending

### SHARED_03 — Target Completion Date
6/1/2026

### SHARED_04 — Why Now?
Historically, DRMs focused on relationship management — dealer visits, volume targets, program promotion. Portfolio quality was someone else's problem (Credit Risk team). But the board's new strategy links dealer profitability to portfolio quality. DRMs now need to understand which dealers produce healthy portfolios and which produce high-delinquency paper, and have conversations with dealers about underwriting quality. The new DRM scorecard (effective July 1) includes portfolio metrics alongside volume metrics.

### SHARED_05 — What Happens If We Do Nothing?
DRMs continue optimizing for volume regardless of quality. High-delinquency dealers go unaddressed. The scorecard launches but DRMs can't actually influence the metrics they're being measured on — leading to frustration, perceived unfairness, and likely turnover. The board's strategy of linking volume to quality fails at the field level.

### SHARED_06 — Audience by Role Table (Role Change version — "Who's Transitioning")
| Role | Headcount | Nature of Change |
|---|---|---|
| Dealer Relationship Managers | ~20 | Adding portfolio performance to existing relationship management role |
| DRM Regional Directors | ~4 | Need to coach DRMs on new metrics and dealer conversations |
| Credit Risk Analysts (supporting role) | ~6 | Will provide portfolio data to DRMs — need to understand DRM context |

### SHARED_07 — Do Different Roles Need Different Training?
Yes. DRMs need the full program: understanding portfolio metrics, reading dealer scorecards, having performance conversations with dealers, and creating action plans. Regional Directors need training on coaching DRMs through these new responsibilities and reviewing dealer portfolio plans. Credit Risk Analysts need enough context to understand what DRMs will do with the data they provide, so they can tailor their reports accordingly.

### SHARED_10 — Change Champions
Rob Alvarez (DRM, Northeast region) already informally tracks his dealers' portfolio performance. He's been asking for this change for years. He could pilot the training, provide real-world examples, and advocate to peers.

### SHARED_11 — Post-Training Support
Monthly portfolio review meetings between each DRM and their Regional Director (new cadence). Quarterly deep-dive with Credit Risk to review dealer trends. Job aid: dealer scorecard interpretation guide. Rob Alvarez available as peer coach for first 90 days.

### SHARED_16 — Delivery Format Preference
This is complex enough to need instructor-led training — preferably in-person during the next national DRM meeting (May 12-14, 2026). Follow-up eLearning modules for reinforcement. Strongly prefer real data from their own dealer portfolios for practice exercises.

### SHARED_17 — Constraints or Limitations
DRMs are field-based and rarely in the office. National meeting in May is the best (and possibly only) window for synchronous training. Must be sensitive to framing — this is an expansion, not a criticism. Some DRMs will feel this is "not what I signed up for." Training must use real portfolio data but must anonymize dealer names for classroom exercises.

### SHARED_18 — Existing Materials or Training
DRM onboarding covers relationship management, dealer economics, and lending programs — no portfolio quality content. Credit Risk team has a "Portfolio Health Dashboard" user guide (written for analysts, not DRMs). The new DRM scorecard template exists in draft.

### SHARED_19 — Key SMEs or Contacts
| Name | Role | Contact | Expertise |
|---|---|---|---|
| Janet Kowalski | SVP, Retail Lending | janet.kowalski@apexfs.com | Strategy, scorecard design |
| Rob Alvarez | DRM, Northeast | rob.alvarez@apexfs.com | Field perspective, early adopter |
| Priya Nair | Director, Credit Risk | priya.nair@apexfs.com | Portfolio metrics, dealer analysis |
| Tom Bridwell | Regional Director, South | tom.bridwell@apexfs.com | DRM coaching, change management |
| Sandy Whitfield | HR Business Partner | sandy.whitfield@apexfs.com | Role transition, comp structure |

### SHARED_20 — Additional Concerns
Biggest concern: DRMs feel punished for bad dealer portfolios when they had no control over credit decisions. Janet needs the training to frame this as "you're now empowered to have these conversations and influence quality" not "you're now responsible for things you can't control." Compensation structure is changing to include portfolio quality bonuses — Sandy Whitfield from HR needs to present that piece separately but the training should acknowledge it. Two DRMs are actively interviewing elsewhere — retention risk is real if this rollout is handled poorly.

---

## ROLE CHANGE DYNAMIC QUESTIONS

### ROLE_01 — Nature of the Change
The DRM role is expanding from purely relationship/volume management to include portfolio performance ownership. DRMs keep all existing responsibilities (dealer visits, program promotion, volume targets, contract negotiations) and add: reviewing monthly dealer portfolio scorecards, identifying dealers with quality trends (good and bad), having data-driven performance conversations with dealer principals about underwriting quality, and creating portfolio improvement action plans for underperforming dealers.

### ROLE_02 — Why Is the Role Changing?
Board strategic initiative: the profitability model showed that volume without quality erodes margins. The top 20% of dealers by volume include 5 dealers in the bottom 10% by portfolio quality — they produce high-delinquency paper that offsets their volume contribution. DRMs are the only people with dealer relationships strong enough to have quality conversations. Credit Risk can identify the problem but has no dealer-facing authority.

### ROLE_03 — Current Capabilities
DRMs are strong relationship managers and excellent at reading dealer economics (floor plan costs, F&I margins, deal structure). They understand lending programs and competitive positioning. However, they have minimal exposure to credit analytics — terms like "vintage delinquency curve," "migration rate," and "static pool analysis" are foreign. They've never read a portfolio health report. They're skilled negotiators but have always negotiated on volume/pricing — never on quality metrics.

### ROLE_04 — What Does Success Look Like?
A successful DRM can: Read and explain their dealer scorecard to a dealer principal. Identify the 2-3 metrics driving portfolio quality for each dealer. Lead a structured performance conversation that's constructive, not adversarial. Create a 90-day portfolio improvement plan with specific actions. Recognize when a dealer relationship is producing unsustainable portfolio risk and escalate appropriately. At 6 months: each DRM has conducted at least 2 portfolio review conversations per dealer in their territory.

### ROLE_05 — Is the Change Voluntary or Imposed?
Imposed — it's a strategic mandate from the board. DRMs were not consulted during the decision (Janet acknowledges this was a mistake). The new scorecard is final and launches July 1 regardless. However, Janet wants to frame it as an opportunity — the portfolio quality bonus can increase total comp by 15-20% for DRMs who perform well on the new metrics.

### ROLE_06 — Support and Tools Needed
Portfolio Health Dashboard access (currently only Credit Risk has it — IT needs to provision DRM access). Dealer Scorecard template (being finalized by Credit Risk). Conversation guide for portfolio review meetings. Monthly data package from Credit Risk showing dealer trends. Regional Director coaching framework. Clear escalation path for when a dealer conversation goes badly.

### ROLE_07 — Success Metrics
| Metric | Baseline | 6-Month Target |
|---|---|---|
| DRMs completing monthly scorecard review | 0% | 100% |
| Portfolio review conversations per dealer per quarter | 0 | 2 |
| Dealer portfolio quality score improvement (flagged dealers) | Varies | 10% improvement |
| DRM confidence in portfolio conversations (self-assessment) | N/A | 4+/5 |
| DRM scorecard — portfolio quality component | N/A (new) | 70%+ meeting target |
| DRM voluntary turnover during transition | ~10% annual | Hold at ≤10% |
