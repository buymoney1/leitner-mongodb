// // pages/api/guide/mark-shown.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import {prisma} from '../../../lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, {});
//   if (!session) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { page } = req.body;

//   try {
//     await prisma.userGuide.upsert({
//       where: {
//         userId_page: {
//           userId: session.user.id,
//           page: page
//         }
//       },
//       update: {
//         shown: true
//       },
//       create: {
//         userId: session.user.id,
//         page: page,
//         shown: true
//       }
//     });

//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }