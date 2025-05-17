import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    completed: { type: Boolean, default: false },
}, { collection: "tasks" });

export const TaskModel = mongoose.model("tasks", taskSchema);