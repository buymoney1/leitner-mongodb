// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
    async session({ session, user, token }) {
      console.log('🔐 Session Callback - User ID:', user?.id);
      console.log('🔐 Session Callback - Token:', token);
      
      if (session.user) {
        session.user.id = user.id;
        
        try {
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
              role: true, 
              email: true,
              name: true 
            }
          });
          
          console.log('🔐 User data from DB:', userData);
          
        (session.user as any).role = userData?.role || 'user';
        } catch (error) {
          console.error('❌ Error fetching user role:', error);
          (session.user as any).role = 'user';
        }
      }
      
      console.log('🔐 Final session to client:', session);
      return session;
    },
    
    async jwt({ token, user, account, profile }) {
      console.log('🔐 JWT Callback - User:', user);
      if (user) {
        token.id = user.id;
      token.role = (user as any).role || 'user';
      }
      return token;
    },
  },
  
  pages: {
    signIn: "/login",
  },
});