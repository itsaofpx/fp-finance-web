import NavBar from "@/components/NavBar/page";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
// Mock user data - replace with actual user data from your authentication system
const userData = {
  email: "user@example.com",
  givenName: "John Doe",
  picture: "/vercel.svg", // Replace with actual profile picture URL
};

export default function ProfilePage() {
  const router = useRouter();
  const [openBackDrop, setOpenBackDrop] = React.useState(false);

  // Logout function
  const handleLogout = async () => {
    try {
      setOpenBackDrop(true);
      const cookiesToRemove = ["accessToken", "refreshToken", "account"];
      cookiesToRemove.forEach((cookie) => {
        destroyCookie(null, cookie);
      });
      await router.push("/landing");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setOpenBackDrop(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div>
        {/* Main Content */}
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
                      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                        Edit Profile
                      </button>
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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Member Since
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white font-medium">
                        January 2024
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account Status
                      </label>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    Account Statistics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        127
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Transactions
                      </div>
                    </div>

                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        $12,450
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Saved
                      </div>
                    </div>

                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        5
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Active Plans
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openBackDrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
