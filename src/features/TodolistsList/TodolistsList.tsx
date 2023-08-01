import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootStateType } from "app/store";
import { FilterValuesType, TodolistDomainType, todosActions, todosThunk } from "./todolists-reducer";
import { TasksStateType, tasksThunk } from "./tasks-reducer";
import { TaskStatuses } from "common/api/common.api";
import { Grid, Paper } from "@mui/material";
import { Todolist } from "./Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "common/hooks/useAppDispatch";
import { AddItemForm } from "components/AddItemForm/AddItemForm";
import { selectIsLoggedIn } from "features/Login/auth.selector";
import { useActions } from "common/hooks";

type PropsType = {
    demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>((state) => state.todolists);
    const tasks = useSelector<AppRootStateType, TasksStateType>((state) => state.tasks);
    // const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const {
        removeTodolist: removeTodolistThunk,
        addTodolist: addTodolistThunk,
        fetchTodolists,
        changeTodolistTitle: changeTodolistTitleThunk,
    } = useActions(todosThunk);
    const { removeTaskTC, updateTaskTC, addTaskTC } = useActions(tasksThunk);
    const { changeTodolistFilter } = useActions(todosActions);

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        fetchTodolists();
    }, []);

    const removeTask = useCallback(function (taskId: string, todolistId: string) {
        removeTaskTC({ taskId, todolistId });
    }, []);

    const addTask = useCallback(function (title: string, todolistId: string) {
        addTaskTC({ title, todolistId });
    }, []);

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        updateTaskTC({ taskId, todolistId, domainModel: { status } });
    }, []);

    const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
        updateTaskTC({ taskId, todolistId, domainModel: { title } });
    }, []);

    const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
        changeTodolistFilter({ id, filter });
    }, []);

    const removeTodolist = useCallback(function (id: string) {
        removeTodolistThunk(id);
    }, []);

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        changeTodolistTitleThunk.fulfilled({ id, title }, "requestId", { title, id });
    }, []);

    const addTodolist = useCallback((title: string) => {
        addTodolistThunk(title);
    }, []);

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
