import React from "react";
import { ARCHITECTURAL_STYLES, ArchitecturalStyle } from "../lib/architecturalStyles";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
}

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-stone-600 border-b border-stone-200 pb-2">
        النمط المعماري
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ARCHITECTURAL_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`
              relative p-4 rounded-xl border-2 text-right transition-all overflow-hidden
              ${selectedStyle === style.id
                ? "border-amber-500 bg-gradient-to-br " + style.gradient + " shadow-lg scale-[1.02]"
                : "border-stone-200 bg-white hover:border-stone-300 hover:shadow"
              }
            `}
          >
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <pattern id={`pattern-${style.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                  <path d="M0 10 L20 10 M10 0 L10 20" stroke="currentColor" strokeWidth="0.3" />
                </pattern>
                <rect width="100" height="100" fill={`url(#pattern-${style.id})`} />
              </svg>
            </div>

            <div className="relative">
              <p className="font-bold text-stone-800">{style.label}</p>
              <p className="text-xs text-stone-500 mt-1">{style.description}</p>
            </div>

            {selectedStyle === style.id && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
