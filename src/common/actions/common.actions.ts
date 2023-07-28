import { createAction } from "@reduxjs/toolkit";
import { TasksStateType } from "features/TodolistsList/tasks-reducer";
import { TodolistDomainType } from "features/TodolistsList/todolists-reducer";

export type ClearTaskAndTodosType = {
    tasks: TasksStateType; //третий вариант решения проблемы с LogOut
    todolists: [];
};

export const clearTaskAndTodos = createAction<ClearTaskAndTodosType>("common/clear-task-todolist");
