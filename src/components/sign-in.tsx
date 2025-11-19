// components/sign-in.tsx
import { signIn } from "@/lib/auth";

export default function SignIn() {
  return (
    <div className="relative w-full">
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button
          type="submit"
          className="group relative mb-5 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-px transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20"
        >
          {/* گرادیانت border */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          
          {/* Background glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          
          {/* Main button content */}
          <div className="relative flex w-full items-center justify-center gap-3 rounded-[11px] bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 px-6 py-4 transition-all duration-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/90 group-hover:from-gray-50 group-hover:to-gray-200 dark:group-hover:from-gray-800 dark:group-hover:to-gray-700">
            
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/0 via-purple-500/5 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            
            {/* Google icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md group-hover:bg-cyan-500/30 transition-all duration-300"></div>
              <svg
                className="relative z-10 h-6 w-6 drop-shadow-lg"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>

            {/* Text with gradient */}
            <span className="relative z-10 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-sm font-semibold text-transparent drop-shadow-lg group-hover:from-gray-900 group-hover:to-black dark:group-hover:from-white dark:group-hover:to-gray-200 transition-all duration-300">
              ورود با گوگل
            </span>

            {/* Animated arrow */}
            <div className="relative overflow-hidden">
              <svg 
                className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-500 dark:group-hover:text-cyan-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
          </div>

          {/* Ripple effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[11px]">
            <div className="absolute -inset-10 bg-gradient-to-r from-cyan-500/0 via-purple-500/10 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-pulse"></div>
          </div>
        </button>
      </form>
    </div>
  );
}