import { LoginForm } from "@/components/Login";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900"></div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
          </svg>
          Artha task
        </div>
        <div className="z-10 my-auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
            <defs>
              {/* <linearGradient
                id="bgGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#4a90e2", stopOpacity: 0.2 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#81c3fd", stopOpacity: 0.3 }}
                />
              </linearGradient> */}

              <filter id="glass">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="1"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                  result="glass"
                />
              </filter>
            </defs>

            <rect width="800" height="200" fill="url(#bgGradient)" />

            <rect
              x="40"
              y="40"
              width="140"
              height="120"
              rx="10"
              fill="white"
              opacity="0.15"
              filter="url(#glass)"
            />
            <rect
              x="200"
              y="40"
              width="140"
              height="120"
              rx="10"
              fill="white"
              opacity="0.15"
              filter="url(#glass)"
            />
            <rect
              x="360"
              y="40"
              width="140"
              height="120"
              rx="10"
              fill="white"
              opacity="0.15"
              filter="url(#glass)"
            />

            <circle cx="110" cy="70" r="15" fill="white" opacity="0.8" />
            <rect
              x="90"
              y="100"
              width="40"
              height="6"
              rx="3"
              fill="white"
              opacity="0.8"
            />
            <rect
              x="85"
              y="115"
              width="50"
              height="6"
              rx="3"
              fill="white"
              opacity="0.6"
            />

            <rect
              x="230"
              y="60"
              width="80"
              height="10"
              rx="5"
              fill="white"
              opacity="0.8"
            />
            <rect
              x="230"
              y="80"
              width="60"
              height="10"
              rx="5"
              fill="white"
              opacity="0.6"
            />
            <circle cx="270" cy="120" r="20" fill="white" opacity="0.7" />

            <path
              d="M400 80 L420 100 L450 70"
              stroke="white"
              strokeWidth="8"
              fill="none"
              opacity="0.8"
            />
            <rect
              x="390"
              y="115"
              width="80"
              height="6"
              rx="3"
              fill="white"
              opacity="0.6"
            />

            <circle cx="600" cy="100" r="40" fill="white" opacity="0.1" />
            <circle cx="650" cy="60" r="25" fill="white" opacity="0.1" />
            <circle cx="680" cy="140" r="30" fill="white" opacity="0.1" />
          </svg>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              “This library has saved me countless hours of work and helped me
              deliver stunning designs to my clients faster than ever before.”
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
