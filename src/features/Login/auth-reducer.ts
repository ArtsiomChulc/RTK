import { authAPI, LoginParamsType } from "../Login/auth.api";
import { createSlice } from "@reduxjs/toolkit";
import { appActions } from "app/app-reducer";
import { clearTaskAndTodos } from "common/actions/common.actions";
import { handleServerAppError } from "common/utils/handle-server-app-error";
import { createAppAsyncThunk } from "common/utils";

// вместо authReducer
const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
        // setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
        //     state.isLoggedIn = action.payload.isLoggedIn;
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(logOut.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            });
    },
});

// const initialState: InitialStateType = {
//     isLoggedIn: false,
// };
//
// export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case "login/SET-IS-LOGGED-IN":
//             return { ...state, isLoggedIn: action.value };
//         default:
//             return state;
//     }
// };
//
// // actions
//
// export const setIsLoggedInAC = (value: boolean) => ({ type: "login/SET-IS-LOGGED-IN", value }) as const;

// thunks
// export const loginTC =
//     (data: LoginParamsType): AppThunk =>
//     (dispatch) => {
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         authAPI
//             .login(data)
//             .then((res) => {
//                 if (res.data.resultCode === 0) {
//                     dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
//                     dispatch(appActions.setAppStatus({ status: "succeeded" }));
//                 } else {
//                     handleServerAppError(res.data, dispatch);
//                 }
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch);
//             });
//     };

const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>("auth/login", async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appActions.setAppStatus({ status: "loading" }));
    try {
        const res = await authAPI.login(arg);
        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { isLoggedIn: true };
        } else {
            handleServerAppError(res.data, dispatch, false);
            return rejectWithValue(res.data);
        }
    } catch (e: any) {
        handleServerAppError(e, dispatch);
        return rejectWithValue(null);
    }
});

const logOut = createAppAsyncThunk<{ isLoggedIn: boolean }, void>("auth/logOut", async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
        const res = await authAPI.logout();
        if (res.data.resultCode === 0) {
            // dispatch(tasksActions.clearTasks());
            // dispatch(todosActions.clearTodolists()); первый вариант решения проблемы с LogOut
            dispatch(clearTaskAndTodos({ tasks: {}, todolists: [] })); // второй вариант решения проблемы с LogOut
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { isLoggedIn: false };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    } catch (e: any) {
        handleServerAppError(e, dispatch);
        return rejectWithValue(null);
    }
});

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, void>("app/initializeApp", async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
        const res = await authAPI.me();
        if (res.data.resultCode === 0) {
            return { isLoggedIn: true };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    } catch (e: any) {
        return rejectWithValue(null);
    } finally {
        dispatch(appActions.setAppInitialized({ isInitialized: true }));
    }
});

// export const logoutTC = (): AppThunk => (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     authAPI
//         .logout()
//         .then((res) => {
//             if (res.data.resultCode === 0) {
//                 dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
//                 // dispatch(tasksActions.clearTasks());
//                 // dispatch(todosActions.clearTodolists()); первый вариант решения проблемы с LogOut
//                 dispatch(clearTaskAndTodos({ tasks: {}, todolists: [] })); // второй вариант решения проблемы с LogOut
//                 dispatch(appActions.setAppStatus({ status: "succeeded" }));
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch);
//         });
// };

export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunk = { login, logOut, initializeApp };

// types

// type ActionsType = ReturnType<typeof setIsLoggedIn>;
