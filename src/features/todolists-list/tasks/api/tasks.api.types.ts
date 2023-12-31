import { TaskPriorities, TaskStatuses } from "common/api/common.api";
import { UpdateDomainTaskModelType } from "features/todolists-list/tasks/model/tasks-reducer";

// types

export type TaskType = {
    description: string;
    title: string;
    status: TaskStatuses;
    priority: TaskPriorities;
    startDate: string;
    deadline: string;
    id: string;
    todoListId: string;
    order: number;
    addedDate: string;
};
export type UpdateTaskModelType = {
    title: string;
    description: string;
    status: TaskStatuses;
    priority: TaskPriorities;
    startDate: string;
    deadline: string;
};
export type GetTasksResponse = {
    error: string | null;
    totalCount: number;
    items: TaskType[];
};
export type AddTaskArgType = {
    todolistId: string;
    title: string;
};
export type UpdateTaskArgType = {
    taskId: string;
    domainModel: UpdateDomainTaskModelType;
    todolistId: string;
};
