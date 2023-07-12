import { Dispatch } from "redux";
import { authAPI } from "api/todolists-api";
import { authActions } from "features/Login/auth-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";

const slice = createSlice({
    name: "app",
    initialState: {
        status: "idle" as RequestStatusType,
        error: null as null | string,
        isInitialized: false,
    },
    reducers: {
        setAppError: (state, action: PayloadAction<{ error: null | string }>) => {
            state.error = action.payload.error;
        },
        setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
            state.isInitialized = action.payload.isInitialized;
        },
        setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status;
        },
    },
});

export const appReducer = slice.reducer;
export const appActions = slice.actions;

// const initialState: InitialStateType = {
//     status: "idle",
//     error: null,
//     isInitialized: false,
// };

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType;
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null;
    // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
    isInitialized: boolean;
};

export const initializeAppTC = (): AppThunk => (dispatch) => {
    authAPI.me().then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
        } else {
        }

        dispatch(appActions.setAppInitialized({ isInitialized: true }));
    });
};

// export type SetAppErrorActionType = ReturnType<typeof appActions.setAppError>;
// export type SetAppStatusActionType = ReturnType<typeof appActions.setAppStatus>;
//
// type ActionsType = SetAppErrorActionType | SetAppStatusActionType | ReturnType<typeof setAppInitializedAC>;
