
import React from 'react';
import { ScopeShiftOutput, Tab, ProposedFeature, ScopeAnalysisOutput, TestPlanOutput } from '../types';
import { FeatureCard } from './FeatureCard';
import { CodeBlock } from './CodeBlock';
import { ProposalCard } from './ProposalCard';
import { IssueCard } from './IssueCard';
import { TestCard } from './TestCard';

interface OutputDisplayProps {
  output: ScopeShiftOutput | null;
  isLoading: boolean;
  error: string | null;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onPropose: () => void;
  proposedFeatures: ProposedFeature[] | null;
  isProposing: boolean;
  proposalError: string | null;
  onAnalyze: () => void;
  analysisOutput: ScopeAnalysisOutput | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  onGenerateTests: () => void;
  testPlan: TestPlanOutput | null;
  isGeneratingTests: boolean;
  testPlanError: string | null;
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

const ProposalSkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-slate-700 rounded-lg"></div>
        <div className="h-40 bg-slate-700 rounded-lg"></div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const HealthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const BeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, error, activeTab, setActiveTab, onPropose, proposedFeatures, isProposing, proposalError, onAnalyze, analysisOutput, isAnalyzing, analysisError, onGenerateTests, testPlan, isGeneratingTests, testPlanError }) => {
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

  const renderProposals = () => {
    if (isProposing) return <ProposalSkeletonLoader />;
    if (proposalError) return <ErrorDisplay message={proposalError} />;
    if (!proposedFeatures) return null;
    if (proposedFeatures.length === 0) {
        return <p className="text-slate-400 text-center py-8">No new feature suggestions at this time.</p>;
    }
    return (
        <div className="space-y-4">
            {proposedFeatures.map(p => <ProposalCard key={p.id} proposal={p} />)}
        </div>
    );
  }

  const renderAnalysis = () => {
    if (isAnalyzing) return <ProposalSkeletonLoader />;
    if (analysisError) return <ErrorDisplay message={analysisError} />;
    if (!analysisOutput) return null;
    if (analysisOutput.issues.length === 0) {
        return (
            <div className="text-center py-6 text-green-300 bg-green-900/40 rounded-lg border border-green-700/50">
                <CheckCircleIcon />
                <p className="mt-2 font-semibold">No issues found. Your scope looks healthy!</p>
            </div>
        );
    }
    return (
      <>
        {(typeof analysisOutput.score === 'number' || analysisOutput.notes) && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300">
            {typeof analysisOutput.score === 'number' && <p className="font-semibold"><strong>Overall Score:</strong> {analysisOutput.score}/100</p>}
            {analysisOutput.notes && <p className="text-sm text-slate-400 mt-1"><strong>Notes:</strong> {analysisOutput.notes}</p>}
          </div>
        )}
        <div className="space-y-4">
            {analysisOutput.issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </>
    );
  }

  const renderTestPlan = () => {
    if (isGeneratingTests) return <ProposalSkeletonLoader />;
    if (testPlanError) return <ErrorDisplay message={testPlanError} />;
    if (!testPlan) return null;
    if (testPlan.tests.length === 0) {
        return <p className="text-slate-400 text-center py-8">No tests were generated for this scope.</p>;
    }
    return (
        <div className="space-y-4">
            {testPlan.tests.map(t => <TestCard key={t.id} test={t} />)}
        </div>
    );
  }

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
        
        {output && !isLoading && !error && (
          <div className="my-8 flex flex-wrap gap-4 items-center justify-center">
            <button
              onClick={onPropose}
              disabled={isProposing || isAnalyzing || isGeneratingTests}
              className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
            >
              {isProposing ? <LoadingSpinner /> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              )}
              {isProposing ? 'Thinking...' : 'Suggest Features'}
            </button>
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing || isProposing || isGeneratingTests}
              className="px-5 py-2.5 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
            >
              {isAnalyzing ? <LoadingSpinner /> : <HealthIcon />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Scope Health'}
            </button>
             <button
              onClick={onGenerateTests}
              disabled={isAnalyzing || isProposing || isGeneratingTests}
              className="px-5 py-2.5 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
            >
              {isGeneratingTests ? <LoadingSpinner /> : <BeakerIcon />}
              {isGeneratingTests ? 'Generating...' : 'Generate Test Plan'}
            </button>
          </div>
        )}

        {(isProposing || proposalError || proposedFeatures) && (
            <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-100">Next Feature Proposals</h3>
                {renderProposals()}
            </div>
        )}

        {(isAnalyzing || analysisError || analysisOutput) && (
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-100">Scope Health Analysis</h3>
                {renderAnalysis()}
            </div>
        )}

        {(isGeneratingTests || testPlanError || testPlan) && (
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-100">API Test Plan</h3>
                {renderTestPlan()}
            </div>
        )}
      </div>
    </div>
  );
};
