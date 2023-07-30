import {
    AddTaskArgType,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskArgType,
    UpdateTaskModelType,
} from "api/todolists-api";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todosActions } from "features/TodolistsList/todolists-reducer";
import { clearTaskAndTodos, ClearTaskAndTodosType } from "common/actions/common.actions";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";

const slice = createSlice({
    name: "tasks",
    initialState: {} as TasksStateType,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
            // return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
            let taskForCurrentTodos = state[action.payload.todolistId];
            const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
            if (index !== -1) taskForCurrentTodos.splice(index, 1);
        },
        // addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
        //     // return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] };
        //     let taskForCurrentTodos = state[action.payload.task.todoListId] as TaskType[];
        //     taskForCurrentTodos.unshift(action.payload.task);
        // },
        // updateTask: (
        //     state,
        //     action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
        // ) => {
        //     // return {...state, [action.todolistId]: state[action.todolistId].map((t) =>
        //     //         t.id === action.taskId ? { ...t, ...action.model } : t,
        //     //     ),
        //     // };
        //     let taskForCurrentTodos = state[action.payload.todolistId];
        //     const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
        //     if (index !== -1) taskForCurrentTodos[index] = { ...taskForCurrentTodos[index], ...action.payload.model };
        // },
        // setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
        //     // return { ...state, [action.todolistId]: action.tasks };
        //     state[action.payload.todolistId] = action.payload.tasks;
        // },
        // clearTasks: () => {
        //     return {};       первый вариант решения проблемы с LogOut
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksTC.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks;
            })
            .addCase(addTaskTC.fulfilled, (state, action) => {
                let taskForCurrentTodos = state[action.payload.task.todoListId] as TaskType[];
                taskForCurrentTodos.unshift(action.payload.task);
            })
            .addCase(updateTaskTC.fulfilled, (state, action) => {
                let taskForCurrentTodos = state[action.payload.todolistId];
                const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
                if (index !== -1)
                    taskForCurrentTodos[index] = { ...taskForCurrentTodos[index], ...action.payload.domainModel };
            })
            .addCase(todosActions.addTodolist, (state, action) => {
                // return { ...state, [action.todolist.id]: [] };
                state[action.payload.todolist.id] = [];
            })
            .addCase(todosActions.removeTodolist, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(todosActions.setTodolists, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = [];
                });
            })
            // .addCase(clearTaskAndTodos.type, () => {
            //     return {};    второй вариант решения проблемы с LogOut
            // });
            .addCase(clearTaskAndTodos.type, (state, action: PayloadAction<ClearTaskAndTodosType>) => {
                return action.payload.tasks; //третий вариант решения проблемы с LogOut
            });
    },
});

// thunks

//создаем санку с помощью redux-toolkit

const fetchTasksTC = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>( //первый тип - возвращаемый. второй - принимаемый.
    "tasks/fetchTasksThunkCreator",
    async (todolistId, { dispatch, rejectWithValue }) => {
        // const { dispatch } = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await todolistsAPI.getTasks(todolistId);
            const tasks = res.data.items;
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { tasks, todolistId };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

// export const fetchTasksTC =
//     (todolistId: string): AppThunk =>
//     (dispatch) => {
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         todolistsAPI.getTasks(todolistId).then((res) => {
//             const tasks = res.data.items;
//             dispatch(tasksActions.setTasks({ tasks, todolistId }));
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//         });
//     };

export const removeTaskTC =
    (taskId: string, todolistId: string): AppThunk =>
    (dispatch) => {
        todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
            const action = tasksActions.removeTask({ taskId, todolistId });
            dispatch(action);
        });
    };

const addTaskTC = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>(
    "tasks/addTaskTC",
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await todolistsAPI.createTask(arg);
            if (res.data.resultCode === 0) {
                const task = res.data.data.item;
                dispatch(appActions.setAppStatus({ status: "succeeded" }));
                return { task };
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

// const addTaskTC =
//     (title: string, todolistId: string): AppThunk =>
//     (dispatch) => {
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         todolistsAPI
//             .createTask(todolistId, title)
//             .then((res) => {
//                 if (res.data.resultCode === 0) {
//                     const task = res.data.data.item;
//                     const action = tasksActions.addTask({ task });
//                     dispatch(action);
//                     dispatch(appActions.setAppStatus({ status: "succeeded" }));
//                 } else {
//                     handleServerAppError(res.data, dispatch);
//                 }
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch);
//             });
//     };

const updateTaskTC = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
    "tasks/updateTaskTS",
    async (arg, { dispatch, rejectWithValue, getState }) => {
        try {
            const state = getState();
            const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn("task not found in the state");
                return rejectWithValue(null);
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...arg.domainModel,
            };

            const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel);
            if (res.data.resultCode === 0) {
                return arg;
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

// export const _updateTaskTC =
//     (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
//     (dispatch, getState: () => AppRootStateType) => {
//         const state = getState();
//         const task = state.tasks[todolistId].find((t) => t.id === taskId);
//         if (!task) {
//             //throw new Error("task not found in the state");
//             console.warn("task not found in the state");
//             return;
//         }
//
//         const apiModel: UpdateTaskModelType = {
//             deadline: task.deadline,
//             description: task.description,
//             priority: task.priority,
//             startDate: task.startDate,
//             title: task.title,
//             status: task.status,
//             ...domainModel,
//         };
//
//         todolistsAPI
//             .updateTask(todolistId, taskId, apiModel)
//             .then((res) => {
//                 if (res.data.resultCode === 0) {
//                     const action = tasksThunk.updateTaskTC({ taskId, todolistId, domainModel });
//                     dispatch(action);
//                 } else {
//                     handleServerAppError(res.data, dispatch);
//                 }
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch);
//             });
//     };

export const tasksReducer = slice.reducer;

export const tasksActions = slice.actions;

export const tasksThunk = { fetchTasksTC, addTaskTC, updateTaskTC };

// types
export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};
