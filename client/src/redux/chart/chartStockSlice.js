import { createSlice } from '@reduxjs/toolkit';

export const stockSlice = createSlice({
    name: 'stock',
    initialState: {
        stock: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchStockStart: (state) => {
            state.status = 'loading';
        },
        fetchStockSuccess: (state, action) => {
            state.status = 'succeeded';
            state.stock = action.payload;
        },
        fetchStockFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchStockFailure, fetchStockStart, fetchStockSuccess } = stockSlice.actions;

export default stockSlice.reducer;

export const fetchStock = (id_barang, year) => async (dispatch) => {
    dispatch(fetchStockStart());
    try {
        const res = await fetch(`/api/stock-transactions/getyear?year=${year}&id_barang=${id_barang}`);
        if (!res.ok) {
            throw new Error('Failed to fetch stock transactions');
        }
        const data = await res.json();
        dispatch(fetchStockSuccess(data.stockTransactions));
    } catch (error) {
        dispatch(fetchStockFailure(error.message));
    }
};

export const selectStock = (state) => state.stock.stock;
