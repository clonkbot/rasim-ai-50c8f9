import React from "react";
import { GeneratedRoom } from "../lib/floorPlanGenerator";

interface FloorPlanCanvasProps {
  rooms: GeneratedRoom[];
  width: number;
  depth: number;
  selectedFloor: number;
}

const SCALE = 25; // 1 meter = 25 pixels
const PADDING = 40;

export function FloorPlanCanvas({ rooms, width, depth, selectedFloor }: FloorPlanCanvasProps) {
  const canvasWidth = width * SCALE + PADDING * 2;
  const canvasHeight = depth * SCALE + PADDING * 2;

  const floorRooms = rooms.filter(r => r.floor === selectedFloor);

  return (
    <div className="overflow-auto rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 shadow-inner">
      <svg
        width={Math.max(canvasWidth, 300)}
        height={Math.max(canvasHeight, 200)}
        className="mx-auto"
        style={{ direction: "ltr" }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
            <path
              d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Building outline */}
        <rect
          x={PADDING}
          y={PADDING}
          width={width * SCALE}
          height={depth * SCALE}
          fill="none"
          stroke="#1c1917"
          strokeWidth="3"
          rx="4"
        />

        {/* Rooms */}
        {floorRooms.map((room) => (
          <g key={room.id}>
            {/* Room fill */}
            <rect
              x={room.x * SCALE + PADDING}
              y={room.y * SCALE + PADDING}
              width={room.width * SCALE}
              height={room.depth * SCALE}
              fill={room.color}
              stroke="#78716c"
              strokeWidth="1.5"
              rx="2"
              className="transition-all hover:opacity-80"
            />

            {/* Room label */}
            <text
              x={room.x * SCALE + PADDING + (room.width * SCALE) / 2}
              y={room.y * SCALE + PADDING + (room.depth * SCALE) / 2 - 6}
              textAnchor="middle"
              className="fill-stone-700 text-[10px] font-semibold"
              style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
            >
              {room.label}
            </text>

            {/* Room area */}
            <text
              x={room.x * SCALE + PADDING + (room.width * SCALE) / 2}
              y={room.y * SCALE + PADDING + (room.depth * SCALE) / 2 + 8}
              textAnchor="middle"
              className="fill-stone-500 text-[9px]"
              style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
            >
              {room.area} م²
            </text>

            {/* Dimensions */}
            <text
              x={room.x * SCALE + PADDING + (room.width * SCALE) / 2}
              y={room.y * SCALE + PADDING + room.depth * SCALE - 4}
              textAnchor="middle"
              className="fill-stone-400 text-[7px]"
            >
              {room.width}م × {room.depth}م
            </text>
          </g>
        ))}

        {/* Scale indicator */}
        <g transform={`translate(${PADDING}, ${depth * SCALE + PADDING + 15})`}>
          <line x1="0" y1="0" x2={SCALE * 5} y2="0" stroke="#78716c" strokeWidth="2" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#78716c" strokeWidth="2" />
          <line x1={SCALE * 5} y1="-3" x2={SCALE * 5} y2="3" stroke="#78716c" strokeWidth="2" />
          <text x={SCALE * 2.5} y="12" textAnchor="middle" className="fill-stone-500 text-[9px]">
            5 متر
          </text>
        </g>

        {/* North arrow */}
        <g transform={`translate(${width * SCALE + PADDING - 20}, ${PADDING + 20})`}>
          <polygon points="0,-15 5,5 0,0 -5,5" fill="#78716c" />
          <text y="18" textAnchor="middle" className="fill-stone-500 text-[10px] font-bold">
            ش
          </text>
        </g>
      </svg>
    </div>
  );
}
