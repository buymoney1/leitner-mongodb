// lib/server-auth.ts

import { auth } from "@/lib/auth";

export async function getAuthSession() {
  const session = await auth();
  return session;
}




// //lib/server-auth.ts
// import { cache } from 'react';
// import { auth } from '@/lib/auth';

// export const getAuthSession = cache(async () => {
//   return await auth();
// });


