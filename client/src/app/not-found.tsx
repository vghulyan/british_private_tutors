"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NotFoundPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-lg">
        You will be redirected to the home page shortly.
      </p>
    </div>
  );
};

export default NotFoundPage;
