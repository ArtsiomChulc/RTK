import { authAPI, LoginParamsType } from "../Login/auth.api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";
import { clearTaskAndTodos } from "common/actions/common.actions";
import { handleServerAppError } from "common/utils/handle-server-app-error";
import { handleServerNetworkError } from "common/utils/handle-server-network-error";

// вместо authReducer
const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn;
        },
    },
});

export const authReducer = slice.reducer;
// export const { setIsLoggedIn } = slice.actions;
export const authActions = slice.actions;
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
export const loginTC =
    (data: LoginParamsType): AppThunk =>
    (dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }));
        authAPI
            .login(data)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
                    dispatch(appActions.setAppStatus({ status: "succeeded" }));
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            });
    };
export const logoutTC = (): AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    authAPI
        .logout()
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
                // dispatch(tasksActions.clearTasks());
                // dispatch(todosActions.clearTodolists()); первый вариант решения проблемы с LogOut
                dispatch(clearTaskAndTodos({ tasks: {}, todolists: [] })); // второй вариант решения проблемы с LogOut
                dispatch(appActions.setAppStatus({ status: "succeeded" }));
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch);
        });
};

// types

// type ActionsType = ReturnType<typeof setIsLoggedIn>;
