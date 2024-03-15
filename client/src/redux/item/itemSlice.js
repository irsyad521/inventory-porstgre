import { createSlice } from '@reduxjs/toolkit';

export const itemSlice = createSlice({
    name: 'item',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchItemsStart: (state) => {
            state.status = 'loading';
        },
        fetchItemsSuccess: (state, action) => {
            state.status = 'succeeded';
            state.items = action.payload;
        },
        fetchItemsFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchItemsStart, fetchItemsSuccess, fetchItemsFailure } = itemSlice.actions;

export default itemSlice.reducer;

export const fetchItems = () => async (dispatch) => {
    dispatch(fetchItemsStart());
    try {
        const res = await fetch(`/api/items/get`);
        if (!res.ok) {
            throw new Error('Failed to fetch items');
        }
        const data = await res.json();
        dispatch(fetchItemsSuccess(data.items));
    } catch (error) {
        dispatch(fetchItemsFailure(error.message));
    }
};
