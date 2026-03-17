import React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { getStyleById } from "../lib/architecturalStyles";

interface DraftCardProps {
  draft: {
    _id: Id<"drafts">;
    name: string;
    style: string;
    totalSqm: number;
    stories: number;
    pinCount: number;
    createdAt: number;
  };
  onSelect: (id: Id<"drafts">) => void;
  onPin?: (id: Id<"drafts">) => void;
  isPinned?: boolean;
}

export function DraftCard({ draft, onSelect, onPin, isPinned }: DraftCardProps) {
  const style = getStyleById(draft.style);

  return (
    <div
      className={`
        group relative rounded-2xl border-2 border-stone-200 bg-white overflow-hidden
        hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer
      `}
      onClick={() => onSelect(draft._id)}
    >
      {/* Gradient header based on style */}
      <div className={`h-24 bg-gradient-to-br ${style?.gradient || "from-stone-100 to-stone-200"} relative`}>
        {/* Abstract floor plan preview */}
        <div className="absolute inset-4 opacity-30">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <rect x="5" y="5" width="30" height="25" fill="currentColor" rx="2" />
            <rect x="40" y="5" width="25" height="50" fill="currentColor" rx="2" />
            <rect x="70" y="5" width="25" height="25" fill="currentColor" rx="2" />
            <rect x="5" y="35" width="30" height="20" fill="currentColor" rx="2" />
            <rect x="70" y="35" width="25" height="20" fill="currentColor" rx="2" />
          </svg>
        </div>

        {/* Stories badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-stone-700">
          {draft.stories} {draft.stories === 1 ? "طابق" : "طوابق"}
        </div>

        {/* Pin button */}
        {onPin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(draft._id);
            }}
            className={`
              absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center
              transition-all ${isPinned
                ? "bg-amber-500 text-white"
                : "bg-white/90 text-stone-400 hover:text-amber-500"
              }
            `}
          >
            <svg className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-stone-800 truncate">{draft.name}</h3>

        <div className="flex items-center gap-3 text-sm text-stone-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {draft.totalSqm} م²
          </span>

          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {draft.pinCount}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            bg-gradient-to-r ${style?.gradient || "from-stone-100 to-stone-200"} text-stone-700
          `}>
            {style?.label || draft.style}
          </span>

          <span className="text-xs text-stone-400">
            {new Date(draft.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>
      </div>
    </div>
  );
}
