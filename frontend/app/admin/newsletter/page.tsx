"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNewsletterSubscribers } from "@/store/slices/adminSlice";
import Link from "next/link";

export default function AdminNewsletterPage() {
  const dispatch = useAppDispatch();
  const { newsletter, loading, error } = useAppSelector((s) => s.admin);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    dispatch(fetchNewsletterSubscribers({ page, limit }));
  }, [dispatch, page]);

  if (loading && !newsletter) {
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

  const items = newsletter?.items ?? [];
  const total = newsletter?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-full bg-white">
      <header className="mb-10 flex flex-col gap-4 border-b border-gray-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            Marketing
          </p>
          <h1 className="font-serif text-3xl text-[#4a2c2a]">Newsletter subscribers</h1>
          <p className="mt-2 text-sm text-gray-500">
            {total} total record{total === 1 ? "" : "s"} (including unsubscribed)
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
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-gray-400">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-[#4a2c2a]">{row.email}</td>
                  <td className="px-4 py-3 text-gray-600">{row.source}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tight ${
                        row.unsubscribed_at ? "text-gray-400" : "text-green-700"
                      }`}
                    >
                      {row.unsubscribed_at ? "Unsubscribed" : "Active"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-gray-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[11px] text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border border-gray-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
