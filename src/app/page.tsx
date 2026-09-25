"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  useEffect(() => {
    if (!showLoader && !loading) {
      if (user) {
        router.replace("/explore");
      } else {
        router.replace("/login");
      }
    }
  }, [showLoader, loading, user, router]);

  return <LoadingScreen onComplete={handleLoaderComplete} />;
}
