
import React from 'react';
import { Test, Assertion } from '../types';

const MiniCode: React.FC<{ data: object | string }> = ({ data }) => {
    let formattedData: string;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            formattedData = JSON.stringify(parsed, null, 2);
        } catch {
            formattedData = data;
        }
    } else {
        formattedData = JSON.stringify(data, null, 2);
    }

    if (formattedData === '{}') {
        return <span className="text-slate-500 text-xs italic">empty</span>
    }

    return (
        <pre className="p-2 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto">
            <code>{formattedData}</code>
        </pre>
    );
};

const renderAssertionValue = (value: any) => {
    if (Array.isArray(value)) {
        return `[${value.map(v => `"${v}"`).join(', ')}]`;
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return String(value);
};

export const TestCard: React.FC<{ test: Test }> = ({ test }) => {
    const tierColor = test.tier === 'V0' ? 'bg-green-800 text-green-200' : 'bg-sky-800 text-sky-200';
    const borderColor = test.tier === 'V0' ? 'border-green-700/50' : 'border-sky-700/50';

    const getMethodColor = (endpoint: string) => {
        const method = endpoint.split(' ')[0].toUpperCase();
        switch (method) {
            case 'POST': return 'text-green-400';
            case 'GET': return 'text-sky-400';
            case 'PUT': return 'text-yellow-400';
            case 'DELETE': return 'text-red-400';
            default: return 'text-slate-400';
        }
    }

    return (
        <div className={`bg-slate-900 border ${borderColor} rounded-lg shadow-md overflow-hidden`}>
            <div className="p-3 border-b border-slate-700 flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-md font-semibold text-slate-100 font-mono">{test.name}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${tierColor}`}>{test.tier}</span>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex items-center bg-slate-800/70 p-2 rounded-md">
                    <span className={`font-bold text-sm mr-3 ${getMethodColor(test.endpoint)}`}>{test.endpoint.split(' ')[0]}</span>
                    <span className="font-mono text-slate-300 text-sm">{test.endpoint.split(' ')[1]}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Payload</h4>
                        <MiniCode data={test.payload} />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Assertions</h4>
                        <ul className="space-y-1 text-xs font-mono text-slate-300 bg-slate-800/70 p-2 rounded-md">
                            {test.assertions.map((assertion, index) => (
                                <li key={index}>
                                    <span className="text-indigo-400">{assertion.type}</span>
                                    <span className="text-slate-500">{assertion.op || ''}</span>
                                    <span className="text-amber-300">{renderAssertionValue(assertion.value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};
