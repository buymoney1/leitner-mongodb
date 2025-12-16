// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { User } from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  
  callbacks: {
    async session({ session, user }) {
      console.log('🔐 Session Callback - User ID:', user.id);
      
      if (session.user) {
        // اضافه کردن id به session
        session.user.id = user.id;
        
        try {
          // دریافت role از دیتابیس
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
              role: true, 
              email: true,
              name: true 
            }
          });
          
          console.log('🔐 User data from DB:', userData);
          
          // اضافه کردن role به session.user
          // Type assertion به درستی
          const userWithRole = session.user as User & { role?: string };
          userWithRole.role = userData?.role || 'user';
          
        } catch (error) {
          console.error('❌ Error fetching user role:', error);
          const userWithRole = session.user as User & { role?: string };
          userWithRole.role = 'user';
        }
      }
      
      console.log('🔐 Final session to client:', session);
      return session;
    },
    
    async jwt({ token, user }) {
      console.log('🔐 JWT Callback - User:', user);
      if (user) {
        token.id = user.id;
        // اضافه کردن role به token
        const userWithRole = user as User & { role?: string };
        token.role = userWithRole.role || 'user';
      }
      return token;
    },
  },
  
  pages: {
    signIn: "/login",
  },
});