import { LoginForm } from "@/components/Login";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="container relative min-h-screen w-full bg-white lg:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
      {/* Left illustration and slogan only on large screens */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#0c66e4] p-10 text-white dark:border-r min-h-screen">
        <div className="w-full flex items-center mb-8">
          <svg
            viewBox="0 0 24 24"
            fill="#fff"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
          </svg>
          <span className="text-xl font-bold">Artha task</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <div className="text-5xl font-bold text-white text-center mb-8" style={{ fontFamily: 'cursive' }}>
            <p className="mx-4">All in one</p>
            <span className="mx-4">Manage your Organization</span>
          </div>
          <blockquote className="space-y-2 text-center w-full">
            <p className="text-lg">
              “How about \"Stay Organized, Stay Productive\"? It captures the essence of task management by emphasizing both organization and productivity.”
            </p>
            <footer className="text-sm"></footer>
          </blockquote>
        </div>
      </div>
      {/* Login form always visible and centered */}
      <div className="flex w-full min-h-screen items-center justify-center px-4 py-8 lg:py-0">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
