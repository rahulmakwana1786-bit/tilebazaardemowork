// "use client";
// import React, { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAllCustomers } from "@/store/slices/adminSlice";
// import { useRouter } from "next/navigation";

// const AdminCustomersPage = () => {
//   const dispatch = useAppDispatch();
//   const { customers, loading, error } = useAppSelector((state) => state.admin);
//   const router = useRouter();

//   useEffect(() => {
//     dispatch(fetchAllCustomers());
//   }, [dispatch]);

//   if (loading) return <div className="p-10 text-center">Loading User Database...</div>;
//   if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold">
//             <tr>
//               <th className="p-4 border-b">Name</th>
//               <th className="p-4 border-b">Email</th>
//               <th className="p-4 border-b">Role</th>
//               <th className="p-4 border-b">Joined</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//   {customers.map((user) => (
//     <tr key={user.id} className="hover:bg-gray-50 transition-colors">
//       <td className="p-4">
//         <div className="font-bold text-gray-900">{user.full_name}</div>
//         <div className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</div>
//       </td>
//       <td className="p-4 text-sm text-gray-600">
//         {user.email}
//         <div className="text-xs text-gray-400">{user.phone_number || "No Phone"}</div>
//       </td>
//       <td className="p-4 text-center">
//         <div className="font-bold text-gray-900">{user.order_count}</div>
//         <div className="text-[10px] text-gray-400 uppercase font-bold">Orders</div>
//       </td>
//       <td className="p-4 text-right">
//         <div className="font-black text-green-600">£{user.total_spend.toFixed(2)}</div>
//         <div className="text-[10px] text-gray-400 uppercase font-bold">Total Spent</div>
//       </td>
//       <td className="p-4 text-right">
//         <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter ${
//           user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
//         }`}>
//           {user.role.toUpperCase()}
//         </span>
//       </td>
//       <td className="p-4 text-right">
//   <button 
//     onClick={() => router.push(`/admin/customers/${user.id}`)}
//     className="px-4 py-2 border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
//   >
//     View Profile
//   </button>
// </td>
//     </tr>
//   ))}
// </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminCustomersPage;


// "use client";
// import React, { useEffect, useState } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAllCustomers } from "@/store/slices/adminSlice";
// import { useRouter } from "next/navigation";
// import { Search, Filter, UserCircle } from "lucide-react"; // Optional: lucide-react icons

// const AdminCustomersPage = () => {
//   const dispatch = useAppDispatch();
//   const { customers, loading, error } = useAppSelector((state) => state.admin);
//   const router = useRouter();

//   // Local state for filtering
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");

//   useEffect(() => {
//     dispatch(fetchAllCustomers());
//   }, [dispatch]);

//   // Filtering Logic
//   const filteredCustomers = customers.filter((user) => {
//     const matchesSearch = 
//       user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = roleFilter === "all" || user.role === roleFilter;
//     return matchesSearch && matchesRole;
//   });

//   if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse font-medium">Loading User Database...</div>;
//   if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>;

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
//             <p className="text-sm text-gray-500">Monitor user activity and lifetime value.</p>
//           </div>

//           {/* Filters Bar */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search by name or email..."
//                 className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="relative">
//               <select
//                 className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
//                 value={roleFilter}
//                 onChange={(e) => setRoleFilter(e.target.value)}
//               >
//                 <option value="all">All Roles</option>
//                 <option value="customer">Customers</option>
//                 <option value="admin">Admins</option>
//               </select>
//               <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         {/* Customers Table */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
//                   <th className="px-6 py-4 border-b border-gray-100">Customer</th>
//                   <th className="px-6 py-4 border-b border-gray-100 text-center">Stats</th>
//                   <th className="px-6 py-4 border-b border-gray-100 text-right">Lifetime Value</th>
//                   <th className="px-6 py-4 border-b border-gray-100 text-right">Role</th>
//                   <th className="px-6 py-4 border-b border-gray-100"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {filteredCustomers.map((user) => (
//                   <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
//                           {user.full_name[0]}
//                         </div>
//                         <div>
//                           <div className="font-bold text-gray-900">{user.full_name}</div>
//                           <div className="text-xs text-gray-500">{user.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <div className="text-sm font-bold text-gray-900">{user.order_count || 0}</div>
//                       <div className="text-[10px] text-gray-400 uppercase font-bold">Orders</div>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="text-sm font-black text-gray-900">£{(user.total_spend || 0).toFixed(2)}</div>
//                       <div className="text-[10px] text-gray-400 uppercase font-bold">Total Spent</div>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
//                         user.role === 'admin' 
//                           ? 'bg-purple-50 text-purple-600 border-purple-100' 
//                           : 'bg-gray-50 text-gray-600 border-gray-100'
//                       }`}>
//                         {user.role.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button 
//                         onClick={() => router.push(`/admin/customers/${user.id}`)}
//                         className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
//                       >
//                         View Profile
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
            
//             {filteredCustomers.length === 0 && (
//               <div className="p-20 text-center flex flex-col items-center gap-2">
//                 <UserCircle className="w-12 h-12 text-gray-200" />
//                 <p className="text-gray-400 font-medium">No customers match your criteria.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminCustomersPage;



"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllCustomers } from "@/store/slices/adminSlice";
import { useRouter } from "next/navigation";
import { Search, Filter, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";
const CustomerSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-100 rounded" />
          <div className="h-2 w-24 bg-gray-50 rounded" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center"><div className="h-4 w-8 bg-gray-100 mx-auto rounded" /></td>
    <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-gray-100 ml-auto rounded" /></td>
    <td className="px-6 py-4 text-right"><div className="h-6 w-16 bg-gray-50 ml-auto rounded" /></td>
    <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-gray-100 ml-auto rounded-sm" /></td>
  </tr>
);
const AdminCustomersPage = () => {
  const dispatch = useAppDispatch();
  const { customers, loading, error } = useAppSelector((state) => state.admin);
  const router = useRouter();

  // Filter and Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Filtering Logic
  const filteredCustomers = customers.filter((user) => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  // if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse font-medium">Syncing User Data...</div>;
  if (error) return <div className="p-10 text-red-500 text-center font-bold">{error}</div>;

  return (
    
      <div className="p-8 bg-white h-full flex flex-col">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-sm text-gray-500">Managing {filteredCustomers.length} total customers.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="admin">Admins</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="relative flex-1 border border-gray-50 rounded-sm overflow-hidden flex flex-col"></div>
          <div className="overflow-y-auto overflow-x-auto h-full scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <th className="px-6 py-4 border-b border-gray-100">Customer</th>
                  <th className="px-6 py-4 border-b border-gray-100 text-center">Orders</th>
                  <th className="px-6 py-4 border-b border-gray-100 text-right">Lifetime Spend</th>
                  <th className="px-6 py-4 border-b border-gray-100 text-right">Role</th>
                  <th className="px-6 py-4 border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                <>
                  {[...Array(8)].map((_, i) => <CustomerSkeletonRow key={i} />)}
                </>
              ) :currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                          {user.full_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{user.order_count || 0}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">£{(user.total_spend || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        user.role === 'admin' ? 'bg-black/80 text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => router.push(`/admin/customers/${user.id}`)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                Showing <span className="text-gray-900">{indexOfFirstItem + 1}</span> to <span className="text-gray-900">{Math.min(indexOfLastItem, filteredCustomers.length)}</span> of <span className="text-gray-900">{filteredCustomers.length}</span> customers
              </p>
              
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-black text-white shadow-md" 
                          : "text-gray-500 hover:bg-white hover:text-black border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
  );
};

export default AdminCustomersPage;