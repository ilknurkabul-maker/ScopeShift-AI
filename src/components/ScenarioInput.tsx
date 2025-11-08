
import React from 'react';

interface ScenarioInputProps {
  scenario: string;
  setScenario: (scenario: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.292-2.293z" />
        <path d="M7.414 10.586a1 1 0 01-1.414-1.414L10.586 4.586a1 1 0 011.414 1.414L7.414 10.586zm-2 2a1 1 0 01-1.414 0L.293 8.879a1 1 0 111.414-1.414L5.414 11.172a1 1 0 010 1.414z" />
        <path fillRule="evenodd" d="M12.293 17.293a1 1 0 011.414 0l2.293 2.293a1 1 0 01-1.414 1.414l-2.293-2.293a1 1 0 010-1.414zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const ScenarioInput: React.FC<ScenarioInputProps> = ({ scenario, setScenario, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col h-full bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-100">Product Scenario</h2>
      <p className="text-slate-400 mb-6">Describe your product idea or a user story. ScopeShift will break it down into a developer-ready plan.</p>
      <textarea
        className="flex-grow w-full p-4 bg-slate-900 border border-slate-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
        placeholder="e.g., A web app for users to upload a photo of a plant and get an AI-powered identification and care guide."
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !scenario.trim()}
        className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors duration-200"
      >
        {isLoading ? <LoadingSpinner /> : <WandIcon />}
        {isLoading ? 'Generating...' : 'Generate Scope'}
      </button>
    </div>
  );
};