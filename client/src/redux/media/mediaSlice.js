import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadedSlugsByUser: {}  // ✅ this must exist!
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    markAsUploaded: (state, action) => {
      const { userId, slug } = action.payload;

      if (!userId || !slug) {
        console.warn('Invalid payload to markAsUploaded:', action.payload);
        return;
      }

      if (!state.uploadedSlugsByUser) {
        state.uploadedSlugsByUser = {}; // ✅ fix: guard this!
      }

      if (!state.uploadedSlugsByUser[userId]) {
        state.uploadedSlugsByUser[userId] = [];
      }

      if (!state.uploadedSlugsByUser[userId].includes(slug)) {
        state.uploadedSlugsByUser[userId].push(slug);
      }
    },
    setUploadedSlugs: (state, action) => {
      const { userId, slugs } = action.payload;
      state.uploadedSlugsByUser[userId] = slugs;
    }
    
  }
});

export const { markAsUploaded, setUploadedSlugs } = mediaSlice.actions;
export default mediaSlice.reducer;
