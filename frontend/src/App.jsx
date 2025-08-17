import { useState, useEffect } from "react";
import axios from "axios";

// Use env var if provided (for deployment), fallback to local dev
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/tasks`).then(res => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addTask = async () => {
    if (!text.trim()) return;
    const res = await axios.post(`${API_BASE}/tasks`, { text });
    setTasks([res.data, ...tasks]);
    setText("");
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTask = async (id) => {
    const res = await axios.patch(`${API_BASE}/tasks/${id}`);
    setTasks(tasks.map(t => (t.id === id ? res.data : t)));
  };

  return (
    <div style={{
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 24,
  background: "#e0f2fe"   // changed color
}}>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "black" }}>
  ✅ To-Do List
</h1>


      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
       <input
  value={text}
  onChange={e => setText(e.target.value)}
  placeholder="New task..."
  onKeyDown={(e) => e.key === "Enter" && addTask()}
  style={{
    border: "1px solid #d1d5db",
    padding: "8px 10px",
    borderRadius: 8,
    width: 260,
    background: "white",
    color: "black"    // ✅ makes typed text visible
  }}
/>

        <button onClick={addTask} style={{ background: "#2563eb", color: "white", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>
          Add
        </button>
      </div>

      {loading ? (
        <div>Loading tasks…</div>
      ) : (
        <ul style={{ width: 360, listStyle: "none", padding: 0 }}>
          {tasks.map(task => (
            <li key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: 12, marginBottom: 10, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
              <span
                onClick={() => toggleTask(task.id)}
                title="Click to toggle complete"
                style={{
                  cursor: "pointer",
                  textDecoration: task.completed ? "line-through" : "none",
                  color: task.completed ? "#6b7280" : "#111827"
                }}
              >
                {task.text}
              </span>
              <button onClick={() => deleteTask(task.id)} title="Delete" style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18 }}>
                🗑
              </button>
            </li>
          ))}
          {tasks.length === 0 && <li style={{ color: "#6b7280", textAlign: "center" }}>No tasks yet. Add one above!</li>}
        </ul>
      )}
    </div>
  );
}
