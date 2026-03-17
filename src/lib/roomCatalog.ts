export interface RoomType {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  minSqm: number;
  defaultSqm: number;
  color: string;
}

export interface RoomCategory {
  id: string;
  label: string;
  labelEn: string;
  rooms: RoomType[];
}

export const ROOM_CATALOG: RoomCategory[] = [
  {
    id: "bedrooms_baths",
    label: "غرف النوم والحمامات",
    labelEn: "Bedrooms & Baths",
    rooms: [
      { id: "master_bedroom", label: "غرفة النوم الرئيسية", labelEn: "Master Bedroom", icon: "🛏️", minSqm: 20, defaultSqm: 28, color: "#FFE4D6" },
      { id: "bedroom", label: "غرفة نوم", labelEn: "Bedroom", icon: "🛏️", minSqm: 12, defaultSqm: 16, color: "#FFD6E4" },
      { id: "master_bath", label: "حمام رئيسي", labelEn: "Master Bath", icon: "🚿", minSqm: 8, defaultSqm: 12, color: "#E4D6FF" },
      { id: "bathroom", label: "حمام", labelEn: "Bathroom", icon: "🚿", minSqm: 4, defaultSqm: 6, color: "#D6E4FF" },
      { id: "walk_in_closet", label: "غرفة ملابس", labelEn: "Walk-in Closet", icon: "👔", minSqm: 6, defaultSqm: 10, color: "#F5E6CC" },
    ],
  },
  {
    id: "living",
    label: "المعيشة والضيافة",
    labelEn: "Living & Reception",
    rooms: [
      { id: "majlis", label: "مجلس", labelEn: "Majlis", icon: "🛋️", minSqm: 25, defaultSqm: 40, color: "#D6E8FF" },
      { id: "living_room", label: "غرفة معيشة", labelEn: "Living Room", icon: "🛋️", minSqm: 20, defaultSqm: 30, color: "#D6F5E8" },
      { id: "dining_room", label: "غرفة طعام", labelEn: "Dining Room", icon: "🍽️", minSqm: 15, defaultSqm: 22, color: "#E8F5D6" },
      { id: "kitchen", label: "مطبخ", labelEn: "Kitchen", icon: "🍳", minSqm: 12, defaultSqm: 18, color: "#FFF9D6" },
      { id: "family_room", label: "غرفة عائلية", labelEn: "Family Room", icon: "📺", minSqm: 20, defaultSqm: 30, color: "#F5F0D6" },
      { id: "guest_room", label: "غرفة ضيوف", labelEn: "Guest Room", icon: "🛏️", minSqm: 12, defaultSqm: 16, color: "#D6FFE8" },
    ],
  },
  {
    id: "services",
    label: "الخدمات",
    labelEn: "Services",
    rooms: [
      { id: "maid_room", label: "غرفة خادمة", labelEn: "Maid Room", icon: "🏠", minSqm: 9, defaultSqm: 12, color: "#F5F5F5" },
      { id: "driver_room", label: "غرفة سائق", labelEn: "Driver Room", icon: "🚗", minSqm: 9, defaultSqm: 12, color: "#E8E8E8" },
      { id: "storage", label: "مستودع", labelEn: "Storage", icon: "📦", minSqm: 6, defaultSqm: 10, color: "#DDD" },
      { id: "laundry", label: "غرفة غسيل", labelEn: "Laundry", icon: "🧺", minSqm: 6, defaultSqm: 8, color: "#E0F0FF" },
    ],
  },
  {
    id: "outdoor",
    label: "المساحات الخارجية",
    labelEn: "Outdoor Spaces",
    rooms: [
      { id: "garage", label: "مرآب", labelEn: "Garage", icon: "🚗", minSqm: 18, defaultSqm: 28, color: "#D0D0D0" },
      { id: "garden", label: "حديقة", labelEn: "Garden", icon: "🌿", minSqm: 30, defaultSqm: 60, color: "#C8E6C9" },
      { id: "pool", label: "مسبح", labelEn: "Pool", icon: "🏊", minSqm: 20, defaultSqm: 40, color: "#B3E5FC" },
      { id: "courtyard", label: "فناء داخلي", labelEn: "Courtyard", icon: "☀️", minSqm: 15, defaultSqm: 25, color: "#FFF3E0" },
    ],
  },
  {
    id: "specialty",
    label: "غرف متخصصة",
    labelEn: "Specialty Rooms",
    rooms: [
      { id: "home_office", label: "مكتب منزلي", labelEn: "Home Office", icon: "💼", minSqm: 10, defaultSqm: 15, color: "#F3E5F5" },
      { id: "prayer_room", label: "غرفة صلاة", labelEn: "Prayer Room", icon: "🕌", minSqm: 8, defaultSqm: 12, color: "#FFE8D6" },
      { id: "gym", label: "صالة رياضية", labelEn: "Gym", icon: "💪", minSqm: 15, defaultSqm: 25, color: "#FFECB3" },
      { id: "media_room", label: "غرفة سينما", labelEn: "Media Room", icon: "🎬", minSqm: 20, defaultSqm: 30, color: "#37474F" },
    ],
  },
];

export const getRoomById = (id: string): RoomType | undefined => {
  for (const category of ROOM_CATALOG) {
    const room = category.rooms.find(r => r.id === id);
    if (room) return room;
  }
  return undefined;
};
