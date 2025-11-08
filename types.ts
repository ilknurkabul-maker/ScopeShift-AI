
export interface AcceptanceCriterion {
  id: string;
  description: string;
}

export interface Feature {
  id: string;
  title: string;
  tier: 'V0' | 'V1';
  acceptanceCriteria: AcceptanceCriterion[];
}

export interface TestSpec {
  featureId: string;
  fileName: string;
  code: string;
}

export interface CodeTemplate {
  featureId: string;
  fileName: string;
  language: string;
  code: string;
}

export interface ScopeShiftOutput {
  features: Feature[];
  testSpecs: TestSpec[];
  codeTemplates: CodeTemplate[];
}

export enum Tab {
  Features = 'Features & ACs',
  Tests = 'Test Specs',
  Code = 'Code Templates',
}

export interface Impacts {
  cold_start_ms: string;
  p99_latency_ms: string;
  cost: 'low' | 'med' | 'high';
}

export interface ProposedFeature {
  id: string;
  title: string;
  tier_suggestion: 'V0' | 'V1';
  rationale: string;
  impacts: Impacts;
  risk: 'low' | 'med' | 'high';
  acs: string[];
  depends_on?: string[];
  constraints_ok: boolean;
  conflicts?: string[];
}

export interface ProposedFeaturesOutput {
    candidates: ProposedFeature[];
}

// Types for Scope Health Analysis
export interface FeatureInput {
    id: string;
    title: string;
    tier: 'V0' | 'V1';
}

export interface AcceptanceCriterionInput {
    feature: string; // feature ID
    id: string;
    text: string;
}

export interface Constraints {
    cold_start_ms: number;
    auth_required: boolean;
    p99_latency_ms: number;
}

export interface ScopeAnalysisInput {
    features: FeatureInput[];
    acceptance: AcceptanceCriterionInput[];
    constraints: Constraints;
}

export interface Location {
    type: string;
    feature_id?: string;
    ac_index?: number;
}

export interface ProposedFix {
    summary: string;
    action?: string;
    updated_text?: string;
}

export interface Issue {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    location: Location;
    proposed_fix: ProposedFix;
}

export interface ScopeAnalysisOutput {
    issues: Issue[];
    score?: number;
    notes?: string;
}
