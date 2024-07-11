

<h1>Security-charging Your Next.js 14 App with Userfront Authentication</h1>


Are you building a Next.js 14 application and looking for a robust, easy-to-implement authentication solution? Look no further! In this comprehensive guide, we'll explore how to integrate Userfront into your Next.js 14 project, and then dive deeper into some best practices.

<h2>Part 1: Getting Started with Userfront for Next.js 14</h2>


<h3>1. Quick Start Guide</h3>


Userfront provides an excellent[ Quick Start guide](https://userfront.com/docs/quickstart?v=next) for Next.js 14. This guide walks you through the basics of setting up Userfront in your project, including:



* Installing the Userfront Next.js library
* Adding the Userfront provider to your layout
* Creating login, signup, and dashboard pages

<h3>2. @userfront/next npm Package</h3>


The[ @userfront/next](https://www.npmjs.com/package/@userfront/next) package on npm is specifically designed for Next.js applications. It provides a set of components and hooks that make it easy to add authentication to your Next.js app.

<h3>3. Userfront Next.js Guide</h3>


For a more in-depth look at integrating Userfront with Next.js, check out the[ Userfront Next.js Guide](https://userfront.com/docs/examples/next). This guide covers:



* Installation and setup
* Using the UserfrontProvider
* Client-side components and hooks
* Server-side methods and authentication

<h3>4. Running Example</h3>


To see Userfront in action with Next.js 14, you can explore the[ Userfront Next.js 14 example](https://github.com/userfront/examples/tree/main/next-14) on GitHub. This example demonstrates a fully functional authentication setup using Userfront in a Next.js 14 application.

<h2>Part 2: Best Practices</h2>


Now that we've covered the basics, let's dive into some best practices for using Userfront with Next.js 14. We'll focus on understanding Next.js 14's design principles and how to keep sensitive data secure.

<h3>Setting Up the Project</h3>


First, make sure you have a Next.js 14 project set up with Userfront installed. If you haven't done this yet, follow the Quick Start guide mentioned earlier.

<h3>Creating a Header Component</h3>


Let's start by creating a header component that changes based on the user's authentication status:


```
// app/_components/Header.tsx
"use client";

import Link from 'next/link';
import { useUserfront } from "@userfront/next/client";

export default function Header() {
  const { isAuthenticated, logout } = useUserfront();

  return (
    <header className="bg-gray-100 p-4">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">My App</Link>
        <div>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="mr-4">Dashboard</Link>
              <button onClick={() => logout({ redirect: '/' })} className="bg-blue-500 text-white px-4 py-2 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4">Login</Link>
              <Link href="/signup" className="mr-4">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```


This header component uses the `useUserfront` hook to determine if the user is authenticated and displays appropriate navigation links.

<h3>Securing Routes with Layout</h3>


Next, let's create a secure layout that protects our dashboard and other sensitive pages. Secure layouts provide a client-side redirect for unauthenticated users, but remember that true security should be implemented server-side.


```
// app/(secure)/layout.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUserfront } from "@userfront/next/client";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserfront();

  React.useEffect(() => {
    if (isAuthenticated || isLoading || !router) return;
    router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return children;
}
```


This layout ensures that only authenticated users can access the pages within the `(secure)` folder.

<h3>Creating a Protected Dashboard</h3>


Now, let's create a protected dashboard page that displays user information. This dashboard component uses client-side data from Userfront, but doesn't inherently provide security. It should be used in conjunction with server-side protections:


```
// app/(secure)/dashboard/page.tsx
"use client";

import * as React from "react";
import { useUserfront } from "@userfront/next/client";
import UserDataComponent from './UserDataComponent';

export default function DashboardPage() {
  const { user } = useUserfront();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Hello, {user.email}</p>
      <UserDataComponent />
    </div>
  );
}
```


<h3>Fetching Sensitive User Data</h3>


`UserDataComponent` demonstrates client-side API calls with authentication tokens, aligning with the 'HTTP APIs' approach. However, it relies on proper server-side implementation for actual security. For fetching sensitive user data, we'll create a separate component that makes an authenticated API call:


```
// app/(secure)/dashboard/UserDataComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUserfront } from "@userfront/next/client";

interface UserData {
  userId: string;
  email: string;
  username?: string;
}

export default function UserDataComponent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userfront = useUserfront();

  useEffect(() => {
    async function fetchUserData() {
      const accessToken = userfront.accessToken();
      if (!accessToken) {
        setLoading(false);
        setError('Not authenticated');
        return;
      }

      try {
        const response = await fetch('/api/protected-route', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data.userData);
      } catch (err) {
        setError(`Error fetching user data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userfront]);

  if (loading) return <div>Loading additional user data...</div>;
  if (error) return <div>Error loading additional data: {error}</div>;
  if (!userData) return <div>No additional user data available</div>;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">Additional User Information</h2>
      <p>User ID: {userData.userId}</p>
      <p>Username: {userData.username}</p>
    </div>
  );
}
```


<h3>Implementing a Protected API Route</h3>


This protected API route implements server-side JWT verification, which is crucial for securing server-side data access. To securely handle sensitive user data, we'll create a protected API route that verifies the JWT token:


```
// app/api/protected-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserfrontClient } from "@userfront/next/server";
import jwt, { JwtPayload } from 'jsonwebtoken'; // requires install of this package

const userfront = new UserfrontClient({
  tenantId: process.env.NEXT_PUBLIC_USERFRONT_TENANT_ID!,
});

const JWT_PUBLIC_KEY = process.env.USERFRONT_JWT_PUBLIC_KEY!;

interface UserFrontJwtPayload extends JwtPayload {
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];


    // Verify the JWT
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] }) as UserFrontJwtPayload;

    if (typeof decoded === 'string' || !decoded.userId) {
      throw new Error('Invalid token payload');
    }

    const userId = decoded.userId;

    // Fetch additional user data if needed
    const userData = await userfront.getUser(userId);

    return NextResponse.json({ userData });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
```


<h2>Security-charged component</h2>


Now you have server-side JWT verification in the protected API route that provides the necessary security for the UserDataComponent. Here's why:



1. **Token Verification**: The API route verifies the JWT using the Userfront JWT public key, ensuring the token is valid and hasn't been tampered with.
2. **User Authentication**: After verifying the token, it extracts the userId from the decoded token payload, confirming the user's identity.
3. **Authorization**: While not explicitly shown in our example, the userfront.getUser(userId) call could be used to fetch user-specific data or perform additional authorization checks.
4. **Data Protection**: Only after successful verification and potential authorization does the route return user data.

This setup ensures that:



* Only requests with valid JWTs can access the protected data.
* The server verifies the user's identity before returning any sensitive information.
* The client-side component (`UserDataComponent`) can't access this data without a valid token.

However, it's worth noting:



1. The security of this system relies on proper management of the JWT public key and other environment variables.
2. Additional authorization checks might be necessary depending on the specific requirements of your application (e.g., checking user roles or permissions).
3. While this setup provides good security, always remember that security is a multi-layered concern. This should be part of a comprehensive security strategy including secure coding practices, regular audits, and following the principle of least privilege.

<h2>Conclusion</h2>


By following these steps and best practices, you can create a secure, authenticated Next.js 14 application using Userfront. Remember to always verify JWTs on the server-side before granting access to sensitive data or protected routes.

Some key takeaways:



1. Use the `UserfrontProvider` to wrap your application and provide authentication context.
2. Implement protected layouts to secure entire sections of your app.
3. Always verify JWTs on the server-side before returning sensitive data.
4. Use tools like environment variables to store sensitive information like API keys and JWT public keys and exclude them from check-ins.
5. Take advantage of Next.js 14's built-in API routes for server-side operations.

By understanding and implementing these concepts, you'll be well on your way to creating secure, scalable Next.js applications with Userfront authentication.
