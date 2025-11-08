
import React from 'react';
import { Issue } from '../types';

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 inline-block mr-2 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);


export const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => {
    const severityConfig = {
        critical: {
            bg: 'bg-red-900/30',
            border: 'border-red-700/50',
            text: 'text-red-300',
            icon: <AlertTriangleIcon className="text-red-400" />
        },
        warning: {
            bg: 'bg-yellow-900/30',
            border: 'border-yellow-700/50',
            text: 'text-yellow-300',
            icon: <AlertTriangleIcon className="text-yellow-400" />
        },
        info: {
            bg: 'bg-sky-900/30',
            border: 'border-sky-700/50',
            text: 'text-sky-300',
            icon: <AlertTriangleIcon className="text-sky-400" />
        },
    };

    const config = severityConfig[issue.severity] || severityConfig.info;

    const formatLocationType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className={`rounded-lg border ${config.border} ${config.bg} shadow-md`}>
            <div className={`p-3 border-b ${config.border} flex justify-between items-center flex-wrap gap-2`}>
                <h3 className={`font-semibold text-md capitalize ${config.text} flex items-center`}>
                    {config.icon}
                    {issue.severity}: {formatLocationType(issue.location.type)}
                </h3>
                {issue.location.feature_id && (
                    <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        {issue.location.feature_id}
                        {issue.location.ac_index != null ? `:AC[${issue.location.ac_index}]` : ''}
                    </span>
                )}
            </div>
            <div className="p-4 space-y-3">
                <p className="text-slate-300 text-sm">{issue.message}</p>
                <div className="bg-slate-800/70 p-3 rounded-md border border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Proposed Fix</h4>
                    <div className="text-sm space-y-2">
                        {issue.proposed_fix.action && (
                            <div className="flex items-start">
                                <span className="font-bold text-indigo-400 uppercase text-xs w-24 flex-shrink-0">Action</span>
                                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-indigo-300 text-xs">{issue.proposed_fix.action}</span>
                            </div>
                        )}
                         {issue.proposed_fix.updated_text && (
                            <div className="flex items-start">
                                <span className="font-bold text-indigo-400 uppercase text-xs w-24 flex-shrink-0">Updated Text</span>
                                <code className="text-xs bg-slate-900 p-2 rounded text-slate-300 w-full overflow-x-auto whitespace-pre-wrap">{issue.proposed_fix.updated_text}</code>
                            </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-slate-700/50 text-slate-400 italic flex items-start">
                            <strong className="text-slate-300 not-italic font-bold uppercase text-xs w-24 flex-shrink-0">Summary</strong> 
                            <span className="flex-1">{issue.proposed_fix.summary}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};