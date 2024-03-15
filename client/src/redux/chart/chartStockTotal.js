import { createSlice } from '@reduxjs/toolkit';

export const stockSlice = createSlice({
    name: 'stocktotal',
    initialState: {
        stocktotal: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchStockTotalStart: (state) => {
            state.status = 'loading';
        },
        fetchStockTotalSuccess: (state, action) => {
            state.status = 'succeeded';
            state.stocktotal = action.payload;
        },
        fetchStockTotalFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchStockTotalFailure, fetchStockTotalStart, fetchStockTotalSuccess } = stockSlice.actions;

export default stockSlice.reducer;

export const fetchStockTotal = (year) => async (dispatch) => {
    dispatch(fetchStockTotalStart());
    try {
        const res = await fetch(`/api/stock-transactions/getyear?year=${year}`);
        if (!res.ok) {
            throw new Error('Failed to fetch stock transactions');
        }
        const data = await res.json();
        dispatch(fetchStockTotalSuccess(data.stockTransactions));
    } catch (error) {
        dispatch(fetchStockTotalFailure(error.message));
    }
};

export const selectStockTotal = (state) => state.stock.stock;
