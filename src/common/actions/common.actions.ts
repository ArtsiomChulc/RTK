import { createAction } from "@reduxjs/toolkit";

export const clearTaskAndTodos = createAction<number | undefined>("common/clear-task-todolist");
