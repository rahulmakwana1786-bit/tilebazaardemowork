import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { RootState } from '../store';
import api from '@/lib/axios';

interface ApiError {
  message: string;
}
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone_number: string | null;
  created_at: string;
  order_count?: number; 
  total_spend?: number; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders?: any[];
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export interface Inquiry {
  id: string;
  contact_name: string;
  company_name?: string;
  email: string;
  inquiry_type: string;
  area_sqm: number | null;
  message?: string;
  created_at: string;
}

interface AdminState {
  customers: User[];
  selectedUser: User | null;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  newsletter?: { items: any[]; total: number } | null;
  inquiries: Inquiry[];
}

const initialState: AdminState = {
  stats: null,
  customers: [],
  selectedUser: null,
  inquiries: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { state: RootState }>(
  'admin/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.get(`/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      // Fix: Cast the error to AxiosError with your ApiError interface
      const error = err as AxiosError<ApiError>;
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load stats'
      );
    }
  }
);

export const fetchAllCustomers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'admin/fetchAllCustomers',
  async (_, { rejectWithValue }) => {
    try {
      // Matches your route: router.get("/users", getAllUsers)
      const response = await api.get(`/api/admin/users`); 
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load customers'
      );
    }
  }
);

export const fetchUserDetails = createAsyncThunk<User, string, { rejectValue: string }>(
  'admin/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const fetchNewsletterSubscribers = createAsyncThunk<{items: any[], total: number}, {page: number, limit: number}, { rejectValue: string }>(
  'admin/fetchNewsletterSubscribers',
  async ({page, limit}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/newsletter?page=${page}&limit=${limit}`);
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load subscribers'
      );
    }
  }
);

export const fetchProjectInquiries = createAsyncThunk<Inquiry[], void, { rejectValue: string }>(
  'admin/fetchProjectInquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/inquiries');
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load inquiries'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminData: (state) => {
      state.stats = null;
      state.customers = [];
      state.selectedUser = null;
      state.inquiries = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { 
        // Only show skeleton on first load to speed up navigation
        if (!state.stats) {
          state.loading = true; 
        }
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllCustomers.pending, (state) => {
        // Only show skeleton if we have no customer data
        if (state.customers.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.selectedUser = null; // Clear old data while loading
    })
    .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.selectedUser = action.payload; // Now TypeScript is happy!
    })
    .addCase(fetchUserDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(fetchNewsletterSubscribers.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchNewsletterSubscribers.fulfilled, (state, action) => {
      state.loading = false;
      state.newsletter = action.payload;
    })
    .addCase(fetchNewsletterSubscribers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    .addCase(fetchProjectInquiries.pending, (state) => {
      if (state.inquiries.length === 0) {
        state.loading = true;
      }
      state.error = null;
    })
    .addCase(fetchProjectInquiries.fulfilled, (state, action) => {
      state.loading = false;
      state.inquiries = action.payload;
    })
    .addCase(fetchProjectInquiries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;