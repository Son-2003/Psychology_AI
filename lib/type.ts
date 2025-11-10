export interface TriageAnswers {
  feeling: string;
  suicidal: "no" | "unsure" | "yes";
  supportNearby: "alone" | "withSomeone" | "preferNotSay";
  mood: number;
}

export interface AIResponse {
  type: "normal" | "crisis";
  emotion?: "sad" | "stressed" | "anxious" | "lost" | "hopeful";
  empathy?: string;
  text?: string;
  advice?: string;
  actions?: string[];
  quote?: string;
  message?: string;
  detectedIssue?: string;
}

export type Stage = "form" | "loading" | "response";

export const AIPrompts = {
  depression: `...`,
  anxiety: `...`,
  loneliness: `...`,
  workStress: `...`,
  relationshipIssues: `...`,
  lowSelfEsteem: `...`,
  grief: `...`,
  perfectionism: `...`,
  general: `...`,
  careerConfusion: `...`,
} as const;

export type AIPromptKey = keyof typeof AIPrompts;
