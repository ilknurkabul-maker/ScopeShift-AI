

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
    p99_latency_ms?: number;
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

// Types for Test Plan Generation
export interface Assertion {
    type: string;
    op?: string;
    value: any;
}

export interface Test {
    id: string;
    tier: 'V0' | 'V1';
    name: string;
    endpoint: string;
    preconditions: any[];
    payload: Record<string, any>;
    assertions: Assertion[];
}

export interface TestPlanOutput {
    tests: Test[];
}

// Types for Re-scoping
interface DeferChange {
    type: 'defer';
    feature: string;
    to: 'V1';
    reason: string;
}

interface ReplaceChange {
    type: 'replace';
    from: string;
    to: string;
    reason: string;
}

interface ModifyAcChange {
    type: 'modify_ac';
    feature: string;
    ac: string;
    old: string;
    new: string;
}

export type ReScopeChange = DeferChange | ReplaceChange | ModifyAcChange;

export interface ReScopeOutput {
    changes: ReScopeChange[];
    impact_summary: {
        cold_start_ms: string;
        notes: string;
    };
    diff_panel: {
        before: string[];
        after: string[];
    };
}

// Types for Finalizer
export interface FinalizedCodeFile {
    path: string;
    code: string;
    language: string;
}