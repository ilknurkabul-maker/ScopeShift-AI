
import React, { useState } from 'react';
import { ScenarioInput } from './components/ScenarioInput';
import { OutputDisplay } from './components/OutputDisplay';
import { ScopeShiftOutput, Tab, ProposedFeature, ScopeAnalysisOutput } from './types';
import { generateScope, proposeFeatures, analyzeScope } from './services/geminiService';

function App() {
  const [scenario, setScenario] = useState('');
  const [output, setOutput] = useState<ScopeShiftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Features);

  const [proposedFeatures, setProposedFeatures] = useState<ProposedFeature[] | null>(null);
  const [isProposing, setIsProposing] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const [analysisOutput, setAnalysisOutput] = useState<ScopeAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setProposedFeatures(null);
    setProposalError(null);
    setAnalysisOutput(null);
    setAnalysisError(null);
    try {
      const result = await generateScope(scenario);
      setOutput(result);
      setActiveTab(Tab.Features);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropose = async () => {
    if (!output?.features || output.features.length === 0) return;
    setIsProposing(true);
    setProposalError(null);
    setProposedFeatures(null);
    try {
      const result = await proposeFeatures(output.features);
      setProposedFeatures(result.candidates);
    } catch (err) {
      if (err instanceof Error) {
        setProposalError(err.message);
      } else {
        setProposalError('An unknown error occurred while proposing features.');
      }
    } finally {
      setIsProposing(false);
    }
  };

  const handleAnalyzeScope = async () => {
    if (!output) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisOutput(null);

    const analysisInput = {
        features: output.features.map(f => ({ id: f.id, title: f.title, tier: f.tier })),
        acceptance: output.features.flatMap(f => 
            f.acceptanceCriteria.map(ac => ({ feature: f.id, id: ac.id, text: ac.description }))
        ),
        constraints: {
            cold_start_ms: 400,
            auth_required: false,
            p99_latency_ms: 800
        }
    };

    try {
        const result = await analyzeScope(analysisInput);
        setAnalysisOutput(result);
    } catch (err) {
        if (err instanceof Error) {
            setAnalysisError(err.message);
        } else {
            setAnalysisError('An unknown error occurred during scope analysis.');
        }
    } finally {
        setIsAnalyzing(false);
    }
};


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
            ScopeShift <span className="text-indigo-400">AI</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-400">
            Your AI-powered Product Manager copilot for rapid prototyping.
          </p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
          <div className="h-full">
            <ScenarioInput 
              scenario={scenario} 
              setScenario={setScenario} 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
            />
          </div>
          <div className="h-full">
            <OutputDisplay 
              output={output}
              isLoading={isLoading}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onPropose={handlePropose}
              proposedFeatures={proposedFeatures}
              isProposing={isProposing}
              proposalError={proposalError}
              onAnalyze={handleAnalyzeScope}
              analysisOutput={analysisOutput}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
