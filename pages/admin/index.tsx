import { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Session } from 'next-auth';
import useSWR from 'swr';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

interface Stats {
  totalVisits: number;
  totalStudents: number;
  pendingPayments: number;
  totalRevenue: number; // in BDT cents
}

interface Payment {
  id: number;
  userId: number;
  user: { name: string; email: string; phone?: string };
  amount: number; // cents
  method: string;
  transactionId?: string;
  createdAt: string;
  status: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminDashboard: NextPage<{ session: Session }> = ({ session }) => {
  const { data: stats } = useSWR<Stats>('/api/stats', fetcher);
  const { data: pending, mutate } = useSWR<Payment[]>('/api/payments?status=PENDING', fetcher);

  const handleAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await axios.patch(`/api/payments?id=${id}`, { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      toast.success(`Payment ${action === 'APPROVE' ? 'approved' : 'rejected'}!`);
      mutate(); // refresh pending list
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Admin Command Center</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Visits" value={stats?.totalVisits ?? '...'} glowColor="mint" />
        <StatCard title="Registered Students" value={stats?.totalStudents ?? '...'} glowColor="mint" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments ?? '...'} glowColor="amber" />
        <StatCard
          title="Total Revenue (BDT)"
          value={stats ? (stats.totalRevenue / 100).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' }) : '...'}
          glowColor="mint"
        />
      </div>

      {/* Pending Payments Table */}
      <h2 className="text-2xl font-semibold mb-4">Pending Manual Payments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Amount (BDT)</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Txn ID</th>
              <th className="px-4 py-2 text-left">Submitted</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending?.length ? (
              pending.map((p) => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-2">{p.user.name ?? p.user.email}</td>
                  <td className="px-4 py-2">{p.user?.phone ?? '—'}</td>
                  <td className="px-4 py-2">{(p.amount / 100).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</td>
                  <td className="px-4 py-2 capitalize">{p.method}</td>
                  <td className="px-4 py-2">{p.transactionId ?? '—'}</td>
                  <td className="px-4 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleAction(p.id, 'APPROVE')}
                      className="bg-mint-500 hover:bg-mint-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(p.id, 'REJECT')}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-2 text-center">
                  {pending ? 'No pending payments' : 'Loading...'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple stat card component
const StatCard: React.FC<{ title: string; value: string | number; glowColor: 'mint' | 'amber' }> = ({ title, value, glowColor }) => (
  <div className={`p-4 bg-gray-800 rounded-lg border border-white/10 shadow-lg relative ${glowColor === 'mint' ? 'shadow-mint-500/30' : 'shadow-amber-500/30'}`}> 
    <h3 className="text-sm uppercase text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
    <div className={`absolute inset-0 rounded-lg pointer-events-none border-2 border-${glowColor}-500 opacity-50 animate-pulse`} />
  </div>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !['admin', 'staff'].includes(session.user.role)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: { session } };
};

export default AdminDashboard;
