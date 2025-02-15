// app/(secure)/dashboard/page.tsx

"use client";

import * as React from "react";
import { LogoutButton, useUserfront } from "@userfront/next/client";
import Link from "next/link";
import UserDataComponent from './UserDataComponent';

export default function DashboardPage() {
  const { user } = useUserfront();

  return (
    <div className="container flex flex-col p-4 space-y-4">
      <h1>
        <span>Hello, {user.email}</span>
      </h1>
      <UserDataComponent />
      <LogoutButton />
      <Link href="/server">Server Example with Async Data Fetching &#8594;</Link>
    </div>
  );
}
