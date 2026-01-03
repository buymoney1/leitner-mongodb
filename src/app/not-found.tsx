// app/not-found.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, RefreshCw, Rocket, Sparkles, Globe, ArrowLeft, Smartphone } from 'lucide-react';

export default function NotFound() {
  const [isMobile, setIsMobile] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Generate particles
    const particlesArray = Array.from({ length: isMobile ? 12 : 20 }, (_, i) => ({
      id: i,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `float ${3 + Math.random() * 4}s infinite ease-in-out ${i * 0.2}s`,
        opacity: 0.3 + Math.random() * 0.3,
        width: isMobile ? '2px' : '1px',
        height: isMobile ? '2px' : '1px',
      }
    }));
    
    setParticles(particlesArray);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white transition-all duration-300">
      {/* Background Elements - Responsive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs - Smaller on mobile */}
        <div className={`absolute ${isMobile ? 'top-1/4 left-1/4 w-32 h-32' : 'top-1/4 left-1/4 w-64 h-64'} bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 animate-float-slow`}></div>
        <div className={`absolute ${isMobile ? 'top-1/3 right-1/4 w-48 h-48' : 'top-1/3 right-1/4 w-96 h-96'} bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-20 animate-float-medium`}></div>
        <div className={`absolute ${isMobile ? 'bottom-1/4 left-1/3 w-40 h-40' : 'bottom-1/4 left-1/3 w-80 h-80'} bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-25 animate-float-slow`}></div>
        
        {/* Grid Pattern - Lighter on mobile */}
        <div className={`absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.08)_1px,transparent_1px)] ${isMobile ? 'bg-[size:30px_30px]' : 'bg-[size:50px_50px]'} dark:bg-[linear-gradient(rgba(120,119,198,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.05)_1px,transparent_1px)]`}></div>
      </div>

 
 

      {/* Main Content */}
      <div className={`mt-12 relative z-10 ${isMobile ? 'pt-4 px-3' : 'min-h-screen flex flex-col items-center justify-center px-4 py-12'}`}>
        



        {/* Animated 404 - Responsive */}
        <div className={`relative ${isMobile ? 'mb-6' : 'mb-12'}`}>
          {/* Glow Effect - Smaller on mobile */}
          <div className={`absolute inset-0 ${isMobile ? 'blur-2xl' : 'blur-3xl'} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 dark:opacity-30 animate-pulse`}></div>
          
          {/* Numbers with Animation - Responsive sizes */}
          <div className={`relative flex items-center justify-center ${isMobile ? 'gap-3' : 'gap-4 md:gap-8'}`}>
            {[4, 0, 4].map((number, index) => (
              <div key={index} className="relative">
                {/* Glow effect for 0 */}
                {number === 0 && (
                  <div className={`absolute inset-0 ${isMobile ? 'w-20 h-20' : 'w-32 h-32 md:w-40 md:h-40'} bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400 rounded-full blur-xl opacity-30 animate-ping-slow`}></div>
                )}
                
                {/* Number */}
                <span className={`${isMobile ? 'text-7xl' : 'text-9xl md:text-[200px]'} font-black bg-gradient-to-r ${
                  index === 0 ? 'from-blue-600 to-cyan-400 dark:from-blue-400 dark:to-cyan-300' :
                  index === 1 ? 'from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300' :
                  'from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300'
                } bg-clip-text text-transparent ${
                  isMobile ? 'animate-none' : index === 1 ? 'animate-float-medium' : 'animate-bounce-slow'
                } ${index === 2 ? 'delay-300' : ''}`}>
                  {number}
                </span>
                
                {/* Decorative Icons - Smaller/Hidden on mobile */}
                {!isMobile && (
                  <>
                    {index === 0 && (
                      <div className="absolute -top-4 -right-4">
                        <Sparkles className="w-8 h-8 text-yellow-500 animate-spin-slow" />
                      </div>
                    )}
                    {index === 1 && (
                      <Rocket className="absolute -bottom-6 -left-6 w-10 h-10 text-purple-600 dark:text-purple-400 animate-bounce" />
                    )}
                    {index === 2 && (
                      <div className="absolute -bottom-4 -right-4">
                        <Globe className="w-8 h-8 text-green-500 animate-rotate-slow" />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message - Responsive */}
        <div className={`text-center ${isMobile ? 'mb-6 px-2' : 'mb-8 max-w-2xl mx-auto'}`}>
          <div className="relative inline-block mb-4">
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-5xl'} font-bold mb-3 relative z-10`}>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              صفحه مورد نظر یافت نشد!
              </span>
            </h1>
            <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 ${isMobile ? 'w-32 h-0.5' : 'w-48 h-1'} bg-gradient-to-r from-transparent via-blue-500 to-transparent`}></div>
          </div>
          
          <p className={`${isMobile ? 'text-sm px-2' : 'text-lg md:text-xl'} text-gray-600 dark:text-gray-300 mb-6 leading-relaxed`}>
            {isMobile 
              ? 'صفحه‌ای که دنبالش بودید پیدا نشد. می‌توانید به خانه برگردید یا دوباره تلاش کنید.'
              : ' اما نگران نباشید، گزینه‌های زیادی برای بازگشت دارید!'
            }
          </p>
        </div>

        {/* Action Buttons - Stacked on mobile */}
        <div className={`${isMobile ? 'flex flex-col gap-3 mb-8 px-4' : 'flex flex-col sm:flex-row gap-4 md:gap-6 mb-16'} w-full max-w-md mx-auto`}>
          <Link 
            href="/"
            className={`group relative ${isMobile ? 'px-4 py-3 text-base' : 'px-8 py-4 text-lg'} bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Home className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:rotate-12 transition-transform`} />
              <span >بازگشت به خانه</span>
            </div>
            {!isMobile && (
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/10 rounded-full group-hover:animate-spin-slow"></div>
            )}
          </Link>
          
          
          <button
            onClick={() => window.location.reload()}
            className={`group relative ${isMobile ? 'px-4 py-3 text-base' : 'px-8 py-4 text-lg'} bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-500 dark:to-emerald-400 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <RefreshCw className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:rotate-180 transition-transform duration-300`} />
              <span>تلاش مجدد</span>
            </div>
            {!isMobile && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full group-hover:scale-150 transition-all duration-300"></div>
            )}
          </button>
        </div>




        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-blue-400 dark:bg-blue-300 rounded-full"
              style={particle.style}
            ></div>
          ))}
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes rotate-slow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 7s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 10s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        /* Responsive animations - disable on mobile for performance */
        @media (max-width: 768px) {
          .animate-bounce-slow,
          .animate-float-medium,
          .animate-spin-slow,
          .animate-rotate-slow {
            animation: none;
          }
          
          .animate-ping-slow {
            animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button, 
          a {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Better text readability */
          .text-gray-600 {
            color: #4b5563;
          }
          
          .dark .text-gray-300 {
            color: #d1d5db;
          }
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        /* Custom scrollbar - hidden on mobile */
        @media (min-width: 768px) {
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #7c3aed);
          }
          
          .dark ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
        }
        
        /* Prevent horizontal scroll on mobile */
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
    </div>
  );
}