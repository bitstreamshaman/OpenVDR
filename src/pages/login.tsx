import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <div>
      {!session && (
        <>
          <h1>You are not signed in</h1>
          <button onClick={() => signIn('credentials')}>Sign in with Credentials</button>
        </>
      )}
      {session && (
        <>
          <h1>Signed in as {session?.user?.email}</h1>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  );
}
