import { createSlice } from '@reduxjs/toolkit';

export const stockTransactionSlice = createSlice({
    name: 'stockTransaction',
    initialState: {
        stockTransactions: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchStockTransactionsStart: (state) => {
            state.status = 'loading';
        },
        fetchStockTransactionsSuccess: (state, action) => {
            state.status = 'succeeded';
            state.stockTransactions = action.payload;
        },
        fetchStockTransactionsFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchStockTransactionsStart, fetchStockTransactionsSuccess, fetchStockTransactionsFailure } =
    stockTransactionSlice.actions;

export default stockTransactionSlice.reducer;

export const fetchStockTransactionsYear = (id_barang, year) => async (dispatch) => {
    dispatch(fetchStockTransactionsStart());
    try {
        const res = await fetch(`/api/stock-transactions/getyear?year=${year}&id_barang=${id_barang}`);
        if (!res.ok) {
            throw new Error('Failed to fetch stock transactions');
        }
        const data = await res.json();
        dispatch(fetchStockTransactionsSuccess(data.stockTransactions));
    } catch (error) {
        dispatch(fetchStockTransactionsFailure(error.message));
    }
};

export const fetchStockTransactions =
    (id_barang = '') =>
    async (dispatch) => {
        dispatch(fetchStockTransactionsStart());
        try {
            let url = '/api/stock-transactions/get';
            if (id_barang !== '') {
                url += `?id_barang=${id_barang}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch stock transactions');
            }
            const data = await res.json();
            dispatch(fetchStockTransactionsSuccess(data.stockTransactions));
        } catch (error) {
            dispatch(fetchStockTransactionsFailure(error.message));
        }
    };

export const selectStockTransactions = (state) => state.stockTransaction.stockTransactions;
