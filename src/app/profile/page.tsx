"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios, { AxiosError } from "axios";

interface UserData {
  id: string;
  email: string;
  givenName: string;
  picture: string;
  googleId?: string;
}

interface ErrorResponse {
  message: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Parse cookies with error handling
        const cookies = parseCookies();
        const accessToken = cookies.accessToken;
        const accountCookie = cookies.account;

        // Validate tokens
        if (!accessToken) {
          throw new Error("Authentication token is missing");
        }

        // Safely parse account cookie
        let accountData: { googleId?: string } = {};
        try {
          accountData = accountCookie ? JSON.parse(accountCookie) : {};
        } catch (parseError) {
          console.error("Failed to parse account cookie", parseError);
          throw new Error("Invalid account information");
        }

        // Validate Google ID
        const googleId = accountData.googleId;
        if (!googleId) {
          throw new Error("Google ID is missing");
        }

        // Fetch user profile
        const res = await axios.get<UserData>(
          `http://localhost:3001/accounts/google/${googleId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Validate response data
        if (!res.data) {
          throw new Error("No user data received");
        }

        setUserData(res.data);
      } catch (error) {
        // Comprehensive error handling
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ErrorResponse>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "An unexpected error occurred";

          setError(errorMessage);
          console.error("Profile fetch error:", errorMessage);
        } else if (error instanceof Error) {
          setError(error.message);
          console.error("Profile fetch error:", error.message);
        }

        // Redirect on error
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Logout handler with improved error handling
  const handleLogout = async () => {
    try {
      setOpenBackDrop(true);

      // Clear cookies with path
      const cookiesToRemove = ["accessToken", "refreshToken", "account"];
      cookiesToRemove.forEach((cookie) => {
        destroyCookie(null, cookie, { path: "/" });
      });

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setOpenBackDrop(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Backdrop open={true} sx={{ zIndex: 9999, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // No user data
  if (!userData) {
    return null;
  }

  // Main Profile Page Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="min-h-screen pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-24">
                <div className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative w-32 h-32 mb-6">
                    <Image
                      src={userData.picture}
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                      priority
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-700"></div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {userData.givenName}
                  </h1>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Premium Member
                  </p>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors"
                      onClick={handleLogout}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">
                      {userData.givenName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Email Address
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium break-words">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Backdrop */}
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openBackDrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
