"use client";

import Link from 'next/link';
import { useUserfront } from "@userfront/next/client";

export default function Header() {
  const { isAuthenticated, logout } = useUserfront();

  const linkStyle = {
    padding: '0 10px',
    textDecoration: 'none',
    color: '#333'
  };

  const buttonStyle = {
    padding: '5px 10px',
    marginLeft: '10px',
    cursor: 'pointer',
    backgroundColor: '#2a3365',
    border: 'none',
    borderRadius: '4px'
  };

  return (
    <header style={{ padding: '20px', backgroundColor: '#f8f8f8' }}>
      <nav>
        <Link href="/" style={linkStyle}>Home</Link>
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
            <button onClick={() => logout({ redirect: '/' })} style={buttonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Login</Link>
            <Link href="/signup" style={linkStyle}>Signup</Link>
            <Link href="/reset" style={linkStyle}>Reset</Link>
          </>
        )}
      </nav>
    </header>
  );
}