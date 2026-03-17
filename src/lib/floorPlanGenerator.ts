import { getRoomById, RoomType } from "./roomCatalog";

export interface RoomSelection {
  roomId: string;
  count: number;
}

export interface GeneratedRoom {
  id: string;
  roomType: string;
  label: string;
  floor: number;
  width: number;
  depth: number;
  area: number;
  x: number;
  y: number;
  color: string;
}

export interface FloorPlanResult {
  rooms: GeneratedRoom[];
  totalSqm: number;
  width: number;
  depth: number;
}

// Simple floor plan layout algorithm
export function generateFloorPlan(
  selections: RoomSelection[],
  targetSqm: number,
  stories: number
): FloorPlanResult {
  const rooms: GeneratedRoom[] = [];
  let roomIndex = 0;

  // Expand selections into individual rooms
  const allRooms: { type: RoomType; floor: number }[] = [];

  for (const selection of selections) {
    const roomType = getRoomById(selection.roomId);
    if (!roomType) continue;

    for (let i = 0; i < selection.count; i++) {
      // Distribute rooms across floors
      const floor = stories > 1
        ? (roomType.id.includes('bedroom') || roomType.id === 'master_bath' || roomType.id === 'walk_in_closet')
          ? 2 // Bedrooms on upper floor
          : 1 // Living spaces on ground floor
        : 1;

      allRooms.push({ type: roomType, floor });
    }
  }

  // Calculate total area and scaling factor
  const totalDefaultArea = allRooms.reduce((sum, r) => sum + r.type.defaultSqm, 0);
  const areaPerFloor = targetSqm / stories;
  const scaleFactor = areaPerFloor / (totalDefaultArea / stories) || 1;

  // Layout rooms in a grid-like pattern per floor
  for (let floor = 1; floor <= stories; floor++) {
    const floorRooms = allRooms.filter(r => r.floor === floor);

    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    const maxWidth = Math.sqrt(areaPerFloor) * 1.2; // Approximate building width

    for (const { type } of floorRooms) {
      const scaledArea = type.defaultSqm * Math.min(scaleFactor, 1.5);
      const aspectRatio = 0.7 + Math.random() * 0.6; // Vary room proportions
      const width = Math.sqrt(scaledArea * aspectRatio);
      const depth = scaledArea / width;

      // Wrap to next row if needed
      if (currentX + width > maxWidth && currentX > 0) {
        currentX = 0;
        currentY += rowHeight + 0.15; // Wall thickness
        rowHeight = 0;
      }

      rooms.push({
        id: `room_${roomIndex++}`,
        roomType: type.id,
        label: type.label,
        floor,
        width: Math.round(width * 10) / 10,
        depth: Math.round(depth * 10) / 10,
        area: Math.round(scaledArea * 10) / 10,
        x: Math.round(currentX * 10) / 10,
        y: Math.round(currentY * 10) / 10,
        color: type.color,
      });

      currentX += width + 0.15; // Wall thickness
      rowHeight = Math.max(rowHeight, depth);
    }
  }

  // Calculate overall dimensions
  const maxX = Math.max(...rooms.map(r => r.x + r.width), 0);
  const maxY = Math.max(...rooms.map(r => r.y + r.depth), 0);
  const actualTotalSqm = rooms.reduce((sum, r) => sum + r.area, 0);

  return {
    rooms,
    totalSqm: Math.round(actualTotalSqm),
    width: Math.round(maxX * 10) / 10,
    depth: Math.round(maxY * 10) / 10,
  };
}
