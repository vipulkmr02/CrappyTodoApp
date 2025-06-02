import express from "express";
import cors from "cors";
import { createTask, deleteTask, getTasks, Task, updateTask } from "./tasks";
import { EventEmitter } from "events";

const PORT = process.env.PORT || 8000;
const app = express();
const taskEmitter = new EventEmitter();

const headers = ["Content-Type", "Connection", "Cache-Control"];
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL!,
    "http://localhost:5173", // development url
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: headers,
  exposedHeaders: headers,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

// NOTE: API ENDPOINTS
// GET / => {message: "tasks api"}
// GET /tasks => {tasks: []}
// PUT /create => {message: "Task Created", "id": newTask.id}
// POST /update/:id => {message: "Task Updated" }
// DELETE /delete/:id => {message: "Task Deleted"}
// GET /tasksSub => websocket connection giving the task list when updated

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

app.get("/tasksSub", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const tasks = await getTasks();
  res.write(`data: ${JSON.stringify(tasks)}\n\n`);  // Initial write/send

  // Event listener for task updates
  taskEmitter.on("refresh", async () => {
    const updatedTasksJSON = JSON.stringify(await getTasks());
    console.log(updatedTasksJSON)
    res.write(`data: ${updatedTasksJSON}\n\n`);  // Initial write/send
  });

  // Client disconnect Handling
  req.on("close", () => {
    taskEmitter.removeAllListeners("refresh");
    res.end();
  });
});

app.post("/update/:id", (req, res) => {
  const taskId = req.params.id;
  updateTask(taskId, req.body.updatedValues).then(() => {
    res.status(200).json({ message: `Task with id ${taskId} updated` });
    taskEmitter.emit("refresh");
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
    taskEmitter.emit("refresh");
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
    taskEmitter.emit("refresh");
  }).catch((error) => {
    res.status(500).json({
      error: "Error deleting task: " + error.message,
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
