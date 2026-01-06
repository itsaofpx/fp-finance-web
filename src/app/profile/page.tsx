"use client";
import Image from "next/image";
import React, { useEffect, useState, Fragment, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios, { AxiosError } from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { Plus, X, User } from "lucide-react";
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

        // Fetch Plans
        try {
          const plansRes = await axios.get<Plan[]>(
            `http://localhost:3001/plans/account/${res.data.id}`
          );
          setPlans(plansRes.data || []);
        } catch (planError) {
          console.error("Failed to fetch plans:", planError);
          setPlans([]);
        }

        // Fetch Sectors
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
    if (reason === "clickaway") return;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sticky top-24 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center">
                {/* AI-Style Avatar Ring */}
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-emerald-400">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-1">
                    <Image
                      src={userData.picture}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full object-cover shadow-sm"
                      priority
                    />
                  </div>
                </div>

                <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.email}
                </h1>

                <div className="w-full mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">สถานะแผนการเงิน</span>
                    <span className="text-emerald-500 font-semibold">
                      {plans.length > 0 ? "Active" : "No Plan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">เซคเตอร์ที่ติดตาม</span>
                    <span className="text-gray-900 dark:text-gray-200 font-semibold">
                      {accountInterestSector.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <User className="text-blue-500" /> ข้อมูลส่วนตัว
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    ชื่อ-นามสกุล
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {userData.givenName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    อีเมล
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1 break-all">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Sectors */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Plus className="text-emerald-500" /> เซคเตอร์ที่สนใจ
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {accountInterestSector.map((sector) => (
                  <span
                    key={sector.id}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm flex items-center gap-2 border border-emerald-100 dark:border-emerald-800"
                  >
                    {sector.name}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-red-500"
                      onClick={() => toggleSector(sector)}
                    />
                  </span>
                ))}
                <button
                  onClick={() => setShowSectorModal(true)}
                  className="px-4 py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 rounded-lg text-sm transition-all"
                >
                  + เพิ่มเซคเตอร์
                </button>
              </div>
            </div>

            {/* Financial Plans */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-xl">📋</span> แผนการเงินของฉัน
              </h2>

              {plans.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">
                    คุณยังไม่มีแผนการเงินในขณะนี้
                  </p>
                  <button
                    onClick={() => router.push("/plan")}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                  >
                    เริ่มสร้างแผน
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="group p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-400 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                            {plan.planType === "ib" ? "💰" : "🎯"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {plan.planType === "ib"
                                ? "Income Based"
                                : "Goal Based"}
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
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          จัดการแผน
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
        open={openSnackAlert}
        onClose={handleCloseSnackAlert}
      >
        <Alert severity="error" variant="filled">
          ต้องเลือกอย่างน้อย 3 เซคเตอร์
        </Alert>
      </Snackbar>

      {/* Sector Modal (Keep as is) */}
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left shadow-2xl transition-all">
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  เลือกเซคเตอร์ที่สนใจ
                </Dialog.Title>
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-2">
                  {sectors.map((sector) => {
                    const selected = accountInterestSector.some(
                      (s) => s.id === sector.id
                    );
                    return (
                      <button
                        key={sector.id}
                        onClick={() => toggleSector(sector)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          selected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {sector.name}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <button
                    className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold"
                    onClick={() => setShowSectorModal(false)}
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
