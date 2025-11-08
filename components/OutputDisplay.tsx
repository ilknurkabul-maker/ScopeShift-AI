
import React from 'react';
import { ScopeShiftOutput, Tab, Feature, TestSpec, CodeTemplate } from '../types';
import { FeatureCard } from './FeatureCard';
import { CodeBlock } from './CodeBlock';

interface OutputDisplayProps {
  output: ScopeShiftOutput | null;
  isLoading: boolean;
  error: string | null;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/3"></div>
        <div className="space-y-4">
            <div className="h-24 bg-slate-700 rounded"></div>
            <div className="h-24 bg-slate-700 rounded"></div>
            <div className="h-24 bg-slate-700 rounded"></div>
        </div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, error, activeTab, setActiveTab }) => {
  const tabs = Object.values(Tab);

  const renderContent = () => {
    if (isLoading) return <SkeletonLoader />;
    if (error) return <ErrorDisplay message={error} />;
    if (!output) {
      return (
        <div className="text-center text-slate-400 py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-200">No scope generated yet</h3>
          <p className="mt-1 text-sm text-slate-500">Enter a scenario and click "Generate Scope" to begin.</p>
        </div>
      );
    }

    switch (activeTab) {
      case Tab.Features:
        return (
          <div className="space-y-4">
            {output.features.length > 0 ? output.features.map(feature => <FeatureCard key={feature.id} feature={feature} />) : <p className="text-slate-400">No features were generated.</p>}
          </div>
        );
      case Tab.Tests:
         const getFeatureTitleForTest = (featureId: string) => output.features.find(f => f.id === featureId)?.title || 'Unknown Feature';
        return (
          <div className="space-y-6">
            {output.testSpecs.length > 0 ? output.testSpecs.map(spec => (
                <div key={spec.fileName}>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{getFeatureTitleForTest(spec.featureId)}</h3>
                    <CodeBlock language="python" fileName={spec.fileName} code={spec.code} />
                </div>
            )) : <p className="text-slate-400">No test specs were generated.</p>}
          </div>
        );
      case Tab.Code:
        const getFeatureTitleForCode = (featureId: string) => output.features.find(f => f.id === featureId)?.title || 'Unknown Feature';
        return (
          <div className="space-y-6">
            {output.codeTemplates.length > 0 ? output.codeTemplates.map(template => (
               <div key={template.fileName}>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{getFeatureTitleForCode(template.featureId)}</h3>
                    <CodeBlock language={template.language} fileName={template.fileName} code={template.code} />
               </div>
            )) : <p className="text-slate-400">No code templates were generated.</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6 flex-grow overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};
