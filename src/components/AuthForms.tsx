import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignInForm({ onToggle }: { onToggle: () => void }) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("flow", "signIn");

    try {
      await signIn("password", formData);
    } catch (err) {
      setError("فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-800">مرحباً بعودتك</h2>
          <p className="text-stone-500 mt-2">سجّل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50
                focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all
                text-stone-800 placeholder-stone-400"
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              كلمة المرور
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50
                focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all
                text-stone-800 placeholder-stone-400"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-l from-amber-500 to-orange-500 text-white
              font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all
              shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جارٍ الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            ليس لديك حساب؟ سجّل الآن
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("flow", "signUp");

    try {
      await signIn("password", formData);
    } catch (err) {
      setError("فشل إنشاء الحساب. قد يكون البريد مستخدماً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-800">إنشاء حساب جديد</h2>
          <p className="text-stone-500 mt-2">ابدأ تصميم منزل أحلامك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50
                focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all
                text-stone-800 placeholder-stone-400"
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              كلمة المرور
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50
                focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all
                text-stone-800 placeholder-stone-400"
              placeholder="6 أحرف على الأقل"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-l from-amber-500 to-orange-500 text-white
              font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all
              shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جارٍ الإنشاء...
              </span>
            ) : (
              "إنشاء حساب"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            لديك حساب؟ سجّل دخولك
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnonymousSignIn() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAnonymous}
      disabled={isLoading}
      className="w-full py-3 px-6 bg-stone-100 text-stone-700 font-medium rounded-xl
        hover:bg-stone-200 transition-all border-2 border-stone-200
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "جارٍ الدخول..." : "المتابعة كضيف"}
    </button>
  );
}
