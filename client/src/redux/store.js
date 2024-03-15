import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import themeReducer from './theme/themeSlice.js';
import supplierReducer from './supplier/supplierSlice.js';
import itemReducer from './item/itemSlice.js';
import stockTransactionReducer from './chart/chartHistorySlice.js';
import stockReducer from './chart/chartStockSlice.js';
import userReducer from './user/userSlice.js';
import userDataReducer from './user/userDataSlice.js';
import stocktotalReducer from './chart/chartStockTotal.js';

const rootReducer = combineReducers({
    theme: themeReducer,
    supplier: supplierReducer,
    item: itemReducer,
    stockTransaction: stockTransactionReducer,
    stock: stockReducer,
    stocktotal: stocktotalReducer,
    user: userReducer,
    userdata: userDataReducer,
});

const persistConfig = {
    key: 'root',
    storage,
    version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
