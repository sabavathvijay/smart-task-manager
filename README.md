## Smart Task Manager

A small, beginner-friendly web app for managing daily tasks with due dates, priorities, and smart suggestions.  
All data is stored in the browser using `localStorage`, so your tasks persist across page refreshes.

## Features

- **Add tasks**: Enter a task name and click **Add Task** or press **Enter**.
- **Due dates**: Optional **Due Date** field using a date picker; tasks show a subtle `(due YYYY-MM-DD)` label.
- **Priorities**: Choose **High**, **Medium**, or **Low**; tasks display a small colored priority pill.
- **Smart suggestions**: **Suggest Tasks** button adds three helpful daily tasks (no duplicates).
- **Completion & delete**:
  - Click a task to toggle **completed** (with strike‑through).
  - Click the **✕** button on the right to delete a task.
- **Overdue highlight**: Incomplete tasks past their due date are gently highlighted in red.
- **Filters**:
  - **All** – show every task
  - **Today** – tasks due today
  - **Completed** – finished tasks only
  - **Pending** – only tasks not completed
  - **High Priority** – only tasks marked High
- **Sorting**: Among visible tasks, incomplete ones appear first; within each group, tasks are ordered by priority (High → Medium → Low).
- **Data persistence & migration**:
  - Tasks are stored in `localStorage` as rich objects.
  - On load, older saved tasks are automatically upgraded to the latest structure.

## Tech Stack

- **HTML** – `index.html`
- **CSS** – `style.css`
- **JavaScript** – `script.js` (no frameworks)

## Getting Started

1. **Clone or download** this folder to your machine.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, etc.).
3. Start adding tasks, due dates, and priorities.

No build step or server is required — it’s a pure front‑end project.

## File Overview

- `index.html`  
  Main page markup:
  - Task input, due date picker, priority dropdown
  - **Add Task** and **Suggest Tasks** buttons
  - Filter buttons (All / Today / Completed / Pending / High Priority)
  - Empty list container for tasks

- `style.css`  
  Handles layout and visual design:
  - Centered card‑like layout with a colorful gradient background
  - Button, input, and filter styling
  - Priority pills, due date text, and overdue highlighting

- `script.js`  
  All app logic:
  - Local task array + `localStorage` read/write
  - Migration of older saved tasks into the new structure
  - Task creation, completion toggle, deletion
  - Suggested tasks
  - Due date + priority handling
  - Filtering and sorting before rendering

## Data Model

Each task is stored as a JavaScript object like:

```js
{
  id: string,
  text: string,
  completed: boolean,
  priority: "high" | "medium" | "low",
  dueDate: string | null,  // "YYYY-MM-DD" from the date input
  createdAt: string        // ISO timestamp
}
```

Older tasks saved without some of these fields are automatically upgraded when the app loads.

## Notes for Beginners

- You can open the browser **DevTools → Console** to see any errors if something goes wrong.
- The code is intentionally kept simple:
  - No build tools or bundlers
  - Mostly plain functions and event listeners
- This makes it a good starting point to learn:
  - DOM manipulation
  - `localStorage`
  - Basic state management in vanilla JavaScript.


