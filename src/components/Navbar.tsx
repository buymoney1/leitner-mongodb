import Link from "next/link";
import React from "react";
import { auth } from "@/lib/auth"; // Adjust the import path as necessaryq
import { SignOut } from "./sign-out";

const Navbar = async () => {
  const session = await auth();

  return (
    <div className="bg-gray-800 text-white shadow-md ">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            Logo
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <SignOut />
              </>
            ) : (
              <Link href="/login">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
