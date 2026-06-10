import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios"; // Use custom instance
import { AxiosError } from "axios";
import { RootState } from "../store";

export interface ProductDetails {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  image: string;
  size: string;
  slug: string;
  category?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  product?: ProductDetails;
}

interface FetchCartResponse {
  items: CartItem[];
  cartTotal: number;
  vatEstimate: number;
}

interface CartState {
  items: CartItem[];
  cartTotal: number;
  loading: boolean;
  error: string | null;
}

interface BackendError {
  message: string;
}

const initialState: CartState = {
  items: [],
  cartTotal: 0,
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// 1. Fetch Cart
export const fetchCart = createAsyncThunk<
  FetchCartResponse,
  void,
  { rejectValue: string; state: RootState }
>("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/cart");
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data.message || "Failed to fetch cart",
    );
  }
});

// 2. Add/Update Item
export const addToCartAsync = createAsyncThunk<
  void,
  { product_id: string; quantity: number; unit?: string },
  { rejectValue: string }
>(
  "cart/addToCart",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/api/cart", payload);
      // Fetch the updated cart from the backend to get the joined product details
      await dispatch(fetchCart() as any).unwrap();
    } catch (err) {
      const error = err as AxiosError<BackendError>;

      return rejectWithValue(
        error.response?.data.message || "Failed to add item"
      );
    }
  }
);

// 3. Remove Item
export const removeFromCartAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("cart/removeFromCart", async (cartItemId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/cart/${cartItemId}`);
    return cartItemId;
  } catch (err) {
    const error = err as AxiosError<BackendError>;
    return rejectWithValue(
      error.response?.data.message || "Failed to remove item",
    );
  }
});

// 4. Update Quantity
export const updateQuantityAsync = createAsyncThunk<
  void,
  { cartItemId: string; quantity: number },
  { rejectValue: string; state: RootState }
>(
  "cart/updateQuantity",
  async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await api.patch(`/api/cart/${cartItemId}/quantity`, { quantity });
      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

// --- THE SLICE ---

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.cartTotal = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("tb_guest_cart");
      }
    },
    hydrateGuestCart: (state) => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("tb_guest_cart");
          if (stored) {
            state.items = JSON.parse(stored);
            state.cartTotal = state.items.reduce(
              (total, item) => total + (item.product?.price || 0) * item.quantity,
              0,
            );
          }
        } catch (e) {
          console.error("Failed to load guest cart:", e);
        }
      }
    },
    mockAddToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.product_id === action.payload.product_id,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("tb_guest_cart", JSON.stringify(state.items));
      }
    },
    mockRemoveFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("tb_guest_cart", JSON.stringify(state.items));
      }
    },
    mockUpdateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("tb_guest_cart", JSON.stringify(state.items));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Item
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state) => {
        state.loading = false;
        // Items are updated by the subsequent fetchCart thunk
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove Item
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCart,
  hydrateGuestCart,
  mockAddToCart,
  mockRemoveFromCart,
  mockUpdateQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
