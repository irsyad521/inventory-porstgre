import { createSlice } from '@reduxjs/toolkit';

export const userDataSlice = createSlice({
    name: 'userdata',
    initialState: {
        userdata: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        fetchUserStart: (state) => {
            state.status = 'loading';
        },
        fetchUserSuccess: (state, action) => {
            state.status = 'succeeded';
            state.userdata = action.payload;
        },
        fetchUserFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { fetchUserFailure, fetchUserStart, fetchUserSuccess } = userDataSlice.actions;

export default userDataSlice.reducer;

export const fetchUsers = () => async (dispatch) => {
    dispatch(fetchUserStart());
    try {
        const res = await fetch(`/api/user/getUsers`);

        if (!res.ok) {
            throw new Error('Failed to fetch suppliers');
        }
        const data = await res.json();
        dispatch(fetchUserSuccess(data.users));
    } catch (error) {
        dispatch(fetchUserFailure(error.message));
    }
};
