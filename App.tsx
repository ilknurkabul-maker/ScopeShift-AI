
import React, { useState } from 'react';
import { ScenarioInput } from './components/ScenarioInput';
import { OutputDisplay } from './components/OutputDisplay';
import { ScopeShiftOutput, Tab } from './types';
import { generateScope } from './services/geminiService';

function App() {
  const [scenario, setScenario] = useState('');
  const [output, setOutput] = useState<ScopeShiftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Features);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutput(null);
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
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
