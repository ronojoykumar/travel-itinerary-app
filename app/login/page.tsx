'use client';

import { supabase } from '../../lib/supabase';
import { Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        alert(`Error signing in: ${error.message}`);
      } else {
        console.log('Google Sign-In initiated:', data);
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      alert('An unexpected error occurred. Please check the console.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl -z-10 opacity-50" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8 text-center relative z-10">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 rotate-3 transition-transform hover:rotate-6">
            <span className="text-white text-2xl font-bold">Tp</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to TripPilot</h1>
          <p className="text-slate-500">Sign in to start building your dream itinerary with AI.</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-sm"
        >
          <Chrome className="h-5 w-5 text-slate-900" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-8 text-xs text-slate-400">
          By continuing, you agree to our <Link href="#" className="underline hover:text-slate-600">Terms of Service</Link> and <Link href="#" className="underline hover:text-slate-600">Privacy Policy</Link>.
        </p>
      </div>

      <Link href="/" className="mt-8 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        ← Back to Home
      </Link>
    </div>
  );
}
