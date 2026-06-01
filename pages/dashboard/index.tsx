import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

type Lesson = { id: number; title: string; order: number; contentUrl?: string | null };
type Module = { id: number; title: string; order: number; lessons: Lesson[] };
type CourseItem = { enrollmentId: number; course: { id: number; title: string; description?: string; priceMadrasah: number; priceGeneral: number }; paymentStatus: string; modules: Module[] };

export default function DashboardPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCourse, setOpenCourse] = useState<number | null>(null);

  const [payment, setPayment] = useState<any>(null);
  const [fetchingPayment, setFetchingPayment] = useState(true);
const [activeVideoUrl, setActiveVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');

// Mock course modules data
const mockModules = [
  {
    id: 1,
    title: 'Module 1: Introduction & Foundations',
    lessons: [
      { id: 101, title: 'Lesson 1.1', contentUrl: 'https://www.youtube.com/embed/VIDEO1' },
      { id: 102, title: 'Lesson 1.2', contentUrl: 'https://www.youtube.com/embed/VIDEO2' },
    ],
  },
  {
    id: 2,
    title: 'Module 2: Core Practical Training',
    lessons: [
      { id: 201, title: 'Lesson 2.1', contentUrl: 'https://www.youtube.com/embed/VIDEO3' },
      { id: 202, title: 'Lesson 2.2', contentUrl: 'https://www.youtube.com/embed/VIDEO4' },
      { id: 203, title: 'Lesson 2.3', contentUrl: 'https://www.youtube.com/embed/VIDEO5' },
    ],
  },
  {
    id: 3,
    title: 'Module 3: Advanced Command Mastery',
    lessons: [
      { id: 301, title: 'Lesson 3.1', contentUrl: 'https://www.youtube.com/embed/VIDEO6' },
      { id: 302, title: 'Lesson 3.2', contentUrl: 'https://www.youtube.com/embed/VIDEO7' },
    ],
  },
];

  const userId = session?.user?.id;
  const userBackground = user?.background || session?.user?.background || 'GENERAL';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/student/dashboard');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCourses(data.courses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payments?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPayment(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingPayment(false);
      }
    };
    fetchPayment();
  }, [userId]);

  return (
    <>
      <Head>
        <title>শিক্ষার্থী ড্যাশবোর্ড | At Taheel Academy</title>
      </Head>
      <div className="min-h-screen bg-[#090d13] text-white font-sans p-6 md:p-12 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-[-30%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-[rgba(0,230,166,0.1)] to-transparent blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[rgba(251,191,36,0.05)] to-transparent blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-white/10">
            <div>
              <Link href="/" className="text-xl font-bold tracking-wider text-[#00e6a6] hover:opacity-90">
                AT TAHEEL ACADEMY
              </Link>
              <h1 className="text-2xl font-bold mt-1">শিক্ষার্থী পোর্টাল</h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              প্রস্থান করুন (Logout)
            </button>
          </header>

          {/* Tuition Billing Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg mb-8">
            <h3 className="text-lg font-bold text-gray-200 mb-4">ভর্তি ফি ও কোর্স অ্যাক্টিভেশন</h3>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm text-gray-400">কোর্সের নির্ধারিত ফি:</p>
                <p className="text-2xl font-black text-[#fbbf24] mt-1">
                  {userBackground === 'MADRASAH' ? 'Due Amount: 3,900 BDT' : 'Due Amount: 5,300 BDT'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  * আপনার রেজিস্ট্রেশন প্রোফাইল অনুযায়ী ফি হিসাব করা হয়েছে।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {fetchingPayment ? (
                  <span className="text-gray-400 text-sm">লোডিং...</span>
                ) : !payment ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-[#fbbf24]">বকেয়া পরিশোধের পেমেন্ট তথ্য এখনও সাবমিট করা হয়নি।</span>
                    <Link
                      href="/#payment"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00e6a6] to-[#00b380] hover:from-[#00ffd0] hover:to-[#00e6a6] text-black text-center font-bold text-sm tracking-wide transition shadow-[0_0_24px_rgba(0,230,166,0.2)]"
                    >
                      পেমেন্ট সাবমিট করুন
                    </Link>
                  </div>
                ) : payment.status === 'PENDING' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-sm text-gray-300">পেমেন্ট স্ট্যাটাস:</span>
                    <span className="animate-pulse flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-bold text-sm shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                      <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                      PENDING VERIFICATION
                    </span>
                  </div>
                ) : payment.status === 'APPROVED' || payment.status === 'PAID' || payment.status === 'COMPLETED' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-sm text-gray-300">পেমেন্ট স্ট্যাটাস:</span>
                    <span className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e6a6]/10 border border-[#00e6a6]/30 text-[#00e6a6] font-bold text-sm shadow-[0_0_15px_rgba(0,230,166,0.1)]">
                      <span className="w-2 h-2 rounded-full bg-[#00e6a6]" />
                      ENROLLED / ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-red-400">পেমেন্ট বাতিল বা রিফান্ড করা হয়েছে।</span>
                    <Link href="/#payment" className="px-5 py-2.5 rounded-xl bg-[#00e6a6] text-black font-bold text-center text-sm transition">
                      আবার চেষ্টা করুন
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Content Area */}
          <div className="relative mt-8">
            {/* Overlay for locked premium content */}
            {(!payment?.status || payment?.status !== 'APPROVED') && (
              <div className="absolute inset-0 bg-[#090d13]/80 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center max-w-sm">
                  <p className="text-xl font-bold text-[#00e6a6] mb-4">🔒 Premium Curriculum Locked</p>
                  <p className="text-gray-300">Please complete your tuition payment or wait for admin approval to unlock access.</p>
                </div>
              </div>
            )}
            {/* Main interactive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Video Player */}
              <div className="lg:col-span-2 bg-black/30 border border-white/10 rounded-3xl p-4">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe
                    src={activeVideoUrl}
                    title="Lesson Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg border border-white/5"
                  />
                </div>
                {/* Tabs (placeholder) */}
                <div className="flex space-x-4 border-b border-white/10">
                  <button className="pb-2 text-sm font-medium text-white border-b-2 border-[#00e6a6]">
                    Overview
                  </button>
                  <button className="pb-2 text-sm font-medium text-gray-400 hover:text-white">
                    Resources & PDF
                  </button>
                  <button className="pb-2 text-sm font-medium text-gray-400 hover:text-white">
                    Class Notes
                  </button>
                </div>
              </div>

                {/* Right Column: Lesson List */}
                <div className="max-h-[600px] overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4">
                  {mockModules.map((module) => (
                    <div key={module.id} className="mb-4">
                      <h4 className="font-bold text-gray-200 mb-2">{module.title}</h4>
                      <ul className="space-y-2.5">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex justify-between items-center text-sm text-gray-300 p-1 rounded hover:bg-white/10">
                            <span>{lesson.title}</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setActiveVideoUrl(lesson.contentUrl)}
                                className="text-xs font-bold text-black bg-[#00e6a6] hover:bg-[#00ffd0] px-3 py-1.5 rounded-lg transition"
                              >
                                Play
                              </button>
                              {/* Placeholder for PDF download */}
                              <a
                                href="#"
                                className="text-xs font-bold text-black bg-[#00e6a6]/20 border border-[#00e6a6] hover:bg-[#00e6a6]/40 px-2 py-0.5 rounded"
                              >
                                PDF
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Card */}
            <aside className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#00e6a6]/20 border-2 border-[#00e6a6] flex items-center justify-center text-3xl font-bold text-[#00e6a6]">
                  {user?.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{user?.name || 'শিক্ষার্থী'}</h3>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.phone || 'ফোন নম্বর নেই'}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-2">কোর্স ফি ক্যাটাগরি</span>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${userBackground === 'MADRASAH' ? 'bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24]' : 'bg-[#00e6a6]/10 border border-[#00e6a6]/30 text-[#00e6a6]'}`}>
                  {userBackground === 'MADRASAH' ? 'মাদ্রাসা ব্যাকগ্রাউন্ড' : 'জেনারেল ব্যাকগ্রাউন্ড'}
                </span>
              </div>
            </aside>

            {/* Courses list */}
            <section className="col-span-1 lg:col-span-3 space-y-6">
              <h2 className="text-xl font-bold text-gray-200">আপনার কোর্সসমূহ</h2>
              {loading ? (
                <div className="text-gray-400">অপেক্ষা করুন...</div>
              ) : courses.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-gray-400">
                  আপনি can enroll and pay to activate courses.
                </div>
              ) : (
                courses.map((c) => {
                  const isUnlocked = c.paymentStatus === 'PAID' || c.paymentStatus === 'APPROVED' || c.paymentStatus === 'COMPLETED' || payment?.status === 'APPROVED' || payment?.status === 'PAID' || payment?.status === 'COMPLETED';
                  return (
                    <div key={c.enrollmentId} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-md transition hover:border-white/15">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-100">{c.course.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{c.course.description}</p>
                        </div>
                        <div>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#00e6a6]/10 border border-[#00e6a6]/30 text-[#00e6a6] px-3.5 py-1.5 rounded-full text-xs font-bold">
                              ✔ পেমেন্ট সম্পন্ন
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] px-3.5 py-1.5 rounded-full text-xs font-bold">
                              ⏳ ভেরিফিকেশন পেন্ডিং (বিকাশ/নগদ)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <button
                          className="text-sm font-bold text-[#00e6a6] hover:underline flex items-center gap-1"
                          onClick={() => setOpenCourse(openCourse === c.enrollmentId ? null : c.enrollmentId)}
                        >
                          {openCourse === c.enrollmentId ? 'সিলেবাস লুকান ▲' : 'সিলেবাস দেখুন ▼'}
                        </button>

                        {openCourse === c.enrollmentId && (
                          <div className="mt-4 space-y-4">
                            {c.modules.map((m) => (
                              <div key={m.id} className="border border-white/5 bg-black/20 rounded-2xl p-4">
                                <h4 className="font-bold text-gray-200 mb-2">{m.title}</h4>
                                <ul className="space-y-2.5">
                                  {m.lessons.map((ls) => (
                                    <li key={ls.id} className="text-sm text-gray-300">
                                      <div className="flex justify-between items-center py-1">
                                        <span>{ls.title}</span>
                                        {ls.contentUrl ? (
                                          isUnlocked ? (
                                            <a
                                              href={ls.contentUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-xs font-bold text-black bg-[#00e6a6] hover:bg-[#00ffd0] px-3 py-1.5 rounded-lg transition"
                                            >
                                              লাইভ ক্লাসে যুক্ত হোন
                                            </a>
                                          ) : (
                                            <span className="text-xs text-[#fbbf24]">লকড (পেমেন্ট ভেরিফিকেশন বাকি)</span>
                                          )
                                        ) : (
                                          <span className="text-xs text-gray-500">লিংক যুক্ত হয়নি</span>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
