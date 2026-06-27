export type PromptRecord = {
  id: string
  originalPrompt: string
  complaint: string
  improvedPrompt: string
  verdict: PromptVerdict | null
  iterations: number
  createdAt: number
}

export type PromptVerdict = {
  pass: boolean
  issues: PromptIssue[]
}

export type PromptIssue = {
  kind: PromptIssueKind
  severity: 'low' | 'medium' | 'high'
  note: string
}

export type PromptIssueKind =
  | 'complaint_unaddressed'
  | 'anti_pattern_survived'
  | 'specificity_regressed'
  | 'structure_lost'
  | 'meaning_changed'
  | 'instructions_added'
