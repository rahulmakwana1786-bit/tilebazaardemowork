// "use client";
// import React, { useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchUserDetails } from "@/store/slices/adminSlice";

// const CustomerDetailsPage = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { selectedUser: user, loading, error } = useAppSelector((state) => state.admin);
// interface UserOrder {
//   id: string;
//   total_amount: number;
//   status: string;
//   created_at: string;
// }
//   useEffect(() => {
//     if (id) dispatch(fetchUserDetails(id as string));
//   }, [id, dispatch]);

//   if (loading) return <div className="p-10 text-center font-bold">Loading Customer...</div>;
//   if (error || !user) return <div className="p-10 text-red-500 font-bold">{error || "User not found"}</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-6xl mx-auto">
//         <button onClick={() => router.back()} className="mb-6 text-gray-500 font-bold hover:text-black">
//           ← BACK TO CUSTOMERS
//         </button>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Profile Card */}
//           <div className="bg-white p-8 rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-black text-blue-600 mb-4">
//               {user.full_name[0]}
//             </div>
//             <h1 className="text-2xl font-black uppercase">{user.full_name}</h1>
//             <p className="text-gray-500 font-medium mb-6">{user.role.toUpperCase()}</p>
            
//             <div className="space-y-4 pt-6 border-t border-gray-100">
//               <div>
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
//                 <p className="font-bold">{user.email}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
//                 <p className="font-bold">{user.phone_number || "N/A"}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Since</p>
//                 <p className="font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
//               </div>
//             </div>
//           </div>

//           {/* Order History */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white p-8 rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//               <h2 className="text-xl font-black uppercase mb-6">Order History</h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="border-b-2 border-gray-100 text-[10px] text-gray-400 font-black uppercase">
//                       <th className="pb-4">Order ID</th>
//                       <th className="pb-4">Date</th>
//                       <th className="pb-4">Status</th>
//                       <th className="pb-4 text-right">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {user.orders?.map((order: UserOrder) => (
//                       <tr key={order.id} className="group">
//                         <td className="py-4 font-mono text-xs text-blue-600 font-bold">#{order.id.slice(0, 8)}</td>
//                         <td className="py-4 text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
//                         <td className="py-4">
//                           <span className={`px-2 py-1 rounded text-[10px] font-black ${
//                             order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
//                           }`}>
//                             {order.status.toUpperCase()}
//                           </span>
//                         </td>
//                         <td className="py-4 text-right font-black">£{order.total_amount.toFixed(2)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {(!user.orders || user.orders.length === 0) && (
//                   <p className="text-center py-10 text-gray-400 font-medium">No orders found for this customer.</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDetailsPage;

"use client";
import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserDetails } from "@/store/slices/adminSlice";

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedUser: user, loading, error } = useAppSelector((state) => state.admin);
interface UserOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

// eslint-disable-next-line react-hooks/preserve-manual-memoization
const stats = useMemo(() => {
    if (!user?.orders) return { count: 0, spent: 0 };
    
    const count = user.orders.length;
    // We only sum orders that aren't cancelled (optional, remove filter if you want to include all)
    const spent = user.orders
      .filter((o: UserOrder) => o.status !== 'cancelled') 
      .reduce((acc: number, order: UserOrder) => acc + (Number(order.total_amount) || 0), 0);
      
    return { count, spent };
  }, [user?.orders]);

  useEffect(() => {
    if (id) dispatch(fetchUserDetails(id as string));
  }, [id, dispatch]);

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Loading Customer Profile...</div>;
  if (error || !user) return <div className="p-10 text-red-500 text-center font-bold">Error: {error || "User not found"}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-semibold"
        >
          ← Back to Customers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
                  {user.full_name[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <DetailRow label="Email Address" value={user.email} />
                <DetailRow label="Phone" value={user.phone_number || "Not Provided"} />
                <DetailRow label="Member Since" value={new Date(user.created_at).toLocaleDateString('en-GB')} />
                <DetailRow label="Total Orders" value={`${stats.count}`} />
                <DetailRow label="Total Spent (Excl. Cancelled)" value={`£${stats.spent.toFixed(2)}`} />
                <DetailRow label="Address" value={
                  [user?.address_line1, user?.address_line2, user?.city, user?.postcode, user?.country]
                    .filter(part => part && part !== "-")
                    .join(", ") || "No address on file"
                } />
              </div>
            </div>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Order History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {user.orders?.slice().reverse().map((order: UserOrder) => (
                      <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:bg-gray-100/70 cursor-pointer transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold uppercase">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          £{order.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!user.orders || user.orders.length === 0) && (
                  <div className="p-20 text-center text-gray-400 italic">No purchase history available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-gray-50 pb-3 last:border-0">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    delivered: "bg-green-50 text-green-600 border-green-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default CustomerDetailsPage;