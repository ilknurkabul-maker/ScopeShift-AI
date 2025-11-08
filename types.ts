
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
