import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskStatusByUser: {}, // { [userId]: { [mediaId]: 'approved' | 'rejected' | 'pending' } }
  eligibleUsers: [],
  rejectedUsers: [],
  pendingUsers: [],
  loading: false,
  error: null
};

const mediaReviewSlice = createSlice({
  name: 'mediaReview',
  initialState,
  reducers: {
    // Start of API call
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // If API call fails
    hasError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Update status of a single task
    updateTaskStatus: (state, action) => {
      const { userId, mediaId, status } = action.payload;

      if (!userId || !mediaId || !status) {
        console.warn('Invalid updateTaskStatus payload:', action.payload);
        return;
      }

      // Initialize user's task status object if not exists
      if (!state.taskStatusByUser[userId]) {
        state.taskStatusByUser[userId] = {};
      }

      // Update the specific task status
      state.taskStatusByUser[userId][mediaId] = status;
      
      // Check if we should move the user between lists
      const userTasks = Object.values(state.taskStatusByUser[userId]);
      const user = state.pendingUsers.find(u => u._id === userId) || 
                   state.eligibleUsers.find(u => u._id === userId) || 
                   state.rejectedUsers.find(u => u._id === userId);

      if (user) {
        // If any task is rejected, move to rejected
        if (userTasks.some(task => task === 'rejected')) {
          state.rejectedUsers.push({ ...user, statusText: 'rejected' });
          state.pendingUsers = state.pendingUsers.filter(u => u._id !== userId);
          state.eligibleUsers = state.eligibleUsers.filter(u => u._id !== userId);
          delete state.taskStatusByUser[user._id];

          return;
        }

        // If all 10 tasks are approved, move to eligible
        if (userTasks.length === 10 && userTasks.every(task => task === 'approved')) {
          state.eligibleUsers.push({ ...user, statusText: 'accepted' });
          state.pendingUsers = state.pendingUsers.filter(u => u._id !== userId);
          state.rejectedUsers = state.rejectedUsers.filter(u => u._id !== userId);
          delete state.taskStatusByUser[user._id];

        }
      }
    },

    // Set all eligible users (for initial load)
    setEligibleUsers: (state, action) => {
      state.eligibleUsers = action.payload.map(user => ({
        _id: user._id, // ✅ Include this
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        luckyNumber: user.luckyNumber,
        statusText: 'accepted'
      }));
      state.loading = false;
    },
    

    // Set all rejected users (for initial load)
    setRejectedUsers: (state, action) => {
      state.rejectedUsers = action.payload.map(user => ({
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        luckyNumber: user.luckyNumber,
        statusText: 'rejected'
      }));
      state.loading = false;
    },

    // Set all pending users (for initial load)
    setPendingUsers: (state, action) => {
      state.pendingUsers = action.payload;
      state.loading = false;
      
      // Initialize task status tracking for new pending users
      action.payload.forEach(user => {
        if (!state.taskStatusByUser[user._id]) {
          state.taskStatusByUser[user._id] = {};
        }
      });
    },

    // Manually move a user to eligible (if needed)
    markUserEligible: (state, action) => {
      const user = action.payload;
      if (!state.eligibleUsers.some(u => u._id === user._id)) {
        state.eligibleUsers.push({ 
          ...user, 
          statusText: 'accepted' 
        });
      }
      state.pendingUsers = state.pendingUsers.filter(u => u._id !== user._id);
      state.rejectedUsers = state.rejectedUsers.filter(u => u._id !== user._id);
    },

    // Manually move a user to rejected (if needed)
    markUserRejected: (state, action) => {
      const user = action.payload;
      if (!state.rejectedUsers.some(u => u._id === user._id)) {
        state.rejectedUsers.push({ 
          ...user, 
          statusText: 'rejected' 
        });
      }
      state.pendingUsers = state.pendingUsers.filter(u => u._id !== user._id);
      state.eligibleUsers = state.eligibleUsers.filter(u => u._id !== user._id);
    },

    // Remove user from pending list
   // Remove user from pending list using _id instead of luckyNumber
removeUserFromPending: (state, action) => {
  console.log('Removing from pending:', action.payload);
  state.pendingUsers = state.pendingUsers.filter(user => user._id !== action.payload);
  console.log('Updated pending list:', state.pendingUsers);
 
},


    // Reset all task statuses for a user (if needed)
    resetUserTasks: (state, action) => {
      const userId = action.payload;
      if (state.taskStatusByUser[userId]) {
        state.taskStatusByUser[userId] = {};
      }
    }
  }
});

// Action creators
export const {
  startLoading,
  hasError,
  updateTaskStatus,
  setEligibleUsers,
  setRejectedUsers,
  setPendingUsers,
  markUserEligible,
  markUserRejected,
  removeUserFromPending,
  resetUserTasks
} = mediaReviewSlice.actions;

// Selectors
export const selectPendingUsers = (state) => state.mediaReview.pendingUsers;
export const selectEligibleUsers = (state) => state.mediaReview.eligibleUsers;
export const selectRejectedUsers = (state) => state.mediaReview.rejectedUsers;
export const selectUserTaskStatus = (userId) => (state) => 
  state.mediaReview.taskStatusByUser[userId] || {};
export const selectLoading = (state) => state.mediaReview.loading;
export const selectError = (state) => state.mediaReview.error;

export default mediaReviewSlice.reducer;