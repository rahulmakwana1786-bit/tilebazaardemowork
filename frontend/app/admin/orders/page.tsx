// "use client";
// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAllOrders, updateStatus, Order } from "@/store/slices/orderSlice";

// const AdminOrdersPage = () => {
//   const dispatch = useAppDispatch();
//   const { items, loading } = useAppSelector((state) => state.orders);
//   const orders = items as unknown as Order[];

//   useEffect(() => {
//     dispatch(fetchAllOrders());
//   }, [dispatch]);

//   const handleStatusChange = (id: string, newStatus: string) => {
//     const status = newStatus as Order['status'];
//     dispatch(updateStatus({ id, status }));
//   };

//   const getStatusColor = (status: Order['status']): string => {
//     const colors: Record<Order['status'], string> = {
//       delivered: 'bg-green-100 text-green-800',
//       shipped: 'bg-blue-100 text-blue-800',
//       processing: 'bg-yellow-100 text-yellow-800',
//       cancelled: 'bg-red-100 text-red-800',
//       pending: 'bg-gray-100 text-gray-800',
//     };
//     return colors[status];
//   };

//   if (loading) return <div className="p-10 text-center text-xl">Loading TileBazaar Orders...</div>;

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-sm">
//       <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {orders.map((order: Order) => (
//               <tr key={order.id}>
//                 <td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                   {new Date(order.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900">
//                   {/* Accessing user data from your joined query */}
//                   {order.user?.full_name || 'Guest'}
//                 </td>
//                 <td className="px-6 py-4 text-sm font-bold">
//                    £{order.total_amount.toFixed(2)}
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
//                     {order.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <select 
//                     value={order.status}
//                     onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                     className="border border-gray-300 rounded text-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="processing">Processing</option>
//                     <option value="shipped">Shipped</option>
//                     <option value="delivered">Delivered</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminOrdersPage;


// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAllOrders, updateStatus, Order, OrderStatus } from "@/store/slices/orderSlice";

// const AdminOrdersPage = () => {
//   const dispatch = useAppDispatch();
//   const { items, loading } = useAppSelector((state) => state.orders);
  
//   // Local state for filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

//   useEffect(() => {
//     dispatch(fetchAllOrders());
//   }, [dispatch]);

//   // Memoized filtered orders for performance
//   const filteredOrders = useMemo(() => {
//     return (items as Order[]).filter((order) => {
//       const matchesSearch = 
//         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesStatus = statusFilter === "all" || order.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [items, searchTerm, statusFilter]);

//   const handleStatusChange = (id: string, newStatus: string) => {
//     const status = newStatus as OrderStatus;
//     dispatch(updateStatus({ id, status }));
//   };

//   const getStatusColor = (status: OrderStatus): string => {
//     const colors: Record<OrderStatus, string> = {
//       delivered: 'bg-green-100 text-green-800',
//       shipped: 'bg-blue-100 text-blue-800',
//       processing: 'bg-yellow-100 text-yellow-800',
//       cancelled: 'bg-red-100 text-red-800',
//       pending: 'bg-gray-100 text-gray-800',
//     };
//     return colors[status];
//   };

//   if (loading) return <div className="p-10 text-center text-xl font-semibold">Loading TileBazaar Orders...</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             {/* Search Input */}
//             <input
//               type="text"
//               placeholder="Search ID or Customer..."
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm w-full sm:w-64"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />

//             {/* Status Filter */}
//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
//             >
//               <option value="all">All Statuses</option>
//               <option value="pending">Pending</option>
//               <option value="processing">Processing</option>
//               <option value="shipped">Shipped</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto border border-gray-100 rounded-lg">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Update</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {filteredOrders.length > 0 ? (
//                 filteredOrders.map((order) => (
//                   <tr key={order.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
//                       #{order.id.slice(0, 8)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{order.user?.full_name || 'Guest'}</div>
//                       <div className="text-xs text-gray-500">{order.user?.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-bold text-gray-900">£{order.total_amount.toFixed(2)}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
//                         {order.status.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <select 
//                         value={order.status}
//                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                         className="border border-gray-300 rounded text-sm p-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
//                       >
//                         <option value="pending">Pending</option>
//                         <option value="processing">Processing</option>
//                         <option value="shipped">Shipped</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="cancelled">Cancelled</option>
//                       </select>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
//                     No orders found matching your filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOrdersPage;



// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import Link from "next/link"; // Import Link for navigation
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAllOrders, updateStatus, Order, OrderStatus } from "@/store/slices/orderSlice";

// const AdminOrdersPage = () => {
//   const dispatch = useAppDispatch();
//   const { items, loading } = useAppSelector((state) => state.orders);
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

//   useEffect(() => {
//     dispatch(fetchAllOrders());
//   }, [dispatch]);

//   const filteredOrders = useMemo(() => {
//     return (items as Order[]).filter((order) => {
//       const matchesSearch = 
//         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesStatus = statusFilter === "all" || order.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [items, searchTerm, statusFilter]);

//   const handleStatusChange = (id: string, newStatus: string) => {
//     const status = newStatus as OrderStatus;
//     dispatch(updateStatus({ id, status }));
//   };

//   const getStatusColor = (status: OrderStatus): string => {
//     const colors: Record<OrderStatus, string> = {
//       delivered: 'bg-green-100 text-green-800',
//       shipped: 'bg-blue-100 text-blue-800',
//       processing: 'bg-yellow-100 text-yellow-800',
//       cancelled: 'bg-red-100 text-red-800',
//       pending: 'bg-gray-100 text-gray-800',
//     };
//     return colors[status];
//   };

//   if (loading) return <div className="p-10 text-center text-xl font-semibold">Loading TileBazaar Orders...</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               type="text"
//               placeholder="Search ID or Customer..."
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm w-full sm:w-64"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />

//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
//             >
//               <option value="all">All Statuses</option>
//               <option value="pending">Pending</option>
//               <option value="processing">Processing</option>
//               <option value="shipped">Shipped</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto border border-gray-100 rounded-lg">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Update</th>
//                 {/* NEW COLUMN HEADER */}
//                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {filteredOrders.length > 0 ? (
//                 filteredOrders.map((order) => (
//                   <tr key={order.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
//                       #{order.id.slice(0, 8)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{order.user?.full_name || 'Guest'}</div>
//                       <div className="text-xs text-gray-500">{order.user?.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-bold text-gray-900">£{order.total_amount.toFixed(2)}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
//                         {order.status.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <select 
//                         value={order.status}
//                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                         className="border border-gray-300 rounded text-sm p-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-transparent cursor-pointer"
//                       >
//                         <option value="pending">Pending</option>
//                         <option value="processing">Processing</option>
//                         <option value="shipped">Shipped</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="cancelled">Cancelled</option>
//                       </select>
//                     </td>
//                     {/* NEW COLUMN BODY: View Details Button */}
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <Link 
//                         href={`/admin/orders/${order.id}`}
//                         className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline decoration-2 underline-offset-4"
//                       >
//                         View Details
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   {/* Updated colSpan to 6 to account for the new column */}
//                   <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
//                     No orders found matching your filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOrdersPage;

"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllOrders, updateStatus, Order, OrderStatus } from "@/store/slices/orderSlice";
import { Search, Filter, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
const OrderSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded" /></td>
    <td className="px-6 py-4">
      <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-50 rounded" />
    </td>
    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-50 rounded-full" /></td>
    <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-50 rounded-lg" /></td>
    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 ml-auto rounded-lg" /></td>
  </tr>
);
const AdminOrdersPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.orders);
  
  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    return (items as Order[]).filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Pagination Calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    dispatch(updateStatus({ id, status: newStatus as OrderStatus }));
  };

  const getStatusStyles = (status: OrderStatus): string => {
    const styles: Record<OrderStatus, string> = {
      delivered: 'bg-green-50 text-green-700 border-green-100',
      shipped: 'bg-blue-50 text-blue-700 border-blue-100',
      processing: 'bg-amber-50 text-amber-700 border-amber-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100',
      pending: 'bg-gray-50 text-gray-700 border-gray-100',
    };
    return styles[status] || styles.pending;
  };

  // if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse font-medium">Updating Order Stream...</div>;

  return (
    
      <div className="p-8 bg-white h-full flex flex-col">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500">Track and fulfill TileBazaar shipments.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="relative flex-1 border border-gray-50 rounded-sm overflow-hidden flex flex-col">
          <div className="overflow-y-auto overflow-x-auto h-full scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <th className="px-6 py-4 border-b border-gray-100">Order Ref</th>
                  <th className="px-6 py-4 border-b border-gray-100">Customer</th>
                  <th className="px-6 py-4 border-b border-gray-100">Total</th>
                  <th className="px-6 py-4 border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 border-b border-gray-100">Update</th>
                  <th className="px-6 py-4 border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                // Show 8 skeletons while loading
                <>
                  {[...Array(8)].map((_, i) => <OrderSkeletonRow key={i} />)}
                </>
              ) :currentItems.length > 0 ? (
                  currentItems.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{order.user?.full_name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">£ {order.total_amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusStyles(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg text-xs p-1.5 font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm inline-block"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center flex flex-col items-center gap-2">
                      <ShoppingBag className="w-12 h-12 text-gray-100" />
                      <p className="text-gray-400 font-medium italic">No orders found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
              </p>
              
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-black text-white" 
                          : "text-gray-500 hover:bg-white border border-transparent hover:border-gray-200"
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
      </div>
  );
};

export default AdminOrdersPage;