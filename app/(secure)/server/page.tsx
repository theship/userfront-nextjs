"use server";

import { UserfrontClient } from "@userfront/next/server";
import Image from "next/image";

// Initialize the Userfront client
const Userfront = new UserfrontClient({
  apiKey: process.env.USERFRONT_API_KEY,
  tenantId: process.env.NEXT_PUBLIC_USERFRONT_TENANT_ID,
});

export default async function ServerPage() {
  try {
    // Get the tenant information
    const tenant = await Userfront.getTenant(process.env.NEXT_PUBLIC_USERFRONT_TENANT_ID);

    return (
      <div  className="container">
        <h1>Server Example with Data Fetching</h1>

        {tenant.image && (
          <div style={{ marginBottom: '20px' }}>
            <Image 
              src={tenant.image} 
              alt="Tenant Image" 
              width={100} 
              height={100}
            />
          </div>
        )}

        <h2>Tenant Information:</h2>
        <pre>{JSON.stringify(tenant, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return (
      <div>
        <h1>Server Example with Data Fetching</h1>
        <p>Error: Unable to fetch tenant information</p>
      </div>
    );
  }
}