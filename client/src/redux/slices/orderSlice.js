import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper function for fetch requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};

// Async thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth('/api/orders');
            return data.data;
        } catch (error) {
            return rejectWithValue({ error: error.message });
        }
    }
);

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth('/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return data.data;
        } catch (error) {
            return rejectWithValue({ error: error.message });
        }
    }
);

export const reviewOrder = createAsyncThunk(
    'orders/reviewOrder',
    async ({ orderId, comments }, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth(`/api/orders/${orderId}/review`, {
                method: 'PUT',
                body: JSON.stringify({ comments })
            });
            return data.data;
        } catch (error) {
            return rejectWithValue({ error: error.message });
        }
    }
);

export const approveOrder = createAsyncThunk(
    'orders/approveOrder',
    async ({ orderId, approved, comments }, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth(`/api/orders/${orderId}/approve`, {
                method: 'PUT',
                body: JSON.stringify({ approved, comments })
            });
            return data.data;
        } catch (error) {
            return rejectWithValue({ error: error.message });
        }
    }
);

export const processPayment = createAsyncThunk(
    'orders/processPayment',
    async ({ orderId, paymentMethod, transactionId }, { rejectWithValue }) => {
        try {
            const data = await fetchWithAuth(`/api/orders/${orderId}/payment`, {
                method: 'PUT',
                body: JSON.stringify({
                    paymentMethod,
                    transactionId
                })
            });
            return data.data;
        } catch (error) {
            return rejectWithValue({ error: error.message });
        }
    }
);

const initialState = {
    orders: [],
    loading: false,
    error: null,
    currentOrder: null
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to fetch orders';
            })
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.unshift(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to create order';
            })
            // Review Order
            .addCase(reviewOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reviewOrder.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(reviewOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to review order';
            })
            // Approve Order
            .addCase(approveOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveOrder.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(approveOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to approve order';
            })
            // Process Payment
            .addCase(processPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processPayment.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(processPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to process payment';
            });
    }
});

export const { clearError, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer; 