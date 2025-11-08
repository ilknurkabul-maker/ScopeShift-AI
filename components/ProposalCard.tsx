
import React from 'react';
import { ProposedFeature } from '../types';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
const ZapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const ProposalCard: React.FC<{ proposal: ProposedFeature }> = ({ proposal }) => {
    const tierColor = proposal.tier_suggestion === 'V0' ? 'bg-green-800 text-green-200' : 'bg-sky-800 text-sky-200';
    const riskColor = {
        low: 'bg-green-800 text-green-200',
        med: 'bg-yellow-800 text-yellow-200',
        high: 'bg-red-800 text-red-200',
    }[proposal.risk];

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-md overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-md font-semibold text-slate-100">{proposal.title}</h3>
                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${riskColor} capitalize`}>
                        {proposal.risk} Risk
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${tierColor}`}>
                        {proposal.tier_suggestion}
                    </span>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                <p className="text-sm text-slate-400 italic">"{proposal.rationale}"</p>
                
                <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md text-xs">
                    <div className="flex items-center" title="Cold Start Impact">
                        <ZapIcon />
                        <span className="ml-1.5 text-slate-300">{proposal.impacts.cold_start_ms}ms</span>
                    </div>
                    <div className="flex items-center" title="p99 Latency Impact">
                        <ClockIcon />
                        <span className="ml-1.5 text-slate-300">{proposal.impacts.p99_latency_ms}ms</span>
                    </div>
                    <div className="flex items-center capitalize" title="Cost Impact">
                        <DollarSignIcon />
                         <span className="ml-1.5 text-slate-300">{proposal.impacts.cost}</span>
                    </div>
                    <div className="flex items-center" title="Constraints Met">
                        {proposal.constraints_ok ? <CheckCircleIcon /> : <XCircleIcon />}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Acceptance Criteria</h4>
                    <ul className="space-y-1.5">
                        {proposal.acs.map((ac, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 mt-1 mr-2"><CheckIcon /></span>
                                <span className="text-slate-300 text-sm">{ac}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {(proposal.depends_on && proposal.depends_on.length > 0 || proposal.conflicts && proposal.conflicts.length > 0) && (
                    <div className="border-t border-slate-700 pt-3 text-xs space-y-2">
                         {proposal.depends_on && proposal.depends_on.length > 0 && (
                            <div className="text-slate-400">
                                <span className="font-semibold">Depends on:</span> {proposal.depends_on.join(', ')}
                            </div>
                        )}
                        {proposal.conflicts && proposal.conflicts.length > 0 && (
                            <div className="flex items-start text-yellow-400">
                                <AlertTriangleIcon />
                                <div>
                                    <span className="font-semibold">Conflicts:</span>
                                    <ul className="list-disc list-inside">
                                        {proposal.conflicts.map((conflict, i) => <li key={i}>{conflict}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
