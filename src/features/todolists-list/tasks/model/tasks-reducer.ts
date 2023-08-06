import { TaskPriorities, TaskStatuses } from "common/api/common.api";
import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todosThunk } from "features/todolists-list/todolists/model/todolists-reducer";
import { clearTaskAndTodos, ClearTaskAndTodosType } from "common/actions/common.actions";
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError } from "common/utils";
import { todolistsAPI } from "features/todolists-list/todolists/api/todolist.api";
import { thunkTryCatch } from "common/utils/thunk-try-catch";
import {
    AddTaskArgType,
    TaskType,
    UpdateTaskArgType,
    UpdateTaskModelType,
} from "features/todolists-list/tasks/api/tasks.api.types";
import { taskApi } from "features/todolists-list/tasks/api/tasks.api";

const slice = createSlice({
    name: "tasks",
    initialState: {} as TasksStateType,
    reducers: {
        // removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
        //     let taskForCurrentTodos = state[action.payload.todolistId];
        //     const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
        //     if (index !== -1) taskForCurrentTodos.splice(index, 1);
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
            .addCase(removeTaskTC.fulfilled, (state, action) => {
                let taskForCurrentTodos = state[action.payload.todolistId];
                const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
                if (index !== -1) taskForCurrentTodos.splice(index, 1);
            })
            .addCase(updateTaskTC.fulfilled, (state, action) => {
                let taskForCurrentTodos = state[action.payload.todolistId];
                const index = taskForCurrentTodos.findIndex((tl) => tl.id === action.payload.taskId);
                if (index !== -1)
                    taskForCurrentTodos[index] = { ...taskForCurrentTodos[index], ...action.payload.domainModel };
            })
            .addCase(todosThunk.addTodolist.fulfilled, (state, action) => {
                // return { ...state, [action.todolist.id]: [] };
                state[action.payload.todolist.id] = [];
            })
            .addCase(todosThunk.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(todosThunk.fetchTodolists.fulfilled, (state, action) => {
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

enum ResultCode {
    success = 0,
    error = 1,
    captcha = 10,
}

// thunks

//создаем санку с помощью redux-toolkit

const fetchTasksTC = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>( //первый тип - возвращаемый. второй - принимаемый.
    "tasks/fetchTasksThunkCreator",
    async (todolistId, { dispatch, rejectWithValue }) => {
        // const { dispatch } = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await taskApi.getTasks(todolistId);
            const tasks = res.data.items;
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { tasks, todolistId };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

// export const removeTaskTC =
//     (taskId: string, todolistId: string): AppThunk =>
//     (dispatch) => {
//         todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
//             dispatch(tasksActions.removeTask({ taskId, todolistId }));
//         });
//     };

const removeTaskTC = createAppAsyncThunk<
    { taskId: string; todolistId: string },
    { taskId: string; todolistId: string }
>("tasks/removeTask", async ({ taskId, todolistId }) => {
    await taskApi.deleteTask(todolistId, taskId);
    return { taskId, todolistId };
});

const addTaskTC = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>("tasks/addTaskTC", async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
        const res = await taskApi.createTask(arg);
        if (res.data.resultCode === 0) {
            const task = res.data.data.item;
            return { task };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    });
});

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

            const res = await taskApi.updateTask(arg.todolistId, arg.taskId, apiModel);
            if (res.data.resultCode === ResultCode.success) {
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

export const tasksReducer = slice.reducer;

export const tasksActions = slice.actions;

export const tasksThunk = { fetchTasksTC, addTaskTC, updateTaskTC, removeTaskTC };

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
