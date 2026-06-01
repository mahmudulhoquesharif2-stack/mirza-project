import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [background, setBackground] = useState('GENERAL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, background }),
      });

      if (res.ok) {
        // Redirect to login page on success
        router.push('/auth/signin');
      } else {
        const data = await res.json();
        if (res.status === 409) {
          setError('এই ইমেইলটি ব্যবহার করে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।');
        } else {
          setError(data.error || 'অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        }
      }
    } catch (err) {
      setError('নেটওয়ার্ক সংযোগে সমস্যা। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>নতুন অ্যাকাউন্ট | At Taheel Academy</title>
      </Head>
      <div className="relative min-h-screen bg-[#090d13] text-white flex items-center justify-center p-4 overflow-hidden font-sans">
        {/* Background glowing gradient auroras */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[rgba(0,230,166,0.15)] to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[rgba(251,191,36,0.1)] to-transparent blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/15 my-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-2xl font-bold tracking-wider text-[#00e6a6] mb-3 hover:opacity-90">
              AT TAHEEL ACADEMY
            </Link>
            <h1 className="text-xl font-bold text-gray-200">নতুন শিক্ষার্থী রেজিস্ট্রেশন</h1>
            <p className="text-sm text-gray-400 mt-1">আজই যুক্ত হোন আমাদের সাথে</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">আপনার নাম</label>
              <input
                type="text"
                required
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all text-sm"
                placeholder="উস্তায / ছাত্রের নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">ইমেইল ঠিকানা</label>
              <input
                type="email"
                required
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all text-sm"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">মোবাইল নম্বর</label>
              <input
                type="tel"
                required
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all text-sm"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">শিক্ষাগত ব্যাকগ্রাউন্ড</label>
              <select
                className="w-full h-11 px-4 rounded-xl bg-[#0d131e] border border-white/10 text-white focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all text-sm cursor-pointer"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              >
                <option value="GENERAL">জেনারেল ব্যাকগ্রাউন্ড (General)</option>
                <option value="MADRASAH">মাদ্রাসা ব্যাকগ্রাউন্ড (Madrasah)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6] transition-all text-sm"
                placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
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
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00e6a6] to-[#00b380] hover:from-[#00ffd0] hover:to-[#00e6a6] text-black font-bold tracking-wide transition-all shadow-[0_0_24px_rgba(0,230,166,0.2)] hover:shadow-[0_0_32px_rgba(0,230,166,0.4)] disabled:opacity-50 disabled:pointer-events-none mt-2 text-sm"
            >
              {loading ? 'প্রক্রিয়াধীন...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/5 pt-5 text-sm text-gray-400">
            পূর্বেই রেজিস্ট্রেশন করেছেন?{' '}
            <Link href="/auth/signin" className="text-[#00e6a6] hover:underline font-bold">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
