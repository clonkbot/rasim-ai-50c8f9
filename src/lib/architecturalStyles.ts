export interface ArchitecturalStyle {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  gradient: string;
  pattern: string;
}

export const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
  {
    id: "gulf_traditional",
    label: "خليجي تراثي",
    labelEn: "Gulf Traditional",
    description: "أقواس، نقوش، أبراج هواء",
    descriptionEn: "Arches, ornaments, wind towers",
    gradient: "from-amber-100 to-orange-200",
    pattern: "islamic-pattern",
  },
  {
    id: "neoclassic",
    label: "نيوكلاسيك",
    labelEn: "Neoclassic",
    description: "أعمدة كلاسيكية، فخامة رسمية",
    descriptionEn: "Classical columns, formal luxury",
    gradient: "from-stone-100 to-slate-200",
    pattern: "columns-pattern",
  },
  {
    id: "contemporary",
    label: "معاصر",
    labelEn: "Contemporary",
    description: "خطوط نظيفة، زجاج، بساطة",
    descriptionEn: "Clean lines, glass, minimalism",
    gradient: "from-slate-100 to-zinc-200",
    pattern: "minimal-pattern",
  },
  {
    id: "andalusian",
    label: "أندلسي",
    labelEn: "Andalusian",
    description: "فناء داخلي، أقواس، نافورة",
    descriptionEn: "Inner courtyard, arches, fountain",
    gradient: "from-blue-100 to-teal-200",
    pattern: "moorish-pattern",
  },
  {
    id: "modern_arabic",
    label: "عربي حديث",
    labelEn: "Modern Arabic",
    description: "مزج التراث بالحداثة",
    descriptionEn: "Blend of heritage and modernity",
    gradient: "from-amber-50 to-yellow-200",
    pattern: "mashrabiya-pattern",
  },
  {
    id: "mediterranean",
    label: "متوسطي",
    labelEn: "Mediterranean",
    description: "أسقف مائلة، طلاء أبيض",
    descriptionEn: "Sloped roofs, white paint",
    gradient: "from-sky-100 to-blue-200",
    pattern: "terracotta-pattern",
  },
];

export const getStyleById = (id: string): ArchitecturalStyle | undefined => {
  return ARCHITECTURAL_STYLES.find(s => s.id === id);
};
