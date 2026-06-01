import Head from 'next/head';
import NavBar from '@/components/NavBar';
import MobileBrowserHeader from '@/components/MobileBrowserHeader';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const [senderNumber, setSenderNumber] = useState('');
  const [txnId, setTxnId] = useState('');
  const [guestAmount, setGuestAmount] = useState('5300');
  const [method, setMethod] = useState('bKash');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const userBackground = session?.user?.background || 'GENERAL';
  const defaultAmount = userBackground === 'MADRASAH' ? 3900 : 5300;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(text);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!session) {
      setNotification({ type: 'error', message: 'পেমেন্ট সাবমিট করতে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।' });
      return;
    }

    const txnRegex = /^[A-Z0-9]{8,12}$/i;
    if (!txnRegex.test(txnId.trim())) {
      setNotification({ type: 'error', message: 'Invalid Transaction ID Format. দয়া করে সঠিক TxnID দিন।' });
      return;
    }

    const finalAmount = session ? defaultAmount : Number(guestAmount);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(session.user.id),
          amount: finalAmount,
          method,
          transactionId: txnId.trim(),
        }),
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: 'Payment Submitted Successfully! Waiting for Admin Approval. আপনার পেমেন্ট তথ্য সফলভাবে পাঠানো হয়েছে।',
        });
        setSenderNumber('');
        setTxnId('');
      } else {
        const data = await res.json();
        setNotification({ type: 'error', message: data.error || 'পেমেন্ট সাবমিট ব্যর্থ হয়েছে।' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'নেটওয়ার্ক এরর। দয়া করে আবার চেষ্টা করুন।' });
    }
  };

  return (
    <>
      <Head>
        <title>At Taheel Academy | ইলমুস সরফ কোর্স</title>
        <meta name="description" content="Online Ilmus Sarf course with live support and structured Arabic grammar lessons." />
      </Head>
      {/* Root wrapper full width and full height */}
      <div className="w-full min-h-screen bg-[#090d13] text-white font-sans">
        {/* Mobile header */}
        <div className="md:hidden"><MobileBrowserHeader /></div>
        {/* Navbar */}
        <NavBar />
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="home">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                অনলাইন ইলমুস সরফ কোর্স{' '}
                <span className="text-[#00e6a6] bg-gradient-to-r from-[#00e6a6] to-[#00b380] bg-clip-text text-transparent">
                  আরবী ব্যাকরণ সহজে শিখুন
                </span>
              </h1>
              <p className="mt-6 text-gray-400 text-base md:text-lg leading-relaxed">
                দাখিল ও জেনারেল মাদ্রাসা ব্যাকগ্রাউন্ডের শিক্ষার্থীদের জন্য বিশেষভাবে ডিজাইন করা অনলাইন আরবি ব্যাকরণ কোর্স। চলুন সহজ ও প্র্যাকটিক্যাল পাঠে আরবি শিখি।
              </p>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                <a href="#payment" className="bg-[#00e6a6] hover:bg-[#00ffd0] text-black font-bold px-6 py-3 rounded-full transition">
                  এখনই ভর্তি হন
                </a>
                {session ? (
                  <Link href="/dashboard" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-full transition">
                    ড্যাশবোর্ড (Dashboard)
                  </Link>
                ) : (
                  <Link href="/auth/signin" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-full transition">
                    লগইন করুন (Login)
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <img className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-[#00e6a6]/30 shadow-2xl object-cover" src="/instructor.jpg" alt="উস্তায ফায়েজ বিন মাহমুদ" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                  <h3 className="font-bold text-gray-200">উস্তায ফায়েজ বিন মাহমুদ</h3>
                  <span className="block text-xs text-gray-400">লেকচারার, IIUC</span>
                  <span className="block text-xs text-gray-400">ইন্টারন্যাশনাল ইসলামিক ইউনিভার্সিটি চট্টগ্রাম</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Payment Section */}
        <section className="payment-console max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="payment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Panel */}
            <article className="contact-panel bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs text-[#00e6a6] uppercase tracking-wider font-bold">Office Support</span>
                <h2 className="text-2xl font-bold text-gray-200 mt-2 mb-6">ভর্তি সহায়তার জন্য সরাসরি যোগাযোগ করুন</h2>
                <div className="space-y-4">
                  <a href="https://wa.me/8801310787139" className="flex justify-between items-center bg-[#00e6a6]/10 border border-[#00e6a6]/30 hover:border-[#00e6a6] p-4 rounded-2xl transition">
                    <span className="font-bold text-[#00e6a6]">WhatsApp</span>
                    <span className="text-sm text-gray-300">শুধুমাত্র WhatsApp: 01310787139</span>
                  </a>
                  <a href="https://www.facebook.com/AtTaheelAcademy" className="flex justify-between items-center bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-2xl transition">
                    <span className="font-bold text-gray-200">Facebook</span>
                    <span className="text-sm text-gray-400">At Taheel Academy Page</span>
                  </a>
                </div>
              </div>
            </article>
            {/* Secure Payment Panel */}
            <article className="secure-panel bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-lg relative">
              <span className="text-xs text-[#00e6a6] uppercase tracking-wider font-bold">Secure Payment Console</span>
              <h2 className="text-2xl font-bold text-gray-200 mt-2 mb-1">Direct Merchant Payment Terminal</h2>
              <div className="text-xs text-[#00e6a6] mb-6 flex items-center gap-1.5 font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00e6a6]" />
                ✓ Verified Payment Numbers
              </div>
              {/* Payment Numbers */}
              <div className="space-y-3.5 mb-6">
                <div className="flex justify-between items-center bg-black/30 border border-white/5 p-4 rounded-2xl">
                  <div>
                    <strong className="text-lg tracking-wider text-gray-200">01837772215</strong>
                    <span className="block text-xs text-gray-400 mt-0.5">বিকাশ / নগদ Personal</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleCopy('01837772215')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition">
                      {copyStatus === '01837772215' ? 'Copied!' : 'Copy'}
                    </button>
                    <a href="https://wa.me/8801837772215" className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition">WA</a>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-black/30 border border-white/5 p-4 rounded-2xl">
                  <div>
                    <strong className="text-lg tracking-wider text-gray-200">01310787139</strong>
                    <span className="block text-xs text-gray-400 mt-0.5">বিকাশ / নগদ Personal</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleCopy('01310787139')} className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition">
                      {copyStatus === '01310787139' ? 'Copied!' : 'Copy'}
                    </button>
                    <a href="https://wa.me/8801310787139" className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition">WA</a>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center mb-6 border-b border-white/5 pb-4">
                * উপরে উল্লেখিত যেকোনো পারসোনাল নম্বরে নির্ধারিত ফি **Send Money** করুন এবং নিচের ফর্মটি পূরণ করুন।
              </div>
              {/* Glassmorphic Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">পেমেন্ট গেটওয়ে</label>
                    <select className="w-full h-10 px-3 bg-[#0d131e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#00e6a6]" value={method} onChange={(e) => setMethod(e.target.value)}>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">ভর্তি ফি (টাকা)</label>
                    {session ? (
                      <input type="text" disabled className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400" value={userBackground === 'MADRASAH' ? '৩,৯০০ BDT' : '৫,৩০০ BDT'} />
                    ) : (
                      <select className="w-full h-10 px-3 bg-[#0d131e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#00e6a6]" value={guestAmount} onChange={(e) => setGuestAmount(e.target.value)}>
                        <option value="5300">৫,৩০০ BDT (General)</option>
                        <option value="3900">৩,৯০০ BDT (Madrasah)</option>
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">প্রেরক মোবাইল নম্বর (Sender Number)</label>
                  <input type="tel" required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6]" placeholder="017XXXXXXXX" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">ট্রানজেকশন আইডি (Transaction ID / TxnID)</label>
                  <input type="text" required className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-[#00e6a6] focus:ring-1 focus:ring-[#00e6a6]" placeholder="e.g. K8A9J3HL7Z" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
                </div>
                {notification && (
                  <div className={`p-3.5 rounded-xl border text-xs ${notification.type === 'success' ? 'bg-green-950/30 border-green-500/30 text-green-200' : 'bg-red-950/30 border-red-500/30 text-red-200'}`}>
                    {notification.type === 'error' ? '⚠️ ' : '✔ '} {notification.message}
                  </div>
                )}
                <button type="submit" className="w-full h-11 bg-gradient-to-r from-[#00e6a6] to-[#00b380] hover:from-[#00ffd0] hover:to-[#00e6a6] text-black font-bold rounded-xl transition shadow-[0_0_24px_rgba(0,230,166,0.15)] text-sm">
                  পেমেন্ট সাবমিট করুন
                </button>
              </form>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
