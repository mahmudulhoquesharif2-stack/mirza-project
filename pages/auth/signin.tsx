import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.ok) {
        router.push('/dashboard');
      } else {
        setError('ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়। দয়া করে আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>প্রবেশ করুন | At Taheel Academy</title>
      </Head>
      <div className="relative min-h-screen bg-[#090d13] text-white flex items-center justify-center p-4 overflow-hidden font-sans">
        {/* Background glowing gradient auroras */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[rgba(0,230,166,0.15)] to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[rgba(251,191,36,0.1)] to-transparent blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/15">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-2xl font-bold tracking-wider text-[#00e6a6] mb-3 hover:opacity-90">
              AT TAHEEL ACADEMY
            </Link>
            <h1 className="text-xl font-bold text-gray-200">অ্যাকাউন্টে প্রবেশ করুন</h1>
            <p className="text-sm text-gray-400 mt-1">আরবি ভাষা ও সরফ শিক্ষার রাজপথ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ইমেইল ঠিকানা</label>
              <input
                type="email"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-center gap-2">
                <span className="text-[#fbbf24]">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e6a6] to-[#00b380] hover:from-[#00ffd0] hover:to-[#00e6a6] text-black font-bold tracking-wide transition-all shadow-[0_0_24px_rgba(0,230,166,0.2)] hover:shadow-[0_0_32px_rgba(0,230,166,0.4)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-gray-400">
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/signup" className="text-[#00e6a6] hover:underline font-bold">
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
