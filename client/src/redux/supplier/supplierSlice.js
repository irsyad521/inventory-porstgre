import { createSlice } from '@reduxjs/toolkit';

export const supplierSlice = createSlice({
    name: 'supplier',
    initialState: {
        suppliers: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchSuppliersStart: (state) => {
            state.status = 'loading';
        },
        fetchSuppliersSuccess: (state, action) => {
            state.status = 'succeeded';
            state.suppliers = action.payload;
        },
        fetchSuppliersFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchSuppliersStart, fetchSuppliersSuccess, fetchSuppliersFailure } = supplierSlice.actions;

export default supplierSlice.reducer;

export const fetchSuppliers = () => async (dispatch) => {
    dispatch(fetchSuppliersStart());
    try {
        const res = await fetch(`/api/supplier/get`);
        if (!res.ok) {
            throw new Error('Failed to fetch suppliers');
        }
        const data = await res.json();
        dispatch(fetchSuppliersSuccess(data.suppliers));
    } catch (error) {
        dispatch(fetchSuppliersFailure(error.message));
    }
};
