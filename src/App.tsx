import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { Id, Doc } from "../convex/_generated/dataModel";
import { SignInForm, SignUpForm, AnonymousSignIn } from "./components/AuthForms";
import { RoomCatalog } from "./components/RoomCatalog";
import { StyleSelector } from "./components/StyleSelector";
import { FloorPlanCanvas } from "./components/FloorPlanCanvas";
import { DraftCard } from "./components/DraftCard";
import { RoomSelection, generateFloorPlan, GeneratedRoom } from "./lib/floorPlanGenerator";
import { getStyleById } from "./lib/architecturalStyles";

type Draft = Doc<"drafts">;

type View = "landing" | "create" | "studio" | "explore" | "detail";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  const [view, setView] = useState<View>("landing");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Create view state
  const [selections, setSelections] = useState<RoomSelection[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("gulf_traditional");
  const [stories, setStories] = useState(1);
  const [targetSqm, setTargetSqm] = useState(300);
  const [ceilingHeight, setCeilingHeight] = useState(3.0);
  const [generatedPlan, setGeneratedPlan] = useState<{
    rooms: GeneratedRoom[];
    width: number;
    depth: number;
    totalSqm: number;
  } | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Detail view state
  const [selectedDraftId, setSelectedDraftId] = useState<Id<"drafts"> | null>(null);

  // Queries
  const profile = useQuery(api.profiles.get);
  const myDrafts = useQuery(api.drafts.list);
  const publicDrafts = useQuery(api.drafts.listPublic, { limit: 12 });
  const selectedDraft = useQuery(
    api.drafts.get,
    selectedDraftId ? { id: selectedDraftId } : "skip"
  );

  // Mutations
  const ensureProfile = useMutation(api.profiles.ensureProfile);
  const createDraft = useMutation(api.drafts.create);
  const deleteDraft = useMutation(api.drafts.remove);
  const togglePin = useMutation(api.pins.toggle);

  // Ensure profile on auth
  useEffect(() => {
    if (isAuthenticated) {
      ensureProfile();
    }
  }, [isAuthenticated, ensureProfile]);

  const handleGenerate = () => {
    if (selections.length === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      const plan = generateFloorPlan(selections, targetSqm, stories);
      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveDraft = async () => {
    if (!generatedPlan || !isAuthenticated) return;

    const style = getStyleById(selectedStyle);
    const name = `${style?.label || selectedStyle} - ${generatedPlan.totalSqm} م²`;

    try {
      const draftId = await createDraft({
        name,
        style: selectedStyle,
        stories,
        ceilingHeight,
        totalSqm: generatedPlan.totalSqm,
        width: generatedPlan.width,
        depth: generatedPlan.depth,
        rooms: generatedPlan.rooms,
        isPublic: true,
      });

      setSelectedDraftId(draftId);
      setView("detail");
      setGeneratedPlan(null);
      setSelections([]);
    } catch (error) {
      alert("فشل حفظ التصميم. قد تكون وصلت للحد الشهري.");
    }
  };

  const handleSelectDraft = (id: Id<"drafts">) => {
    setSelectedDraftId(id);
    setView("detail");
  };

  const totalSelectedSqm = selections.reduce((sum, s) => {
    const room = selections.find(sel => sel.roomId === s.roomId);
    return sum + (room?.count || 0) * 20; // Approximate
  }, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // Auth Modal
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute -top-12 left-0 text-white/80 hover:text-white transition-colors"
        >
          ✕ إغلاق
        </button>

        {authMode === "signIn" ? (
          <SignInForm onToggle={() => setAuthMode("signUp")} />
        ) : (
          <SignUpForm onToggle={() => setAuthMode("signIn")} />
        )}

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-stone-500">أو</span>
            </div>
          </div>
          <div className="mt-4">
            <AnonymousSignIn />
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-l from-amber-600 to-orange-600 bg-clip-text text-transparent">
              رسم.ai
            </span>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setView("create")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                view === "create"
                  ? "bg-amber-100 text-amber-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              إنشاء
            </button>
            <button
              onClick={() => setView("explore")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                view === "explore"
                  ? "bg-amber-100 text-amber-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              استكشف
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setView("studio")}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  view === "studio"
                    ? "bg-amber-100 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                تصاميمي
              </button>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-stone-600">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    {profile?.plan === "pro" ? "احترافي" : profile?.plan === "plus" ? "بلس" : "مجاني"}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium transition-colors"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2 bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold
                  rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all
                  shadow-lg shadow-amber-500/25"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-stone-200/50 bg-white/90">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setView("create")}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${view === "create" ? "text-amber-600" : "text-stone-500"}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">إنشاء</span>
          </button>
          <button
            onClick={() => setView("explore")}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${view === "explore" ? "text-amber-600" : "text-stone-500"}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">استكشف</span>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setView("studio")}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${view === "studio" ? "text-amber-600" : "text-stone-500"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs">تصاميمي</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // Landing View
  const LandingView = () => (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <pattern id="islamic" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.5" fill="currentColor" />
                <path d="M0 5 L10 5 M5 0 L5 10" stroke="currentColor" strokeWidth="0.1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#islamic)" />
            </svg>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-stone-900 leading-tight">
              صمّم منزل أحلامك
              <br />
              <span className="bg-gradient-to-l from-amber-500 to-orange-600 bg-clip-text text-transparent">
                بالذكاء الاصطناعي
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              أنشئ مخططات احترافية في دقائق. لا خبرة هندسية مطلوبة.
              <br />
              متوافق مع اشتراطات البناء السعودية.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setView("create");
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-amber-500 to-orange-500 text-white
                  font-bold text-lg rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all
                  shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:scale-105"
              >
                ابدأ مجاناً
              </button>

              <button
                onClick={() => setView("explore")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-stone-700 font-bold text-lg rounded-2xl
                  border-2 border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                استكشف التصاميم
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-amber-600">+500</div>
                <div className="text-xs md:text-sm text-stone-500 mt-1">تصميم تم إنشاؤه</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-amber-600">6</div>
                <div className="text-xs md:text-sm text-stone-500 mt-1">أنماط معمارية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-amber-600">+20</div>
                <div className="text-xs md:text-sm text-stone-500 mt-1">نوع غرفة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-stone-900 mb-12">
            كيف يعمل رسم.ai؟
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">1. اختر الغرف</h3>
              <p className="text-stone-600">حدد الغرف التي تحتاجها من كتالوج شامل يضم المجالس، غرف النوم، المطابخ، وأكثر.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">2. اختر النمط</h3>
              <p className="text-stone-600">اختر من بين 6 أنماط معمارية: خليجي تراثي، نيوكلاسيك، معاصر، أندلسي، والمزيد.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">3. ولّد المخطط</h3>
              <p className="text-stone-600">يقوم الذكاء الاصطناعي بإنشاء مخطط احترافي متوافق مع اشتراطات البناء السعودية.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-stone-900 mb-4">
            خطط بسيطة وواضحة
          </h2>
          <p className="text-center text-stone-600 mb-12">اختر الخطة المناسبة لاحتياجاتك</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-stone-200">
              <h3 className="text-xl font-bold text-stone-800">مجاني</h3>
              <div className="mt-4">
                <span className="text-4xl font-black text-stone-900">0</span>
                <span className="text-stone-500 mr-1">ر.س/شهر</span>
              </div>
              <ul className="mt-6 space-y-3 text-stone-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3 مخططات شهرياً
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  عرض ثنائي الأبعاد
                </li>
                <li className="flex items-center gap-2 text-stone-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  لا تصدير CAD
                </li>
              </ul>
            </div>

            {/* Plus */}
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-xl border-2 border-amber-400 relative">
              <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                الأكثر شيوعاً
              </div>
              <h3 className="text-xl font-bold text-stone-800">بلس</h3>
              <div className="mt-4">
                <span className="text-4xl font-black text-amber-600">39</span>
                <span className="text-stone-500 mr-1">ر.س/شهر</span>
              </div>
              <ul className="mt-6 space-y-3 text-stone-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  مخططات غير محدودة
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  جميع الأنماط المعمارية
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  تصدير CAD (1/شهر)
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-stone-900 rounded-3xl p-6 shadow-xl text-white">
              <h3 className="text-xl font-bold">احترافي</h3>
              <div className="mt-4">
                <span className="text-4xl font-black">149</span>
                <span className="text-stone-400 mr-1">ر.س/شهر</span>
              </div>
              <ul className="mt-6 space-y-3 text-stone-300">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  كل ميزات بلس
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  تصدير CAD غير محدود
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  دعم أولوي
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Create View
  const CreateView = () => (
    <div className="min-h-screen pt-32 md:pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Room Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">اختر الغرف</h2>
                {selections.length > 0 && (
                  <button
                    onClick={() => setSelections([])}
                    className="text-sm text-stone-500 hover:text-red-500 transition-colors"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                <RoomCatalog selections={selections} onSelectionsChange={setSelections} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
              <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />

              <div className="grid sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-stone-200">
                {/* Stories */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">عدد الطوابق</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setStories(n)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          stories === n
                            ? "bg-amber-500 text-white shadow-lg"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    المساحة: {targetSqm} م²
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="800"
                    step="25"
                    value={targetSqm}
                    onChange={(e) => setTargetSqm(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-amber-500
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>

                {/* Ceiling */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    ارتفاع السقف: {ceilingHeight} م
                  </label>
                  <input
                    type="range"
                    min="2.7"
                    max="4.5"
                    step="0.1"
                    value={ceilingHeight}
                    onChange={(e) => setCeilingHeight(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-amber-500
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <button
                  onClick={handleGenerate}
                  disabled={selections.length === 0 || isGenerating}
                  className="w-full py-4 bg-gradient-to-l from-amber-500 to-orange-500 text-white
                    font-bold text-lg rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all
                    shadow-xl shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:from-amber-500 disabled:hover:to-orange-500"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جارٍ التوليد...
                    </span>
                  ) : (
                    <>
                      ✨ إنشاء المخطط
                      {selections.length > 0 && (
                        <span className="mr-2 text-amber-200">
                          ({selections.reduce((s, r) => s + r.count, 0)} غرفة)
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Canvas Preview */}
            {generatedPlan && (
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-stone-800">المخطط</h3>

                  {stories > 1 && (
                    <div className="flex items-center gap-2">
                      {Array.from({ length: stories }, (_, i) => i + 1).map((floor) => (
                        <button
                          key={floor}
                          onClick={() => setSelectedFloor(floor)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            selectedFloor === floor
                              ? "bg-amber-500 text-white"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          طابق {floor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <FloorPlanCanvas
                  rooms={generatedPlan.rooms}
                  width={generatedPlan.width}
                  depth={generatedPlan.depth}
                  selectedFloor={selectedFloor}
                />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{generatedPlan.totalSqm}</div>
                    <div className="text-sm text-stone-500">متر مربع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{generatedPlan.width}</div>
                    <div className="text-sm text-stone-500">عرض (م)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{generatedPlan.depth}</div>
                    <div className="text-sm text-stone-500">عمق (م)</div>
                  </div>
                </div>

                {/* Save Button */}
                {isAuthenticated && (
                  <button
                    onClick={handleSaveDraft}
                    className="w-full mt-4 py-3 bg-stone-900 text-white font-bold rounded-xl
                      hover:bg-stone-800 transition-all"
                  >
                    💾 حفظ التصميم
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Studio View
  const StudioView = () => (
    <div className="min-h-screen pt-32 md:pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-stone-900">تصاميمي</h1>
          <button
            onClick={() => setView("create")}
            className="px-6 py-3 bg-gradient-to-l from-amber-500 to-orange-500 text-white
              font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all
              shadow-lg shadow-amber-500/25"
          >
            + تصميم جديد
          </button>
        </div>

        {myDrafts === undefined ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : myDrafts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-stone-300">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">لا توجد تصاميم بعد</h3>
            <p className="text-stone-500 mb-6">ابدأ بإنشاء تصميمك الأول</p>
            <button
              onClick={() => setView("create")}
              className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all"
            >
              إنشاء تصميم
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDrafts.map((draft: Draft) => (
              <DraftCard
                key={draft._id}
                draft={draft}
                onSelect={handleSelectDraft}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Explore View
  const ExploreView = () => (
    <div className="min-h-screen pt-32 md:pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">استكشف التصاميم</h1>
          <p className="text-stone-600">تصفح تصاميم المستخدمين واحصل على الإلهام</p>
        </div>

        {publicDrafts === undefined ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : publicDrafts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-stone-800">لا توجد تصاميم عامة بعد</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicDrafts.map((draft: Draft) => (
              <DraftCard
                key={draft._id}
                draft={draft}
                onSelect={handleSelectDraft}
                onPin={isAuthenticated ? (id) => togglePin({ draftId: id }) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Detail View
  const DetailView = () => {
    if (!selectedDraft) {
      return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const style = getStyleById(selectedDraft.style);
    const rooms: GeneratedRoom[] = selectedDraft.rooms || [];

    return (
      <div className="min-h-screen pt-32 md:pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedDraftId(null);
              setView("studio");
            }}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200 sticky top-24">
                <h1 className="text-2xl font-bold text-stone-900 mb-6">{selectedDraft.name}</h1>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-600">النمط</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${style?.gradient}`}>
                      {style?.label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-600">المساحة</span>
                    <span className="font-bold text-stone-900">{selectedDraft.totalSqm} م²</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-600">الأبعاد</span>
                    <span className="font-bold text-stone-900">{selectedDraft.width}م × {selectedDraft.depth}م</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-600">الطوابق</span>
                    <span className="font-bold text-stone-900">{selectedDraft.stories}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-600">ارتفاع السقف</span>
                    <span className="font-bold text-stone-900">{selectedDraft.ceilingHeight}م</span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-stone-600">الحفظ</span>
                    <span className="font-bold text-amber-600">{selectedDraft.pinCount}</span>
                  </div>
                </div>

                {/* Room list */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="font-bold text-stone-800 mb-4">الغرف ({rooms.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-2 rounded-lg"
                        style={{ backgroundColor: room.color + "40" }}
                      >
                        <span className="text-sm text-stone-700">{room.label}</span>
                        <span className="text-xs text-stone-500">{room.area} م²</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
                <h2 className="text-xl font-bold text-stone-800 mb-4">المخطط</h2>
                <FloorPlanCanvas
                  rooms={rooms}
                  width={selectedDraft.width}
                  depth={selectedDraft.depth}
                  selectedFloor={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Footer
  const Footer = () => (
    <footer className="py-6 border-t border-stone-200 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-stone-400">
          Requested by <span className="text-stone-500">@web-user</span> · Built by <span className="text-stone-500">@clonkbot</span>
        </p>
      </div>
    </footer>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100"
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <Navigation />

      {showAuthModal && <AuthModal />}

      <main>
        {view === "landing" && <LandingView />}
        {view === "create" && <CreateView />}
        {view === "studio" && <StudioView />}
        {view === "explore" && <ExploreView />}
        {view === "detail" && <DetailView />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
