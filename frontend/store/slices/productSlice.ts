// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// // Matches your tile structure
// export interface Product {
//   id: string;          // uuid in your DB
//   name: string;
//   slug: string;
//   price: number;       // numeric in your DB
//   discount_price?: number;
//   category: string;
//   finish: string;      // This replaces the logic of parsing filenames
//   size: string;
//   image: string;       // CHANGED from 'img' to 'image' to match your table
//   is_active: boolean;
// }

// interface ProductState {
//   items: Product[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: ProductState = {
//   items: [],
//   loading: false,
//   error: null,
// };

// // ASYNC THUNK: This is where the magic happens
// export const fetchProducts = createAsyncThunk(
//   'products/fetchAll',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
//       if (!response.ok) throw new Error('Failed to fetch products');
//       return await response.json();
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         state.loading = false;
//         state.items = action.payload; // Your 600x600 and 600x1200 tiles are now in Redux
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export default productSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import api from '@/lib/axios';
import { RootState } from '../store'; // Adjust path to your store

interface ApiError {
  message: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock: number;
  category?: string;
  finish: string;
  size: string;
  thickness: string;
  material: string;
  image: string;
  is_active: boolean;
  is_coming_soon?: boolean;
  is_out_of_stock?: boolean;
  created_at?: string;
}

interface ProductState {
  items: Product[];
  currentProduct: Product | null; // For the Detail Page
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  currentProduct: null,
  loading: false,
  error: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- EXISTING THUNK ---
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (err) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

// --- NEW ADMIN THUNKS ---

export const fetchAdminProducts = createAsyncThunk<Product[], void, { state: RootState }>(
  'products/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/products');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin inventory');
    }
  }
);

// 1. Fetch Single Product (for /admin/products/[id])
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// 2. Add Product (Uses FormData for Image)
export const addProductAsync = createAsyncThunk<Product, FormData, { state: RootState }>(
  'products/add',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.product;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

// 3. Update Product (Uses FormData because image update is optional)
export const updateProductAsync = createAsyncThunk<Product, { id: string; data: FormData }, { state: RootState }>(
  'products/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.product;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// 4. Delete Product
export const deleteProductAsync = createAsyncThunk<string, string, { state: RootState }>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/products/${id}`);
      return id;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProductData: (state) => {
      state.items = [];
      state.currentProduct = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Single
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add Product
      .addCase(addProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // Add new item to start of list
      })
      .addCase(addProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Product
      .addCase(updateProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Admin Fetch Products
      .addCase(fetchAdminProducts.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Updates the items array with full inventory
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Product
      .addCase(deleteProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProduct, clearProductData } = productSlice.actions;
export default productSlice.reducer;