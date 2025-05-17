import express from "express";
import cors from "cors";
import { createTask, deleteTask, getTasks, Task, updateTask } from "./tasks";
import { log } from "console";

const PORT = process.env.PORT || 3000;
const app = express();

const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 200,
}

app.use(express.json());
app.use(cors(corsOptions));

// API ENDPOINTS
// GET / => {message: "tasks api"}
// GET /tasks => {tasks: []}
// PUT /create => {message: "Task Created", "id": newTask.id}
// POST /update/:id => {message: "Task Updated" }
// DELETE /delete/:id => {message: "Task Deleted"}

app.get("/", (req, res) => {
    res.json({ message: "crappy_todo_app api" });
});

app.get("/tasks", (req, res) => {
    getTasks().then((tasks) => {
        res.json(tasks);
    }).catch((error) => {
        res.status(500).json({
            error: "Error fetching tasks: " + error.message,
        });
    });
});

app.post("/update/:id", (req, res) => {
    const taskId = req.params.id;
    updateTask(taskId, req.body.updatedValues).then(() => {
        res.status(200).json({ message: `Task with id ${taskId} updated` });
    }).catch((error) => {
        res.status(500).json({
            error: "Error updating task: " + error.message,
        });
    });
});

app.put("/create", (req, res) => {
    const { title, description } = req.body;
    createTask(title, description).then((newTaskId) => {
        res.status(201).json({ message: "Task Created", id: newTaskId });
    }).catch((error) => {
        res.status(500).json({
            error: "Error creating task: " + error.message,
        });
    });
});

app.delete("/delete/:id", (req, res) => {
    const taskId = req.params.id;
    deleteTask(taskId).then(() => {
        res.json({ message: `Task with id ${taskId} deleted` });
    }).catch((error) => {
        res.status(500).json({
            error: "Error deleting task: " + error.message,
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
