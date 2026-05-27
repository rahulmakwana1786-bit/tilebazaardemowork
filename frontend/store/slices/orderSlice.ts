import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { AxiosError } from "axios";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderUser {
  full_name: string;
  email: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;  // Snapshot from DB
  product_image: string; // Snapshot from DB
  quantity: number;
  price_at_purchase: number;
  unit?: string;
  // This matches the nested .select('..., product:products(*)')
  product?: {
    id: string;
    name: string;
    image: string;
    price: number;
    discount_price: number;
    size: string;
    finish: string;
    thickness: string;
    material: string;
    category: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  vat_amount: number;      // Added
  shipping_cost: number;   // Added
  currency: string;        // Added
  status: OrderStatus;
  payment_status: "unpaid" | "paid";
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  created_at: string;
  user?: OrderUser;
  items?: OrderItem[]; // We named it 'items' in the controller query
  order_items?: OrderItem[];
}

interface OrderState {
  items: Order[];
  currentOrder: Order | null; // Added this
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  items: [],
  currentOrder: null, // Added this
  loading: false,
  error: null,
};

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/fetchById", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    // Ensuring we grab the nested object if your backend wraps it in 'order'
    return response.data
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Order not found");
  }
});

export const fetchMyOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/orders/my-orders");
    // Matches the 'orders' key typically returned by list APIs
    return response.data.orders || response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch orders",
    );
  }
});

export const fetchAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/admin/orders");
    return response.data; // Based on your controller returning 'res.json(data)'
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch all orders",
    );
  }
});

export const updateStatus = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: string }
>("orders/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/api/admin/orders/${id}`, { status });
    return response.data.order;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Update failed");
  }
});

export const fetchAdminOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/fetchAdminOrderById", async (orderId, { rejectWithValue }) => {
  try {
    // Calls your router.get("/orders/:id") endpoint
    const response = await api.get(`/api/admin/orders/${orderId}`);

    // Since your backend does res.json(data), the order is the top-level object
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch order details",
    );
  }
});

export const createOrderAsync = createAsyncThunk<
  { message: string; orderId: string; total: number },
  { address_line1: string; address_line2?: string; city: string; postcode: string; country?: string },
  { rejectValue: string }
>("orders/create", async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Failed to place order");
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Optional: clear orders on logout
    clearOrders: (state) => {
      state.items = [];
      state.currentOrder = null;
      state.error = null;
    },

    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchMyOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )

      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.currentOrder = null;
      })

      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.loading = false;
          state.currentOrder = action.payload;
        },
      )

      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAllOrders.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
      })

      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })

      // FIXED UPDATE STATUS
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.items = state.items.map((order) =>
          order.id === action.payload.id
            ? action.payload
            : order
        );

        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })

      .addCase(fetchAdminOrderById.pending, (state) => {
        state.loading = true;
        state.currentOrder = null;
        state.error = null;
      })

      .addCase(
        fetchAdminOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.loading = false;
          state.currentOrder = action.payload;
        },
      )

      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { clearOrders, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
