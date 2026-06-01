import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type DayCount = { date: string; count: number };
type Payment = {
  id: number;
  amount: number;
  method: string;
  status: string;
  user: { name?: string; phone?: string };
};

export default function AdminDashboard() {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const status = sessionHook?.status ?? 'loading';
  const router = useRouter();

  const [stats, setStats] = useState<{ totalStudents: number; totalCourses: number; totalPayments: number } | null>(null);
  const [visitorData, setVisitorData] = useState<DayCount[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch stats
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/admin/stats');
          if (res.ok) setStats(await res.json());
        } catch (err) {
          console.error('Failed to fetch stats:', err);
        } finally {
          setLoadingStats(false);
        }
      };

      // Fetch daily visitors
      const fetchVisitors = async () => {
        try {
          const res = await fetch('/api/admin/daily-visitors?days=30');
          if (res.ok) {
            const data = await res.json();
            setVisitorData(data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch visitors:', err);
        }
      };

      // Fetch pending payments
      const fetchPayments = async () => {
        try {
          const res = await fetch('/api/admin/payments-pending');
          if (res.ok) {
            const data = await res.json();
            setPendingPayments(data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch payments:', err);
        } finally {
          setLoadingPayments(false);
        }
      };

      fetchStats();
      fetchVisitors();
      fetchPayments();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <main style={{ padding: 32 }}>
        <h1>Loading...</h1>
      </main>
    );
  }

  const role = (session?.user as any)?.role;
  if (!session || role !== 'admin') {
    return (
      <main style={{ padding: 32 }}>
        <h1>Access Denied</h1>
        <p>Only admin users can view this page.</p>
      </main>
    );
  }

  const todayVisits = visitorData.length > 0 ? visitorData[visitorData.length - 1]?.count || 0 : 0;

  const handleApprove = async (paymentId: number) => {
    try {
      const res = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'APPROVE' }),
      });

      if (res.ok) {
        // Remove from list
        setPendingPayments(pendingPayments.filter((p) => p.id !== paymentId));
        alert('Payment approved successfully!');
      } else {
        alert('Failed to approve payment');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      alert('Error approving payment');
    }
  };

  const handleReject = async (paymentId: number) => {
    try {
      const res = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'REJECT' }),
      });

      if (res.ok) {
        // Remove from list
        setPendingPayments(pendingPayments.filter((p) => p.id !== paymentId));
        alert('Payment rejected');
      } else {
        alert('Failed to reject payment');
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Error rejecting payment');
    }
  };

  return (
    <main style={{ padding: 32, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 32, color: '#333' }}>Admin Dashboard</h1>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ color: '#666', marginTop: 0 }}>Total Students</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#0070f3', margin: 0 }}>
            {loadingStats ? '-' : stats?.totalStudents || 0}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ color: '#666', marginTop: 0 }}>Pending Verifications</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#ff6b6b', margin: 0 }}>
            {loadingPayments ? '-' : pendingPayments.length}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ color: '#666', marginTop: 0 }}>Today's Visits</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#51cf66', margin: 0 }}>
            {todayVisits}
          </p>
        </div>
      </div>

      {/* Visitor Chart */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: 40,
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Daily Visitor Trends (Last 30 Days)</h2>
        {visitorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0070f3"
                name="Visitors"
                dot={{ fill: '#0070f3', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#999' }}>No visitor data available</p>
        )}
      </div>

      {/* Pending Payments Table */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Pending Manual Payments (bKash/Nagad)</h2>

        {loadingPayments ? (
          <p>Loading payments...</p>
        ) : pendingPayments.length === 0 ? (
          <p style={{ color: '#999' }}>No pending payments</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Student Name</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Phone</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Method</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Amount</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{payment.user?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>{payment.user?.phone || 'N/A'}</td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        backgroundColor: payment.method === 'bKash' ? '#e17055' : '#0984e3',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    >
                      {payment.method}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>৳ {payment.amount / 100}</td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        backgroundColor: '#ffd93d',
                        color: '#333',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => handleApprove(payment.id)}
                      style={{
                        backgroundColor: '#51cf66',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginRight: 8,
                        fontWeight: 'bold',
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#37b24d';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#51cf66';
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      style={{
                        backgroundColor: '#ff8787',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#e03131';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#ff8787';
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
