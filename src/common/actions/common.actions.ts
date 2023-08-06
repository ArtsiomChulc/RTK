import { createAction } from "@reduxjs/toolkit";
import { TasksStateType } from "features/todolists-list/tasks/model/tasks-reducer";
import { TodolistDomainType } from "features/todolists-list/todolists/model/todolists-reducer";

export type ClearTaskAndTodosType = {
    tasks: TasksStateType; //третий вариант решения проблемы с LogOut
    todolists: [];
};

export const clearTaskAndTodos = createAction<ClearTaskAndTodosType>("common/clear-task-todolist");
