import { appActions, RequestStatusType } from "app/app-reducer";
import { AppThunk } from "app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTaskAndTodos } from "common/actions/common.actions";
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError } from "common/utils";
import { todolistsAPI, TodolistType, UpdateTodolistTitleArgType } from "features/TodolistsList/todolist.api";

const slice = createSlice({
    name: "todolist",
    initialState: [] as TodolistDomainType[],
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            //делаем мутабельно!!! (иммер) вместо фильтрации делаем вот так!!!!
            // по id находим индекс нашего элемента в массиве
            // затем с помощью splice по этому индексу удаляем один элемент
            const index = state.findIndex((todo) => todo.id === action.payload.id);
            if (index !== -1) state.splice(index, 1);
        },
        // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
        //     const newTodoList = {
        //         ...action.payload.todolist,
        //         filter: "all",
        //         entityStatus: "idle",
        //     } as TodolistDomainType;
        //     state.unshift(newTodoList);
        //     // draft.unshift({id: "id3", done: false, body: "Buy bananas"})
        //     // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];
        // },
        // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
        //     // return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl));
        //     // const index = draft.findIndex(todo => todo.id === "id1")
        //     // if (index !== -1) draft[index].done = true
        //     const index = state.findIndex((tl) => tl.id === action.payload.id);
        //     if (index !== -1) state[index].title = action.payload.title;
        // },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            // return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            if (index !== -1) state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
            // return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));
            const index = state.findIndex((tl) => tl.id === action.payload.id);
            if (index !== -1) state[index].entityStatus = action.payload.status;
        },
        setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
            // return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
            return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(clearTaskAndTodos, (state, action) => {
                //третий вариант решения проблемы с LogOut
                return action.payload.todolists;
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                const newTodoList = {
                    ...action.payload.todolist,
                    filter: "all",
                    entityStatus: "idle",
                } as TodolistDomainType;
                state.unshift(newTodoList);
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const index = state.findIndex((tl) => tl.id === action.payload.id);
                if (index !== -1) state[index].title = action.payload.title;
            });
    },
});

// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }));
        todolistsAPI
            .getTodolists()
            .then((res) => {
                dispatch(todosActions.setTodolists({ todolists: res.data }));
                dispatch(appActions.setAppStatus({ status: "succeeded" }));
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            });
    };
};
export const removeTodolistTC = (id: string): AppThunk => {
    return (dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appActions.setAppStatus({ status: "loading" }));
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(todosActions.changeTodolistEntityStatus({ status: "loading", id }));
        todolistsAPI.deleteTodolist(id).then((res) => {
            dispatch(todosActions.removeTodolist({ id }));
            //скажем глобально приложению, что асинхронная операция завершена
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
        });
    };
};
// export const addTodolistTC = (title: string): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         todolistsAPI.createTodolist(title).then((res) => {
//             dispatch(todosActions.addTodolist({ todolist: res.data.data.item }));
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//         });
//     };
// };

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
    "todolist/addTodolist",
    async (title, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await todolistsAPI.createTodolist(title);
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { todolist: res.data.data.item };
        } catch (e: any) {
            handleServerAppError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

const changeTodolistTitle = createAppAsyncThunk<UpdateTodolistTitleArgType, UpdateTodolistTitleArgType>(
    "todolist/changeTodolistTitle",
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        const res = await todolistsAPI.updateTodolist(arg.id, arg.title);
        return arg;
    },
);

// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//     return (dispatch) => {
//         todolistsAPI.updateTodolist(id, title).then((res) => {
//             dispatch(todosActions.changeTodolistTitle({ id, title }));
//         });
//     };
// };

export const todolistsReducer = slice.reducer;

export const todosActions = slice.actions;

export const todosThunk = { addTodolist, changeTodolistTitle };

// types

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};
