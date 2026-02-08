import type { Patient } from '../types';

export type QuestionType = 'risks' | 'alerts' | 'schedule' | 'access' | 'summary' | 'cvc_harm' | 'longer_sessions' | 'bp_drop' | 'uf_rate' | 'adequacy_masking' | 'unknown';

export const detectQuestionType = (input: string): QuestionType => {
  const lower = input.toLowerCase();

  // New specific questions
  if (lower.match(/cvc.*harm|harm.*cvc|catheter.*harm|continuing.*cvc/)) return 'cvc_harm';
  if (lower.match(/longer.*session|session.*longer|extend.*time|longer.*dialysis/)) return 'longer_sessions';
  if (lower.match(/blood pressure.*drop|bp.*drop|hypotension|last hour/)) return 'bp_drop';
  if (lower.match(/uf rate|ultrafiltration.*rate|appropriate.*uf/)) return 'uf_rate';
  if (lower.match(/adequacy.*masking|dose.*masking|ischemic.*injury|biologic.*injury/)) return 'adequacy_masking';

  // Existing questions
  if (lower.match(/risk|mortality|prognosis|how bad|danger|concern/)) return 'risks';
  if (lower.match(/alert|warning|critical|serious|issue|problem/)) return 'alerts';
  if (lower.match(/schedule|dialysis|sessions|frequency|how often|times per week/)) return 'schedule';
  if (lower.match(/access|fistula|graft|catheter|cvc|vp|venous pressure/)) return 'access';
  if (lower.match(/summarize|summary|overview|status|tell me about|patient info/)) return 'summary';

  return 'unknown';
};

export const generateResponse = (patient: Patient, questionType: QuestionType): string => {
  const criticalCount = patient.alerts.filter(a => a.severity === 'critical').length;
  const warningCount = patient.alerts.filter(a => a.severity === 'warning').length;
  const criticalAlerts = patient.alerts.filter(a => a.severity === 'critical');
  const firstCritical = criticalAlerts[0];

  const accessFullName = patient.accessType === 'CVC'
    ? 'Central Venous Catheter'
    : patient.accessType === 'AVF'
      ? 'Arteriovenous Fistula'
      : 'Arteriovenous Graft';

  const deltaDirection30d = patient.mortalityDelta['30d'] > 0 ? 'upward' : 'downward';

  switch (questionType) {
    case 'cvc_harm':
      return `**Yes.** In this patient, ongoing CVC use is contributing to risk. Active CVC-related alerts and inflammatory signals suggest the catheter is no longer a neutral bridge and may be adding to infection and mortality risk.`;

    case 'longer_sessions':
      return `**Probably not at this stage.** The current ${patient.schedule.durationPerSession}-minute sessions meet adequacy standards, and there is no clear signal that session length is driving instability. Optimization should focus on treatment quality rather than extending time.`;

    case 'bp_drop':
      return `The late-session BP drop is most consistent with cumulative UF stress, where fluid removal begins to exceed vascular refill capacity as the session progresses.`;

    case 'uf_rate':
      return `The UF rate appears acceptable overall, but given this patient's ${patient.riskLevel.toLowerCase()} risk profile, even modest UF stress may trigger hypotension. Close monitoring and late-session UF adjustment are warranted.`;

    case 'adequacy_masking':
      return `**Yes.** Although conventional adequacy metrics show no clearance alerts, the patient’s 1-year mortality risk remains extremely high. This suggests that standard dose metrics are failing to capture ongoing vascular and inflammatory injury driven by non-clearance factors.`;

    case 'risks':
      return `Based on current data, **${patient.name}** has a **${patient.riskLevel.toUpperCase()}** overall risk profile.

**Mortality Risk:**
• 30-day: ${patient.mortalityRisk['30d']}%
• 90-day: ${patient.mortalityRisk['90d']}%
• 1-year: ${patient.mortalityRisk['1yr']}%

**Primary Concern:** ${patient.topRiskFactor}

**Active Issues:** ${criticalCount} critical alert${criticalCount !== 1 ? 's' : ''} and ${warningCount} warning${warningCount !== 1 ? 's' : ''}. ${firstCritical ? `Most urgent: **${firstCritical.type}** - ${firstCritical.description}.` : ''}

Risk is trending ${deltaDirection30d} over 30 days.`;

    case 'alerts':
      const alertList = patient.alerts.map((alert, idx) =>
        `${idx + 1}. **${alert.type}** - ${alert.description} (${alert.severity.toUpperCase()})`
      ).join('\n');

      return `There are **${patient.alerts.length} active alerts**:

${alertList}

${criticalCount > 0 ? `⚠️ **Action Required:** ${criticalCount} critical alert${criticalCount !== 1 ? 's' : ''} need${criticalCount === 1 ? 's' : ''} immediate attention within 24 hours.` : 'All alerts are currently at warning level.'}`;

    case 'schedule':
      const hoursPerSession = (patient.schedule.durationPerSession / 60).toFixed(1);
      const scheduleAssessment = patient.schedule.durationPerSession < 240
        ? 'suboptimal - consider extending session time'
        : 'adequate';

      return `**${patient.name}** is on a **${patient.schedule.daysPerWeek}-days-per-week** dialysis schedule.

**Session Details:**
• Duration: **${patient.schedule.durationPerSession} minutes** (${hoursPerSession} hours) per session
• Weekly treatment time: ~${(patient.schedule.daysPerWeek * patient.schedule.durationPerSession / 60).toFixed(1)} hours

**Dialysis Vintage:** ${patient.dialysisVintage} months on hemodialysis

**Assessment:** The prescribed regimen appears **${scheduleAssessment}** based on the patient's ${patient.riskLevel.toLowerCase()} risk profile and ${patient.topRiskFactor} phenotype.`;

    case 'access':
      let accessWarning = '';
      if (patient.accessType === 'CVC') {
        accessWarning = '⚠️ The CVC has been in place for an extended period, which increases infection risk. Consider transitioning to permanent access.';
      } else if (patient.accessType === 'AVG') {
        accessWarning = 'The AVG shows signs of potential dysfunction. Monitor venous pressure trends closely.';
      } else {
        accessWarning = 'The AVF appears to be the preferred access type with lower complication rates.';
      }

      return `**Access Type:** ${patient.accessType} (${accessFullName})

**Current Status:**
${accessWarning}

**Access History:**
${patient.phenotype.find(p => p.includes('vintage')) || 'Patient has been on dialysis for ' + patient.dialysisVintage + ' months'}

**Recommendations:**
${patient.accessType === 'CVC' ? '• Plan for AVF/AVG creation\n• Monitor for infection signs\n• Maintain strict sterile technique' : patient.accessType === 'AVG' ? '• Monitor VP trends\n• Schedule access flow study\n• Watch for prolonged bleeding' : '• Continue routine monitoring\n• Palpate for thrill regularly\n• Report any changes immediately'}`;

    case 'summary':
      const alertSummary = patient.alerts.length > 0
        ? `${patient.alerts.length} active alert${patient.alerts.length !== 1 ? 's' : ''} (${criticalCount} critical)`
        : 'No active alerts';

      return `**Patient Summary: ${patient.name}** (${patient.id})

**Demographics:** ${patient.age}-year-old ${patient.sex} with ${patient.primaryDiagnosis}

**Treatment:** ${patient.dialysisVintage} months on hemodialysis at ${patient.facility}

**Risk Profile:** ${patient.riskLevel} - ${patient.topRiskFactor}

**Current Status:** ${alertSummary}

**Key Metrics:**
• 30-day mortality risk: ${patient.mortalityRisk['30d']}%
• Access type: ${patient.accessType}
• Schedule: ${patient.schedule.daysPerWeek}x/week, ${patient.schedule.durationPerSession}min sessions

**Trend:** Mortality risk trending ${deltaDirection30d} (${Math.abs(patient.mortalityDelta['30d'])}% delta)`;

    case 'unknown':
    default:
      return `I can help answer questions about:

• **CVC Safety** - Is continuing with a CVC harmful?
• **Session Length** - Would longer dialysis sessions help?
• **Blood Pressure** - Why does BP drop during dialysis?
• **UF Rate** - Is the current ultrafiltration rate appropriate?
• **Risk levels** - mortality and hospitalization risks
• **Alerts** - active warnings and critical issues  
• **Dialysis schedule** - treatment frequency and duration
• **Vascular access** - fistula, graft, or catheter status
• **Patient summary** - complete overview

What would you like to know?`;
  }
};

export const suggestedPrompts = [
  { id: '1', text: 'Is continuing with a CVC harming this patient?', category: 'cvc_harm' },
  { id: '2', text: 'Would longer dialysis sessions help this patient?', category: 'longer_sessions' },
  { id: '3', text: 'Why does blood pressure drop in the last hour of dialysis?', category: 'bp_drop' },
  { id: '4', text: 'Is the current UF rate appropriate for this patient?', category: 'uf_rate' },
  { id: '5', text: 'Is dialysis adequacy masking cumulative ischemic or biologic injury?', category: 'adequacy_masking' },
];
