"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminAccounts, fetchAdminLogs, AdminAccount, AdminLog } from "@/store/slices/adminSlice";
import { loginSuccess } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  IoShieldCheckmarkOutline, 
  IoRefreshOutline, 
  IoKeyOutline, 
  IoReaderOutline,
  IoSwapHorizontalOutline,
  IoEyeOutline
} from "react-icons/io5";

export default function AdminsManagementPage() {
  const dispatch = useAppDispatch();
  const { admins, adminLogs, loading } = useAppSelector((state) => state.admin);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Switch session modal state
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync log & status registry on load
  const syncRegistry = () => {
    dispatch(fetchAdminAccounts());
    dispatch(fetchAdminLogs());
  };

  useEffect(() => {
    syncRegistry();
  }, [dispatch]);

  const handleStartSwitch = (admin: AdminAccount) => {
    if (admin.email === currentUser?.email) {
      toast.error("You are already active on this admin session");
      return;
    }
    setSelectedAdmin(admin);
    setPassword("");
  };

  const handleVerifySwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !password.trim()) return;

    setIsVerifying(true);
    try {
      const response = await api.post("/api/admin/system-accounts/verify", {
        email: selectedAdmin.email,
        password
      });

      const { token, user } = response.data;

      // Save token and user info to sessionStorage for admins
      if (typeof window !== "undefined") {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Update auth store state
      dispatch(loginSuccess({ user, token }));
      
      toast.success(`Session switched to ${user.full_name}!`);
      setSelectedAdmin(null);
      setPassword("");
      
      // Refresh registry
      syncRegistry();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper to format Date cleanly
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} , ${hours}:${minutes}:${seconds}`;
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Helper to get action badge color styles
  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN")) {
      return "bg-purple-50 text-purple-600 border-purple-100";
    }
    if (act.includes("LOGOUT")) {
      return "bg-gray-50 text-gray-500 border-gray-200";
    }
    if (act.includes("ADD")) {
      return "bg-green-50 text-green-600 border-green-100";
    }
    if (act.includes("UPDATE")) {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }
    if (act.includes("DELETE")) {
      return "bg-red-50 text-red-600 border-red-100";
    }
    if (act.includes("SWITCH")) {
      return "bg-blue-50 text-blue-600 border-blue-100";
    }
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="p-8 bg-white min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gray-50 pb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#4a2c2a] flex items-center gap-2">
            <IoShieldCheckmarkOutline size={32} className="text-[#4a2c2a]" />
            Security & Administrators
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
            System Identity Registry, Audits & Session Access
          </p>
        </div>

        <button 
          onClick={syncRegistry}
          className="flex items-center gap-2 border border-gray-100 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#4a2c2a] hover:border-[#4a2c2a] transition-all rounded-sm bg-gray-50/50"
        >
          <IoRefreshOutline size={14} className={loading ? "animate-spin" : ""} />
          Sync Registry
        </button>
      </div>

      {/* Main Grid: Left is Admin Table, Right is Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Admin Accounts List (Takes 2 span on wide screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-6 bg-[#4a2c2a] rounded-sm"></span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#4a2c2a]">
              Administrative Identity Registry
            </h3>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                  <th className="py-4 px-6">Identity profile</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Last Login</th>
                  <th className="py-4 px-4">Last Logout</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => {
                  const isActiveUser = admin.email.toLowerCase() === currentUser?.email?.toLowerCase();
                  return (
                    <tr key={admin.id} className={`group transition-all ${isActiveUser ? 'bg-[#fcf8f6]/50' : 'hover:bg-gray-50/30'}`}>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black tracking-wider transition-colors ${
                            isActiveUser 
                              ? 'bg-[#4a2c2a] text-white' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {getInitials(admin.full_name)}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                              {admin.full_name}
                              {isActiveUser && (
                                <span className="bg-[#4a2c2a]/10 text-[#4a2c2a] text-[8px] font-black tracking-[0.1em] px-2 py-0.5 rounded-full scale-90">
                                  ACTIVE SESSION
                                </span>
                              )}
                            </p>
                            <p className="text-[9px] text-gray-400 font-semibold tracking-wider mt-0.5">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            admin.status === "Active Now" 
                              ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' 
                              : 'bg-gray-300'
                          }`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            admin.status === "Active Now" 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`}>
                            {admin.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-[11px] font-bold text-gray-500 tracking-wider">
                        {formatDate(admin.last_login)}
                      </td>
                      <td className="py-5 px-4 text-[11px] font-bold text-gray-500 tracking-wider">
                        {formatDate(admin.last_logout)}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => handleStartSwitch(admin)}
                          disabled={isActiveUser}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                            isActiveUser
                              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white border-gray-100 text-[#4a2c2a] hover:border-[#4a2c2a] active:scale-95 shadow-sm'
                          }`}
                        >
                          <IoSwapHorizontalOutline size={12} />
                          Switch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Security Audit Logs (1 span) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-6 bg-[#4a2c2a] rounded-sm"></span>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#4a2c2a]">
              Audit Trail Registry
            </h3>
          </div>

          <div className="border border-gray-100 rounded-sm p-4 bg-gray-50/30">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Audit Feed (Newest First)
              </span>
              <IoReaderOutline size={14} className="text-gray-400" />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {adminLogs.length === 0 ? (
                <div className="py-12 text-center text-[10px] uppercase tracking-widest text-gray-300 font-bold">
                  No logs captured
                </div>
              ) : (
                adminLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white border border-gray-100 shadow-sm rounded-sm space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[8px] font-black tracking-[0.1em] px-2 py-0.5 rounded-sm border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold tracking-wider">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-700 leading-relaxed font-bold">
                      {log.details}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-x-2 pt-1 border-t border-gray-50/50 text-[8px] text-gray-400 font-semibold uppercase tracking-wider">
                      <span>By: {log.admin_name}</span>
                      <span className="text-gray-300 truncate max-w-[120px]">Page: {log.page}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Switch Credentials Gated Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white border border-gray-100 p-8 rounded-sm max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in duration-300">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#4a2c2a]/10 text-[#4a2c2a] rounded-full flex items-center justify-center mx-auto">
                <IoKeyOutline size={22} />
              </div>
              <h3 className="text-md font-serif text-[#4a2c2a] uppercase tracking-wider">
                Credential Authentication Gated
              </h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">
                Confirm credentials to switch to {selectedAdmin.full_name}
              </p>
            </div>

            <form onSubmit={handleVerifySwitch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Target Account Email
                </label>
                <input 
                  type="text" 
                  value={selectedAdmin.email} 
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 outline-none text-[10px] font-bold tracking-widest uppercase text-gray-400 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                  Enter Password
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-white border border-gray-100 outline-none text-[10px] font-bold tracking-widest text-gray-600 focus:border-[#4a2c2a] transition-all rounded-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  disabled={isVerifying}
                  className="flex-1 border border-gray-100 text-gray-400 px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !password.trim()}
                  className="flex-1 bg-[#4a2c2a] text-white px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? "Verifying..." : "Verify & Switch"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
