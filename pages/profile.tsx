import { useSession, signOut } from 'next-auth/react';

export default function Profile() {
  const sessionHook = useSession();
  const session = sessionHook?.data;
  const status = sessionHook?.status ?? 'loading';

  if (status === 'loading') return <main style={{ padding: 32 }}>Loading...</main>;
  if (!session || !session.user) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Not signed in</h1>
        <p>Please sign in first.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Your profile</h1>
      <p><strong>Name:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
      <p><strong>Role:</strong> {(session.user as any).role || 'student'}</p>
      <button onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
      {(session.user as any).role === 'admin' && (
        <div style={{ marginTop: 24 }}>
          <a href="/admin">Go to admin dashboard</a>
        </div>
      )}
    </main>
  );
}
