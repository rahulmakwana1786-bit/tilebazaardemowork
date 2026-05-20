"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjectInquiries } from "@/store/slices/adminSlice";
import Link from "next/link";

export default function AdminInquiriesPage() {
  const dispatch = useAppDispatch();
  const { inquiries, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchProjectInquiries());
  }, [dispatch]);

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4a2c2a] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <header className="mb-10 flex flex-col gap-4 border-b border-gray-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            Project Inquiries
          </p>
          <h1 className="font-serif text-3xl text-[#4a2c2a]">Inquiry submissions</h1>
          <p className="mt-2 text-sm text-gray-500">
            {inquiries.length} total inquiry{inquiries.length === 1 ? "" : "ies"} received.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c2a] underline-offset-4 hover:underline"
        >
          Back to dashboard
        </Link>
      </header>

      <div className="overflow-x-auto rounded-sm border border-gray-100">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Inquiry Type</th>
              <th className="px-4 py-3">Area (sqm)</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                  No project inquiries have been submitted yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry, index) => (
                <tr key={inquiry.id || `inquiry-${index}`} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-gray-500">{new Date(inquiry.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-[#4a2c2a]">{inquiry.contact_name}</td>
                  <td className="px-4 py-3 text-gray-600">{inquiry.email}</td>
                  <td className="px-4 py-3 text-gray-600">{inquiry.company_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{inquiry.inquiry_type}</td>
                  <td className="px-4 py-3 text-gray-600">{inquiry.area_sqm ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xl overflow-hidden text-ellipsis whitespace-nowrap">
                    {inquiry.message || "No message"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
