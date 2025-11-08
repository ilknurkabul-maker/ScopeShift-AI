
import { GoogleGenAI, Type } from "@google/genai";
import { Feature, ScopeShiftOutput, ProposedFeaturesOutput, ScopeAnalysisInput, ScopeAnalysisOutput, TestPlanOutput, Test } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    features: {
      type: Type.ARRAY,
      description: "List of product features, categorized into V0 (MVP) and V1 (roadmap).",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the feature, e.g., 'feat-001'." },
          title: { type: Type.STRING, description: "A short, descriptive title for the feature." },
          tier: { type: Type.STRING, description: "The feature tier: 'V0' for MVP, 'V1' for roadmap." },
          acceptanceCriteria: {
            type: Type.ARRAY,
            description: "A list of concrete, testable acceptance criteria for the feature.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique identifier for the AC, e.g., 'ac-001-1'." },
                description: { type: Type.STRING, description: "The text of the acceptance criterion." }
              },
              required: ["id", "description"]
            }
          }
        },
        required: ["id", "title", "tier", "acceptanceCriteria"]
      }
    },
    testSpecs: {
      type: Type.ARRAY,
      description: "Deterministic, pytest-ready test specifications for each feature.",
      items: {
        type: Type.OBJECT,
        properties: {
          featureId: { type: Type.STRING, description: "The ID of the feature this test spec relates to." },
          fileName: { type: Type.STRING, description: "A pytest-compatible file name, e.g., 'test_feature_auth.py'." },
          code: { type: Type.STRING, description: "The Python code for the test spec, including imports and placeholder functions." }
        },
        required: ["featureId", "fileName", "code"]
      }
    },
    codeTemplates: {
      type: Type.ARRAY,
      description: "Minimal code templates or stubs for implementing each feature.",
      items: {
        type: Type.OBJECT,
        properties: {
          featureId: { type: Type.STRING, description: "The ID of the feature this code template relates to." },
          fileName: { type: Type.STRING, description: "A suggested file name for the code, e.g., 'auth_service.py'." },
          language: { type: Type.STRING, description: "The programming language of the code, e.g., 'python' or 'typescript'." },
          code: { type: Type.STRING, description: "The code template or stub." }
        },
        required: ["featureId", "fileName", "language", "code"]
      }
    }
  },
  required: ["features", "testSpecs", "codeTemplates"]
};

const systemInstruction = `You are ScopeShift, an AI PM copilot for rapid prototyping.
Your job is to take short product 'scenarios' and turn them into:
1) Curated feature set (MVP vs V1),
2) Acceptance criteria (ACs) per feature,
3) Deterministic test specs (pytest-ready),
4) Minimal code via templates.

ABSOLUTE RULES:
- Tests-first mindset: all accepted features MUST have ≥1 AC.
- Schema-safe MVP: V0 may NOT introduce new required fields or external APIs (DB/email/maps/third-party). Such integrations belong only in V1.
- Deterministic & JSON-ONLY for tool outputs. Do not add commentary outside JSON.
- If user constraints conflict with scenarios, propose fixes within the scope but maintain the JSON output.

OUTPUT STANDARDS:
- Always produce strict JSON matching the provided schema.
- Keep titles short; ACs should be concrete, testable, and free of ambiguity.
- Label tiers as "V0" (MVP) or "V1" (roadmap).

SAFETY/BOUNDS:
- No medical, mental-health, legal, or regulated-content apps.
- Avoid personally identifiable info; use placeholders in examples.

STYLE:
- Crisp, minimal, engineering-ready. Prefer lists and ids over prose.`;

export const generateScope = async (scenario: string): Promise<ScopeShiftOutput> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [{ text: scenario }] },
      systemInstruction: { parts: [{ text: systemInstruction }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
      }
    });

    const jsonText = response.text.trim();
    const parsedOutput = JSON.parse(jsonText) as ScopeShiftOutput;
    return parsedOutput;

  } catch (error) {
    console.error("Error generating scope with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate scope: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating scope.");
  }
};


const proposalSchema = {
    type: Type.OBJECT,
    properties: {
        candidates: {
            type: Type.ARRAY,
            description: "A list of proposed new features.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique ID for the proposal, e.g., 'PROPOSED-1'." },
                    title: { type: Type.STRING, description: "A short name for the proposed feature." },
                    tier_suggestion: { type: Type.STRING, description: "'V0' or 'V1'." },
                    rationale: { type: Type.STRING, description: "1-2 lines explaining why this feature is proposed." },
                    impacts: {
                        type: Type.OBJECT,
                        properties: {
                            cold_start_ms: { type: Type.STRING, description: "Estimated change in cold start time, e.g., '+50' or '-10'." },
                            p99_latency_ms: { type: Type.STRING, description: "Estimated change in p99 latency, e.g., '+100' or '0'." },
                            cost: { type: Type.STRING, description: "'low', 'med', or 'high'." }
                        },
                        required: ["cold_start_ms", "p99_latency_ms", "cost"]
                    },
                    risk: { type: Type.STRING, description: "'low', 'med', or 'high'." },
                    acs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of acceptance criteria for the proposed feature." },
                    depends_on: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional list of feature IDs it depends on." },
                    constraints_ok: { type: Type.BOOLEAN, description: "Whether the proposal meets the given constraints." },
                    conflicts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional list of conflict explanations." }
                },
                required: ["id", "title", "tier_suggestion", "rationale", "impacts", "risk", "acs", "constraints_ok"]
            }
        }
    },
    required: ["candidates"]
};

export const proposeFeatures = async (existingFeatures: Feature[]): Promise<ProposedFeaturesOutput> => {
  const seedScenarios = existingFeatures.map(f => `- "${f.title}"`).join('\n');
  const prompt = `Propose additional features from seed scenarios, under current constraints.
RETURN JSON ONLY.

SEED_SCENARIOS:
${seedScenarios}

CONSTRAINTS:
- cold_start_ms: 400
- auth_required: false
- p99_latency_ms: 800

GUARDRAILS:
- MVP (V0) must be schema-safe: no new required fields; no external APIs; minimal I/O.
- External APIs, email providers, file exports → V1 only.
- Deduplicate using title similarity; flag conflicts (e.g., public RSVP vs email required).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [{ text: prompt }] },
      systemInstruction: { parts: [{ text: "You are a senior product manager AI that proposes new features based on existing ones and a set of constraints. You must follow the user's instructions precisely and only return JSON that adheres to the provided schema." }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: proposalSchema,
        temperature: 0.4,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ProposedFeaturesOutput;

  } catch (error) {
    console.error("Error proposing features with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to propose features: ${error.message}`);
    }
    throw new Error("An unknown error occurred while proposing features.");
  }
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique identifier for the issue." },
                    severity: { type: Type.STRING, description: "Severity of the issue.", enum: ['critical', 'warning', 'info'] },
                    message: { type: Type.STRING, description: "A clear description of the issue found." },
                    location: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "The type of rule or check that triggered the issue." },
                            feature_id: { type: Type.STRING, description: "The ID of the feature where the issue was found." },
                            ac_index: { type: Type.INTEGER, description: "The index of the acceptance criterion related to the issue, if applicable." }
                        },
                        required: ['type']
                    },
                    proposed_fix: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "A summary of the proposed fix." },
                            action: { type: Type.STRING, description: "The suggested action to take (e.g., 'modify', 'add_ac')." },
                            updated_text: { type: Type.STRING, description: "The new or updated text for a feature or AC, if applicable." }
                        },
                        required: ['summary']
                    }
                },
                required: ['id', 'severity', 'message', 'location', 'proposed_fix']
            }
        },
        score: { type: Type.NUMBER, description: "An overall health score for the scope, out of 100." },
        notes: { type: Type.STRING, description: "General notes or summary of the analysis." }
    },
    required: ["issues"]
};


export const analyzeScope = async (input: ScopeAnalysisInput): Promise<ScopeAnalysisOutput> => {
    const prompt = `Analyze features + ACs for duplicates, conflicts, and gaps. Suggest safe fixes.
RETURN JSON ONLY using the schema provided in the tool config.

INPUT:
${JSON.stringify(input, null, 2)}

RULES:
- DUPLICATE: Title similarity ≥0.8.
- CONFLICT_AUTH: auth_required=false vs any AC requiring login.
- CONFLICT_EMAIL: public link vs “email required”.
- MISSING_AC: any feature without AC.
- DEPENDENCY: feature mentions a dependency not present.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [{ text: prompt }] },
            systemInstruction: { parts: [{ text: "You are a senior product manager AI that analyzes product scopes for issues based on a set of rules. You must follow the user's instructions precisely and only return JSON that adheres to the provided schema." }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.1,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScopeAnalysisOutput;

    } catch (error) {
        console.error("Error analyzing scope with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze scope: ${error.message}`);
        }
        throw new Error("An unknown error occurred while analyzing scope.");
    }
};

const testPlanSchema = {
    type: Type.OBJECT,
    properties: {
        tests: {
            type: Type.ARRAY,
            description: "An array of test cases.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique ID for the test case, e.g., 'T-1'." },
                    tier: { type: Type.STRING, enum: ['V0', 'V1'] },
                    name: { type: Type.STRING, description: "Test function name, pytest-style." },
                    endpoint: { type: Type.STRING, description: "The API endpoint to test." },
                    preconditions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Conditions that must be met before the test."
                    },
                    payload: { type: Type.STRING, description: "A JSON string representing the request payload. Should be '{}' for an empty payload." },
                    assertions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "Type of assertion, e.g., 'status', 'json_has_keys'." },
                                op: { type: Type.STRING, description: "Operator, e.g., '==', '>'. Optional." },
                                value: { type: Type.STRING, description: "Value for assertion. Stringify complex types like numbers or arrays." }
                            },
                            required: ['type', 'value']
                        }
                    }
                },
                required: ['id', 'tier', 'name', 'endpoint', 'preconditions', 'payload', 'assertions']
            }
        }
    },
    required: ['tests']
};

export const generateTestPlan = async (input: ScopeAnalysisInput): Promise<TestPlanOutput> => {
    const prompt = `TASK: Convert features + ACs into a test plan with V0/V1 markers.
RETURN JSON ONLY using the schema provided.

INPUT:
${JSON.stringify(input, null, 2)}

RULES:
- Map each AC to one test id.
- Mark tests as "tier": "V0" or "V1".
- Keep V0 minimal: no network, no external API calls, in-memory store only.
- Assume endpoints:
  - POST /events
  - POST /events/{id}/rsvp
  - GET  /events/{id}/attendees.txt
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [{ text: prompt }] },
            systemInstruction: { parts: [{ text: "You are an AI test engineer that creates API test plans from product specifications. You must follow the user's instructions precisely and only return JSON that adheres to the provided schema." }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: testPlanSchema,
                temperature: 0.1,
            }
        });

        const jsonText = response.text.trim();
        const parsed: TestPlanOutput = JSON.parse(jsonText);
        
        // The API returns payload as a string, parse it into an object.
        parsed.tests.forEach((test: Test) => {
            const testWithAnyPayload = test as any;
            if (typeof testWithAnyPayload.payload === 'string') {
                try {
                    test.payload = JSON.parse(testWithAnyPayload.payload);
                } catch (e) {
                    console.warn(`Failed to parse payload string for test ${test.id}:`, testWithAnyPayload.payload);
                    test.payload = {};
                }
            }

            // The `value` in assertions might be a stringified number or array. Let's parse it.
            test.assertions.forEach((assertion: any) => {
                try {
                    assertion.value = JSON.parse(assertion.value);
                } catch (e) {
                    // It's a normal string, do nothing.
                }
            });
        });
        return parsed;

    } catch (error) {
        console.error("Error generating test plan with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate test plan: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating test plan.");
    }
};
