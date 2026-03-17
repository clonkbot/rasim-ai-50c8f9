import React from "react";
import { ROOM_CATALOG, RoomCategory, RoomType } from "../lib/roomCatalog";
import { RoomSelection } from "../lib/floorPlanGenerator";

interface RoomCatalogProps {
  selections: RoomSelection[];
  onSelectionsChange: (selections: RoomSelection[]) => void;
}

export function RoomCatalog({ selections, onSelectionsChange }: RoomCatalogProps) {
  const getCount = (roomId: string) => {
    return selections.find(s => s.roomId === roomId)?.count || 0;
  };

  const updateCount = (roomId: string, delta: number) => {
    const current = getCount(roomId);
    const newCount = Math.max(0, Math.min(10, current + delta));

    if (newCount === 0) {
      onSelectionsChange(selections.filter(s => s.roomId !== roomId));
    } else {
      const existing = selections.find(s => s.roomId === roomId);
      if (existing) {
        onSelectionsChange(
          selections.map(s => s.roomId === roomId ? { ...s, count: newCount } : s)
        );
      } else {
        onSelectionsChange([...selections, { roomId, count: newCount }]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {ROOM_CATALOG.map((category) => (
        <div key={category.id} className="space-y-3">
          <h3 className="text-sm font-bold text-stone-600 border-b border-stone-200 pb-2">
            {category.label}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {category.rooms.map((room) => {
              const count = getCount(room.id);
              return (
                <div
                  key={room.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${count > 0
                      ? "border-amber-400 bg-amber-50/50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{room.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-800">{room.label}</p>
                      <p className="text-xs text-stone-500">{room.defaultSqm} م²</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCount(room.id, -1)}
                      disabled={count === 0}
                      className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold
                        hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-stone-800">{count}</span>
                    <button
                      onClick={() => updateCount(room.id, 1)}
                      disabled={count >= 10}
                      className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold
                        hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
