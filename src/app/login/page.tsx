import SignIn from "@/components/sign-in";
import React from "react";

const LoginPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Login
        </h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          Please enter your credentials to log in.
        </p>
        <div className="mt-4">
          <div>
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
