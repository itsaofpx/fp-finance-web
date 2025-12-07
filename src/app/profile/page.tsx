"use client";
import Image from "next/image";
import React, { useEffect, useState, Fragment, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios, { AxiosError } from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { Plus, X } from "lucide-react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { Alert } from "@mui/material";

interface UserData {
  id: string;
  email: string;
  givenName: string;
  picture: string;
  googleId?: string;
}

interface ISector {
  id: string;
  name: string;
  owned: boolean;
}

interface ErrorResponse {
  message: string;
}

interface Plan {
  id: string;
  name: string;
  planType: string;
  currentAge: number;
  retirementAge: number;
  money: number;
  currentSavings: number;
  expectedReturn: number;
  inflationRate: number;
  retirementYears: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<ISector[]>([]);
  const [accountInterestSector, setAccountInterestSector] = useState<ISector[]>(
    []
  );
  const [openSnackAlert, setOpenSnackAlert] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cookies = parseCookies();
        const accessToken = cookies.accessToken;
        const accountCookie = cookies.account;

        if (!accessToken) throw new Error("Authentication token is missing");

        let accountData: { googleId?: string } = {};
        if (accountCookie) {
          try {
            accountData = JSON.parse(accountCookie);
          } catch (parseError) {
            console.error("Failed to parse account cookie", parseError);
          }
        }

        const googleId = accountData.googleId;
        if (!googleId) throw new Error("Google ID is missing");

        const res = await axios.get<UserData>(
          `http://localhost:3001/accounts/google/${googleId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setUserData(res.data);

        try {
          const plansRes = await axios.get<Plan[]>(
            `http://localhost:3001/plans/account/${res.data.id}`
          );
          setPlans(plansRes.data || []);
        } catch (planError) {
          console.error("Failed to fetch plans:", planError);
          setPlans([]);
        }

        try {
          const accountId = res.data.id;
          const sectorRes = await axios.get<ISector[]>(
            `http://localhost:3001/sector?accountId=${accountId}`
          );
          const interestSectors = sectorRes.data.filter(
            (sector) => sector.owned
          );
          setAccountInterestSector(interestSectors);
          setSectors(sectorRes.data || []);
        } catch (sectorError) {
          console.error("Failed to fetch sectors:", sectorError);
          setSectors([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ErrorResponse>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "An unexpected error occurred";
          setError(errorMessage);
        } else if (error instanceof Error) {
          setError(error.message);
        }
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      setOpenBackDrop(true);
      ["accessToken", "refreshToken", "account"].forEach((cookie) =>
        destroyCookie(null, cookie, { path: "/" })
      );
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setOpenBackDrop(false);
    }
  };

  const toggleSector = async (sector: ISector) => {
    if (!userData) return;

    const isSelected = accountInterestSector.some((s) => s.id === sector.id);

    if (isSelected && accountInterestSector.length <= 3) {
      setOpenSnackAlert(true);
      return;
    }

    let updated: ISector[];

    if (isSelected) {
      updated = accountInterestSector.filter((s) => s.id !== sector.id);
    } else {
      updated = [...accountInterestSector, sector];
    }

    setAccountInterestSector(updated);

    try {
      await axios.patch(`http://localhost:3001/sector/${userData.id}`, {
        sectors: updated.map((s) => s.id),
      });
    } catch (err) {
      console.error("Failed to update sectors:", err);
    }
  };

  const handleCloseSnackAlert = (
    event: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackAlert(false);
  };

  if (loading)
    return (
      <Backdrop open={true} sx={{ zIndex: 9999, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  if (error)
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
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="min-h-screen pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 top-24">
                <div className="flex flex-col items-center">
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
                    Member
                  </p>
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

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info Card */}
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

              {/* Interested Sectors Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Sectors I’m Interested In
                </h2>
                <div className="flex flex-wrap gap-2">
                  {accountInterestSector.map((sector) => (
                    <span
                      key={sector.id}
                      className="px-4 py-2 bg-emerald-100 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-full text-sm flex items-center gap-1"
                    >
                      {sector.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleSector(sector)}
                      />
                    </span>
                  ))}
                  <button
                    onClick={() => setShowSectorModal(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </button>
                </div>
              </div>

              {/* My Plans Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  My Financial Plans
                  <span className="ml-auto text-sm bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                    {plans.length} {plans.length === 1 ? "Plan" : "Plans"}
                  </span>
                </h2>

                {plans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      คุณยังไม่มีแผนการเงิน
                    </p>
                    <button
                      onClick={() => router.push("/plan")}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      สร้างแผนแรกของคุณ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                plan.planType === "ib"
                                  ? "bg-blue-100 dark:bg-blue-900"
                                  : "bg-purple-100 dark:bg-purple-900"
                              }`}
                            >
                              <span className="text-xl">
                                {plan.planType === "ib" ? "💰" : "🎯"}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {plan.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {plan.planType === "ib"
                                  ? "แผนตามรายได้"
                                  : "แผนตามเป้าหมาย"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              router.push(
                                `/plan/${
                                  plan.planType === "ib"
                                    ? "income-based"
                                    : "goal-based"
                                }`
                              )
                            }
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
                          >
                            ดูรายละเอียด →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              อายุปัจจุบัน
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {plan.currentAge} ปี
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              อายุเป้าหมาย
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {plan.retirementAge} ปี
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              เงินออมปัจจุบัน
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              ฿
                              {new Intl.NumberFormat("th-TH").format(
                                plan.currentSavings
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ผลตอบแทน
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {parseFloat(
                                plan.expectedReturn.toString()
                              ).toFixed(2)}
                              % / ปี
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-500">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            สร้างเมื่อ:{" "}
                            {new Date(plan.createdAt).toLocaleDateString(
                              "th-TH",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
        open={openSnackAlert}
        onClose={handleCloseSnackAlert}
        key={"topright"}
      >
        <Alert
          onClose={handleCloseSnackAlert}
          severity="error"
          sx={{ width: "100%" }}
        >
          ไม่สามารถเลือกต่ำกว่า 3 เซคเตอร์ได้!
        </Alert>
      </Snackbar>

      {/* Sector Modal */}
      <Transition appear show={showSectorModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowSectorModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    Select Sectors
                  </Dialog.Title>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {sectors.map((sector) => {
                      const selected = accountInterestSector.includes(sector);
                      return (
                        <button
                          key={sector.id}
                          onClick={() => toggleSector(sector)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            selected
                              ? "bg-emerald-100 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {sector.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      type="button"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      onClick={() => setShowSectorModal(false)}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
