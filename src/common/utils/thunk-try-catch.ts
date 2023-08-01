import { AppDispatch, AppRootStateType } from "app/store";
import { handleServerNetworkError } from "common/utils/handle-server-network-error";
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { ResponseType } from "common/types";
import { appActions } from "app/app-reducer";

/**
 * Оборачивает логику, выполненную в thunk, в try-catch блок и устанавливает соответствующее состояние приложения.
 * @template T
 * @param {BaseThunkAPI<AppRootStateType, any, AppDispatch, null | ResponseType>} thunkAPI - Объект с функциями диспетчера и rejectWithValue для redux-thunk.
 * @param {()=>Promise<T>} logic - Логика, которую нужно выполнить в try-catch блоке.
 * @returns {Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>>} - Результат выполнения логики или значение rejectWithValue в случае ошибки.
 */

export const thunkTryCatch = async <T>(
    thunkAPI: BaseThunkAPI<AppRootStateType, any, AppDispatch, null | ResponseType>,
    logic: () => Promise<T>,
): Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>> => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appActions.setAppStatus({ status: "loading" }));
    try {
        return await logic();
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
    } finally {
        dispatch(appActions.setAppStatus({ status: "idle" }));
    }
};
