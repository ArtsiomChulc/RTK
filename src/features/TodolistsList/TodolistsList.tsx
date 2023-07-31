import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import {
    fetchTodolistsTC,
    FilterValuesType,
    removeTodolistTC,
    TodolistDomainType,
    todosActions,
    todosThunk,
} from "./todolists-reducer";
import { TasksStateType, tasksThunk } from "./tasks-reducer";
import { TaskStatuses } from "common/api/common.api";
import { Grid, Paper } from "@mui/material";
import { Todolist } from "./Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "common/hooks/useAppDispatch";
import { AddItemForm } from "components/AddItemForm/AddItemForm";
import { selectIsLoggedIn } from "features/Login/auth.selector";

type PropsType = {
    demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>((state) => state.todolists);
    const tasks = useSelector<AppRootStateType, TasksStateType>((state) => state.tasks);
    // const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        const thunk = fetchTodolistsTC();
        dispatch(thunk);
    }, []);

    const removeTask = useCallback(function (taskId: string, todolistId: string) {
        const thunk = tasksThunk.removeTaskTC({ taskId, todolistId });
        dispatch(thunk);
    }, []);

    const addTask = useCallback(function (title: string, todolistId: string) {
        dispatch(tasksThunk.addTaskTC({ title, todolistId }));
    }, []);

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        dispatch(tasksThunk.updateTaskTC({ taskId, todolistId, domainModel: { status } }));
    }, []);

    const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
        dispatch(tasksThunk.updateTaskTC({ taskId, todolistId, domainModel: { title } }));
    }, []);

    const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
        const action = todosActions.changeTodolistFilter({ id, filter });
        dispatch(action);
    }, []);

    const removeTodolist = useCallback(function (id: string) {
        const thunk = removeTodolistTC(id);
        dispatch(thunk);
    }, []);

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        dispatch(todosThunk.changeTodolistTitle.fulfilled({ id, title }, "requestId", { title, id }));
    }, []);

    const addTodolist = useCallback(
        (title: string) => {
            dispatch(todosThunk.addTodolist(title));
        },
        [dispatch],
    );

    if (!isLoggedIn) {
        return <Navigate to={"/login"} />;
    }

    return (
        <>
            <Grid container style={{ padding: "20px" }}>
                <AddItemForm addItem={addTodolist} />
            </Grid>
            <Grid container spacing={3}>
                {todolists.map((tl) => {
                    let allTodolistTasks = tasks[tl.id];

                    return (
                        <Grid item key={tl.id}>
                            <Paper style={{ padding: "10px" }}>
                                <Todolist
                                    todolist={tl}
                                    tasks={allTodolistTasks}
                                    removeTask={removeTask}
                                    changeFilter={changeFilter}
                                    addTask={addTask}
                                    changeTaskStatus={changeStatus}
                                    removeTodolist={removeTodolist}
                                    changeTaskTitle={changeTaskTitle}
                                    changeTodolistTitle={changeTodolistTitle}
                                    demo={demo}
                                />
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};
