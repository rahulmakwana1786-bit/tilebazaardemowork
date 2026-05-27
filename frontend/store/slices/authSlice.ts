import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { AxiosError } from "axios";
export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  is_active?: boolean;
  role?: UserRole;
}
// const getInitialUser = () => {
//   if (typeof window !== "undefined") {
//     const saved = localStorage.getItem("user");
//     try {
//       return saved ? JSON.parse(saved) : null;
//     } catch { return null; }
//   }
//   return null;
// };

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}
interface LoginCredentials {
  email: string;
  password?: string; // Optional if you use it for forgot-pass too
}
interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? sessionStorage.getItem("token") || localStorage.getItem("token") : null,
  loading: false,
  error: null,
  isInitialized: false,
};

// Login Thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',

  async (userData: any, thunkAPI) => {

    try {

      const response = await api.post(
        '/api/auth/login',
        userData
      );

      return response.data;

    } catch (error: any) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        'Login failed'
      );
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  'auth/registerUser',

  async (userData: any, thunkAPI) => {

    try {

      const response = await api.post(
        '/api/auth/register',
        userData
      );

      return response.data;

    } catch (error: any) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        'Registration failed'
      );
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/profile");
      return response.data; // Should return { user: { id, name, email, etc } }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to load profile",
      );
    }
  },
);

interface UpdateProfilePayload {
  full_name?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const response = await api.patch("/api/auth/profile/edit", formData); // Matches your backend route
      return response.data.user;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== "undefined") {
          if (action.payload.user?.role === 'admin') {
            sessionStorage.setItem("token", action.payload.token);
            sessionStorage.setItem("user", JSON.stringify(action.payload.user));
          } else {
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || state.token;
        if (typeof window !== "undefined" && action.payload.token) {
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        // action.payload will be the message we returned from rejectWithValue
        state.error = action.payload as string;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload; // Update local state with fresh DB data
        state.loading = false;
      });
  },
});

export const { logout, clearError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
