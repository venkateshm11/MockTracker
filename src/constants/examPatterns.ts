/**
 * Pre-defined exam paper patterns sourced from 2026 exam notifications / latest standards.
 * Each section carries: total questions, max marks, time allocation (seconds),
 * marks per correct answer, and negative marks per wrong answer.
 *
 * Used by MockForm to auto-fill section metadata so users only need to enter
 * "attempted" and "correct" per section.
 */

export interface SectionPattern {
  questions: number;
  maxMarks: number;
  timeSeconds: number;       // allocated time for this section
  marksPerCorrect: number;
  negativeMarks: number;     // marks deducted per wrong answer
}

export interface ExamStagePattern {
  [sectionKey: string]: SectionPattern;
}

export interface ExamPattern {
  prelims?: ExamStagePattern;
  mains?: ExamStagePattern;
}

// ---------------------------------------------------------------------------
// IBPS PO — 2026 Pattern
// Prelims: English 30Q/30M/20min | Numerical 35Q/35M/20min | Reasoning 35Q/35M/20min
// Negative: 0.25 per wrong | 1 mark per correct
// ---------------------------------------------------------------------------
const IBPS_PO_PATTERN: ExamPattern = {
  prelims: {
    english:   { questions: 30, maxMarks: 30, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
  mains: {
    // Mains objective: 170Q / 200M / 160 min total
    reasoning:         { questions: 45, maxMarks: 60, timeSeconds: 2400, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical:         { questions: 35, maxMarks: 60, timeSeconds: 2700, marksPerCorrect: 1, negativeMarks: 0.25 },
    general_awareness: { questions: 50, maxMarks: 60, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
    english:           { questions: 40, maxMarks: 20, timeSeconds: 2400, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
};

// ---------------------------------------------------------------------------
// IBPS Clerk — 2026 Pattern
// Prelims: English 30Q/30M/20min | Numerical 35Q/35M/20min | Reasoning 35Q/35M/20min
// Mains: GA 40Q/50M/20min | English 40Q/40M/35min | Reasoning 40Q/60M/35min | Numerical 40Q/50M/35min
// Total Mains: 160Q / 200M / 125 min
// ---------------------------------------------------------------------------
const IBPS_CLERK_PATTERN: ExamPattern = {
  prelims: {
    english:   { questions: 30, maxMarks: 30, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
  mains: {
    general_awareness: { questions: 40, maxMarks: 50, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    english:           { questions: 40, maxMarks: 40, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning:         { questions: 40, maxMarks: 60, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical:         { questions: 40, maxMarks: 50, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
};

// ---------------------------------------------------------------------------
// SBI PO — 2026 Pattern  ⚠️ CHANGED from earlier years
// Prelims: English 40Q/40M/20min | Numerical 30Q/30M/20min | Reasoning 30Q/30M/20min
// Mains objective: 170Q / 200M / 180 min | Neg: 0.25
// ---------------------------------------------------------------------------
const SBI_PO_PATTERN: ExamPattern = {
  prelims: {
    english:   { questions: 40, maxMarks: 40, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical: { questions: 30, maxMarks: 30, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning: { questions: 30, maxMarks: 30, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
  mains: {
    reasoning:         { questions: 40, maxMarks: 60, timeSeconds: 3000, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical:         { questions: 30, maxMarks: 60, timeSeconds: 2700, marksPerCorrect: 1, negativeMarks: 0.25 },
    general_awareness: { questions: 60, maxMarks: 60, timeSeconds: 2700, marksPerCorrect: 1, negativeMarks: 0.25 },
    english:           { questions: 40, maxMarks: 20, timeSeconds: 2400, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
};

// ---------------------------------------------------------------------------
// SBI Clerk — 2026 Pattern
// Prelims: English 30Q/30M/20min | Numerical 35Q/35M/20min | Reasoning 35Q/35M/20min
// Mains: GA 50Q/50M | English 40Q/40M | Numerical 50Q/50M | Reasoning+CA 50Q/60M | 160 min
// ---------------------------------------------------------------------------
const SBI_CLERK_PATTERN: ExamPattern = {
  prelims: {
    english:   { questions: 30, maxMarks: 30, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning: { questions: 35, maxMarks: 35, timeSeconds: 1200, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
  mains: {
    general_awareness: { questions: 50, maxMarks: 50, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
    english:           { questions: 40, maxMarks: 40, timeSeconds: 2100, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical:         { questions: 50, maxMarks: 50, timeSeconds: 2700, marksPerCorrect: 1, negativeMarks: 0.25 },
    reasoning:         { questions: 50, maxMarks: 60, timeSeconds: 2700, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
};

// ---------------------------------------------------------------------------
// RRB PO (Officer Scale-I) — 2026 Pattern
// Prelims: Reasoning 40Q/40M + Numerical 40Q/40M | 45 min composite | NO English
// Mains: 200Q / 200M / 120 min sectional
//   Reasoning 40Q/50M/30min | Numerical 40Q/50M/30min | GA 40Q/40M/15min
//   English/Hindi 40Q/40M/30min | Computer 40Q/20M/15min
// ---------------------------------------------------------------------------
const RRB_PO_PATTERN: ExamPattern = {
  prelims: {
    // 45 min composite — split evenly (2700s / 2 = 1350s each)
    reasoning: { questions: 40, maxMarks: 40, timeSeconds: 1350, marksPerCorrect: 1, negativeMarks: 0.25 },
    numerical: { questions: 40, maxMarks: 40, timeSeconds: 1350, marksPerCorrect: 1, negativeMarks: 0.25 },
  },
  mains: {
    reasoning:          { questions: 40, maxMarks: 50, timeSeconds: 1800, marksPerCorrect: 1.25, negativeMarks: 0.25 },
    numerical:          { questions: 40, maxMarks: 50, timeSeconds: 1800, marksPerCorrect: 1.25, negativeMarks: 0.25 },
    general_awareness:  { questions: 40, maxMarks: 40, timeSeconds:  900, marksPerCorrect: 1,    negativeMarks: 0.25 },
    english:            { questions: 40, maxMarks: 40, timeSeconds: 1800, marksPerCorrect: 1,    negativeMarks: 0.25 },
    computer_awareness: { questions: 40, maxMarks: 20, timeSeconds:  900, marksPerCorrect: 0.5,  negativeMarks: 0.25 },
  },
};

// RRB Clerk (Office Assistant) has the same pattern as RRB PO
const RRB_CLERK_PATTERN: ExamPattern = RRB_PO_PATTERN;

// ---------------------------------------------------------------------------
// SSC CGL — 2026 Pattern
// Tier-1 (= Prelims): 100Q / 200M / 60 min | 15 min strict per section | +2 / −0.5
// Sections: Reasoning 25Q/50M | GA 25Q/50M | Numerical 25Q/50M | English 25Q/50M
// ---------------------------------------------------------------------------
const SSC_CGL_PATTERN: ExamPattern = {
  prelims: {
    reasoning:          { questions: 25, maxMarks: 50, timeSeconds: 900, marksPerCorrect: 2, negativeMarks: 0.5 },
    general_awareness:  { questions: 25, maxMarks: 50, timeSeconds: 900, marksPerCorrect: 2, negativeMarks: 0.5 },
    numerical:          { questions: 25, maxMarks: 50, timeSeconds: 900, marksPerCorrect: 2, negativeMarks: 0.5 },
    english:            { questions: 25, maxMarks: 50, timeSeconds: 900, marksPerCorrect: 2, negativeMarks: 0.5 },
  },
  // Tier-2 mains uses a module/session structure — left blank; user fills manually
};

// ---------------------------------------------------------------------------
// Master lookup: exam name (lowercase) → ExamPattern
// ---------------------------------------------------------------------------
export const EXAM_PATTERNS: Record<string, ExamPattern> = {
  'ibps po':    IBPS_PO_PATTERN,
  'ibps clerk': IBPS_CLERK_PATTERN,
  'sbi po':     SBI_PO_PATTERN,
  'sbi clerk':  SBI_CLERK_PATTERN,
  'rrb po':     RRB_PO_PATTERN,
  'rrb clerk':  RRB_CLERK_PATTERN,
  'ssc cgl':    SSC_CGL_PATTERN,
};

/**
 * Returns the section-level pattern for a given exam + stage + section key.
 * Returns null if no pre-defined pattern exists (custom exam or unrecognised combo).
 */
export function getSectionPattern(
  exam: string,
  stage: 'prelims' | 'mains',
  sectionKey: string
): SectionPattern | null {
  const examPattern = EXAM_PATTERNS[exam.toLowerCase()];
  if (!examPattern) return null;
  const stagePattern = examPattern[stage];
  if (!stagePattern) return null;
  return stagePattern[sectionKey] ?? null;
}

/**
 * Given attempted and correct answers, calculates derived fields using
 * the official marking scheme of the exam.
 */
export function calculateFromPattern(
  pattern: SectionPattern,
  attempted: number,
  correct: number
): {
  questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unanswered: number;
  marks: number;
  timeSeconds: number;
} {
  const wrong = Math.max(0, attempted - correct);
  const unanswered = Math.max(0, pattern.questions - attempted);
  const marks = correct * pattern.marksPerCorrect - wrong * pattern.negativeMarks;

  return {
    questions: pattern.questions,
    attempted,
    correct,
    wrong,
    unanswered,
    marks: Math.round(marks * 100) / 100,
    timeSeconds: 0,
  };
}

