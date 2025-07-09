import React from "react";
import { auth } from "@/lib/auth";
import Image from "next/image";

const AboutPage = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg">You must be signed in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg">This is the about page of our application.</p>
      <p className="text-lg mt-4">Welcome, {session.user.name}!</p>
      <p className="text-lg">Your email: {session.user.email}</p>
      <Image
        src={session.user.image || "/default-avatar.png"}
        alt="User Avatar"
        width={100}
        height={100}
        className="rounded-full mt-4"
      />
    </div>
  );
};

export default AboutPage;
