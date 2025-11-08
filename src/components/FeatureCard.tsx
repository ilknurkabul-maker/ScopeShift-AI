
import React from 'react';
import { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const tierColor = feature.tier === 'V0' ? 'bg-green-800 text-green-200' : 'bg-sky-800 text-sky-200';
  const borderColor = feature.tier === 'V0' ? 'border-green-700' : 'border-sky-700';

  return (
    <div className={`bg-slate-900 border ${borderColor} rounded-lg shadow-md overflow-hidden`}>
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100">{feature.title}</h3>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${tierColor}`}>{feature.tier}</span>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Acceptance Criteria</h4>
        <ul className="space-y-2">
          {feature.acceptanceCriteria.map(ac => (
            <li key={ac.id} className="flex items-start">
              <span className="flex-shrink-0 mt-1 mr-2"><CheckIcon /></span>
              <span className="text-slate-300 text-sm">{ac.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};