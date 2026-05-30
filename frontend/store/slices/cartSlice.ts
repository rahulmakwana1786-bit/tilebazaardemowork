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
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  product?: ProductDetails;
  sqm?: number;
  boxes?: number;
  tiles?: number;
  weight?: number;
  palletType?: string;
  deliveryCharge?: number;
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
  {
    product_id: string;
    quantity: number;
    sqm?: number;
    boxes?: number;
    tiles?: number;
    weight?: number;
    palletType?: string;
  },
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
  { cartItemId: string; quantity: number; sqm?: number; boxes?: number; tiles?: number; weight?: number; palletType?: string },
  { rejectValue: string; state: RootState }
>(
  "cart/updateQuantity",
  async ({ cartItemId, quantity, sqm, boxes, tiles, weight, palletType }, { dispatch, rejectWithValue }) => {
    try {
      await api.patch(`/api/cart/${cartItemId}/quantity`, { quantity, sqm, boxes, tiles, weight, palletType });
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
    },
    mockAddToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.product_id === action.payload.product_id,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        if (action.payload.sqm) existingItem.sqm = (existingItem.sqm || 0) + action.payload.sqm;
        if (action.payload.boxes) existingItem.boxes = (existingItem.boxes || 0) + action.payload.boxes;
        if (action.payload.weight) existingItem.weight = (existingItem.weight || 0) + action.payload.weight;
        if (action.payload.tiles) existingItem.tiles = (existingItem.tiles || 0) + action.payload.tiles;
        if (action.payload.palletType) existingItem.palletType = action.payload.palletType;
      } else {
        state.items.push(action.payload);
      }
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
    },
    mockRemoveFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
    },
    mockUpdateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number; sqm?: number; boxes?: number; tiles?: number; weight?: number; palletType?: string }>,
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (action.payload.sqm !== undefined) item.sqm = action.payload.sqm;
        if (action.payload.boxes !== undefined) item.boxes = action.payload.boxes;
        if (action.payload.tiles !== undefined) item.tiles = action.payload.tiles;
        if (action.payload.weight !== undefined) item.weight = action.payload.weight;
        if (action.payload.palletType !== undefined) item.palletType = action.payload.palletType;
      }
      state.cartTotal = state.items.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
      );
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
  mockAddToCart,
  mockRemoveFromCart,
  mockUpdateQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
