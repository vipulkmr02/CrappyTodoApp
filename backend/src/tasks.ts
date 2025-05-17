import { connect, Types } from "mongoose";
import { TaskModel } from "./models";
import { env } from "process";

console.log("DEBUG:", env.DB_URL!);
connect(env.DB_URL!).catch((err) => {});

export interface Task {
    id?: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface TaskList {
    tasks: Task[];
}

export const createTask = (
    title: string,
    description: string,
): Promise<Types.ObjectId> => {
    const taskBody = {
        title,
        description,
        completed: false,
    };
    const newTask = new TaskModel(taskBody);
    return newTask.save().then((x) => x._id);
};

export const updateTask = (
    id: string,
    updatedValues: Partial<Task>,
): Promise<Partial<Task>> => {
    return TaskModel.findByIdAndUpdate(id, updatedValues, { new: true })
        .then((updatedTask) => {
            if (!updatedTask) {
                throw new Error("Task not found");
            }
            return updatedValues;
        });
};

export const deleteTask = (id: string): Promise<1> => {
    return TaskModel.deleteOne({ _id: id }).then((deletedTask) => {
        if (deletedTask.deletedCount !== 1) {
            throw new Error("Task not found");
        }
        return deletedTask.deletedCount;
    });
};

export const getTasks = (): Promise<TaskList> => {
    return TaskModel.find().then((tasks) => ({
        tasks: tasks.map((task) => ({
            _id: task._id,
            title: task.title || "",
            description: task.description || "",
            completed: task.completed,
        })),
    })).catch((error) => {
        throw new Error("Error fetching tasks: " + error.message);
    });
};
