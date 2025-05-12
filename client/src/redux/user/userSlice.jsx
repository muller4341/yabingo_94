import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false,
    error: null
};

const userSlice = createSlice({

 name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
        },
        signInFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        updateStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
            state.error = null; 
        },
        
        updateFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state) => {
            state.loading = false;
            state.currentUser = null;
            state.error = null;
        
        },
        deleteUserFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOutSuccess: (state) => {
            state.currentUser = null;
            state.error = null;
            state.loading = false;
        }   
        
    }

});

export const { signInStart, signInSuccess, signInFail,updateStart,
    updateSuccess,updateFail, deleteUserStart, deleteUserFail,
     deleteUserSuccess, signOutSuccess} = userSlice.actions;

export default userSlice.reducer;