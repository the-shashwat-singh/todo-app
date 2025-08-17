// server.js
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors()); // allow all origins (fine for demo)
app.use(express.json());

// Initialize SQLite
let db;
(async () => {
  db = await open({ filename: "./todos.db", driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
})();

// Routes (CRUD)
app.get("/tasks", async (_req, res) => {
  const tasks = await db.all("SELECT * FROM tasks ORDER BY id DESC");
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Text is required" });
  const result = await db.run("INSERT INTO tasks (text, completed) VALUES (?, ?)", [text.trim(), 0]);
  const created = await db.get("SELECT * FROM tasks WHERE id = ?", [result.lastID]);
  res.status(201).json(created);
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM tasks WHERE id = ?", [id]);
  res.sendStatus(204);
});

// Bonus: toggle completion
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const task = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
  if (!task) return res.sendStatus(404);
  const newCompleted = task.completed ? 0 : 1;
  await db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newCompleted, id]);
  const updated = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
  res.json(updated);
});

// Use PORT from env for hosting; fallback to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
