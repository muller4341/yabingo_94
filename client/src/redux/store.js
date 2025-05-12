import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { persistStore } from 'redux-persist';
import themeReducer from "./theme/themeSlice";
import mediaReducer from "./media/mediaSlice";
import mediaReviewReducer from "./mediaReview/mediaReviewSlice"



const rootReducer = combineReducers({
    user: userReducer,
    theme: themeReducer,
    media: mediaReducer,
    mediaReview: mediaReviewReducer,
    // other reducers go here
});
const persistConfig = {
    key: 'root',
    storage,
    version: 1, 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);



export const store = configureStore({

    reducer:persistedReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: false,
        }),

});



export const persistor = persistStore(store);   //persistor to store a current states to local  storage



