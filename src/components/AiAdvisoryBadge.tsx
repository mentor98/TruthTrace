/**
 * TruthTrace: AI Advisory Badge & Epistemic Notice Component
 * Enforces clear epistemological labeling across all AI-generated suggestions
 */

import React from 'react';
import { Sparkles, AlertCircle, Info } from 'lucide-react';

interface AiAdvisoryBadgeProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  confidenceScore?: number;
}

export const AiAdvisoryBadge: React.FC<AiAdvisoryBadgeProps> = ({
  label = 'AI-Assisted Draft',
  size = 'md',
  showDetails = false,
  confidenceScore,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-xs sm:text-sm px-3 py-1.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 ${sizeClasses[size]}`}
        title="This content was synthesized by an AI model. It represents a working hypothesis and MUST be verified against original sources by a human researcher."
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>{label}</span>
        {confidenceScore !== undefined && (
          <span className="font-mono text-[10px] text-indigo-700 pl-1 border-l border-indigo-200">
            {confidenceScore}%
          </span>
        )}
      </span>

      {showDetails && (
        <span className="text-[11px] text-slate-500 flex items-center gap-1 italic">
          <Info className="w-3 h-3 text-slate-400" />
          Advisory only — verify before citing
        </span>
      )}
    </div>
  );
};

export const AiDisclaimerBanner: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'AI Epistemic Advisory',
  description = 'AI outputs are generative hypotheses and synthesis aids. TruthTrace never treats AI model output as verified ground truth. Always inspect original peer-reviewed or primary sources.',
}) => {
  return (
    <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-3.5 text-xs text-indigo-950 flex items-start gap-3">
      <div className="p-1 rounded bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="space-y-0.5">
        <div className="font-semibold text-indigo-900 flex items-center gap-2">
          {title}
          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded">
            Non-Authoritative
          </span>
        </div>
        <p className="text-indigo-900/80 leading-relaxed text-xs">{description}</p>
      </div>
    </div>
  );
};

