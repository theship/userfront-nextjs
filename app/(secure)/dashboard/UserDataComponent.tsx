'use client';

import { useState, useEffect } from 'react';
import { useUserfront } from "@userfront/next/client";

interface UserData {
  userId: string;
  email: string;
  username?: string;
  // Add other user properties as needed
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
        const absoluteUrl = `${window.location.origin}/api/protected-route`;
        console.log('Fetching from:', absoluteUrl);
        console.log('Access Token:', accessToken);

        const response = await fetch(absoluteUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data);
        
        setUserData(data.userData);
      } catch (err) {
        console.error('Error in API call:', err);
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
    <div className="user-data">
      <h2>Additional User Information</h2>
      <p>User ID: {userData.userId}</p>
      <p>User Name: {userData.username}</p>
      {/* Add more user data fields as needed */}
    </div>
  );
}
