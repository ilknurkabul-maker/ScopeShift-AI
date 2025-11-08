
import { GoogleGenAI, Type } from "@google/genai";
import { ScopeShiftOutput } from '../types';

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
      contents: [{ role: 'user', parts: [{ text: scenario }] }],
      config: {
        systemInstruction: { role: 'model', parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
      }
    });

    const jsonText = response.text.trim();
    // It's good practice to validate the parsed object, but we trust Gemini with responseSchema
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
