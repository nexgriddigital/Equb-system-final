import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile } from '../services/firebase';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface AuthScreenProps {
  lang: Language;
  onSuccess: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ lang, onSuccess }) => {
  const t = translations[lang];

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const mapAuthError = (errCode: string): string => {
    switch (errCode) {
      case 'auth/invalid-email':
      case 'auth/invalid-credential':
        return t.loginErrorInvalid;
      case 'auth/user-not-found':
        return t.loginErrorUserNotFound;
      case 'auth/wrong-password':
        return t.loginErrorWrongPassword;
      case 'auth/email-already-in-use':
        return t.loginErrorEmailInUse;
      case 'auth/weak-password':
        return t.loginErrorWeakPassword;
      default:
        return t.loginErrorGeneric;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await syncUserProfile(userCred.user, lang);
        onSuccess();
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setError(lang === 'am' ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please provide your name');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCred.user, { displayName: displayName.trim() });
        await syncUserProfile(userCred.user, lang);
        onSuccess();
      } else if (mode === 'forgot_password') {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessNotice(t.resetEmailSent);
      }
    } catch (err: any) {
      setError(mapAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user, lang);
      onSuccess();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(mapAuthError(err?.code || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85dvh] flex items-center justify-center py-6 px-3 sm:px-4">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-[420px] p-6 sm:p-8 shadow-sm space-y-5">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo size={96} className="shadow-md rounded-[21px]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading pt-1">
            {mode === 'signin' && t.loginTitle}
            {mode === 'signup' && t.signupTitle}
            {mode === 'forgot_password' && t.forgotPasswordTitle}
          </h1>
          <p className="text-xs text-stone-500">
            {t.disclaimerShort}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.displayNameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder={t.displayNamePlaceholder}
                  className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {t.passwordLabel}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessNotice(null);
                      setMode('forgot_password');
                    }}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
                  >
                    {t.forgotPasswordPrompt}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0E3B2E] hover:bg-[#07241C] active:scale-98 text-[#FFF1CC] font-bold text-base rounded-2xl shadow-xs transition-all touch-target focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && t.signInBtn}
                  {mode === 'signup' && t.signUpBtn}
                  {mode === 'forgot_password' && t.sendResetEmailBtn}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Continue with Google */}
        {mode !== 'forgot_password' && (
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-xs text-stone-400 uppercase tracking-wider absolute">
                {lang === 'am' ? 'ወይም' : 'or'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-2xl text-stone-800 font-semibold text-sm transition-colors touch-target"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t.continueWithGoogle}</span>
            </button>
          </div>
        )}

        {/* Switch Mode Prompt */}
        <div className="pt-2 text-center text-xs text-stone-600">
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setMode('signup');
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950 p-2"
            >
              {t.noAccountPrompt}
            </button>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setMode('signin');
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950 p-2"
            >
              {t.haveAccountPrompt}
            </button>
          )}

          {mode === 'forgot_password' && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessNotice(null);
                setMode('signin');
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950 p-2"
            >
              {t.backToSignIn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
