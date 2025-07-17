// The whole HTML document to load before running any JS
document.addEventListener("DOMContentLoaded", () => {

  // Find references to the HTML elements needed
  const form = document.getElementById("todo-form");
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("date-input");
  const alarmSelect = document.getElementById("alarm-select");
  const tasksDiv = document.getElementById("tasks");
  const alarmSound = document.getElementById("alarm-sound");
  const quoteDiv = document.getElementById("quote");

  // Defining API endpoints from db.json
  const API_URL = "http://localhost:3000/tasks";
  const QUOTES_API_URL = "http://localhost:3000/quotes";
  const ALARMS_API_URL = "http://localhost:3000/alarms";

  // Fill all alarm options into the dropdown menu
  function loadAlarms() {
    fetch(ALARMS_API_URL)
      .then((res) => res.json())
      .then((alarms) => {
        alarms.forEach((alarm) => {
          const option = document.createElement("option");
          option.value = alarm.url;
          option.textContent = `Alarm ${alarm.id} (${alarm.duration}s)`;
          alarmSelect.appendChild(option);
        });
      })
      .catch((err) => {
        console.error("Failed to load alarms:", err);
      });
  }

  // Display a task in the task list
  function renderTask(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";

    // Add "done" styling if task is completed
    if (task.done) taskDiv.classList.add("done");

    // Create text area for task content
    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;

    // Show the task if has a due date
    if (task.dueDate) {
      const small = document.createElement("small");
      small.textContent = new Date(task.dueDate).toLocaleString();
      textSpan.appendChild(document.createElement("br"));
      textSpan.appendChild(small);
    }

    // Create buttons: Done, Edit, Delete
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    // Done/Undo button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.done ? "Undo" : "Done";
    doneBtn.classList.add("btn-done");
    doneBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fetch(`${API_URL}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done })
      }).then(() => {
        taskDiv.remove();
        loadTasks();
      });
    });

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("btn-edit");
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const newText = prompt("Edit task text:", task.text);
      if (newText !== null) {
        fetch(`${API_URL}/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText })
        }).then(() => {
          taskDiv.remove();
          loadTasks();
        });
      }
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("btn-delete");
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fetch(`${API_URL}/${task.id}`, { method: "DELETE" }).then(() => {
        taskDiv.remove();
      });
    });

    // Add buttons and text to task container
    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    taskDiv.appendChild(textSpan);
    taskDiv.appendChild(btnGroup);
    tasksDiv.appendChild(taskDiv);
  }

  // Schedule alarm for tasks with a due date
  function scheduleAlarm(task) {
    // Skip if task is already done or has no due date
    if (!task.dueDate || task.done) return;

    // Calculate time left until alarm should play
    const timeDiff = new Date(task.dueDate).getTime() - Date.now();

    if (timeDiff > 0) {
      setTimeout(() => {
        // Play selected alarm sound
        if (task.alarmUrl) {
          alarmSound.src = task.alarmUrl;
          alarmSound
            .play()
            .then(() => console.log("Alarm played!"))
            .catch((err) => {
              console.log("Alarm playback blocked by browser. User interaction required.", err);
            });
        }

        // Show popup notification for the task
        const notification = document.getElementById("notification");
        notification.textContent = `Reminder for: ${task.text}`;
        notification.classList.add("show");

        // Hide notification after 5 seconds
        setTimeout(() => {
          notification.classList.remove("show");
        }, 5000);
      }, timeDiff);
    }
  }

  // Load and display all tasks
  function loadTasks() {
    tasksDiv.innerHTML = ""; // Clear existing tasks
    fetch(API_URL)
      .then((res) => res.json())
      .then((tasks) => {
        tasks.forEach((task) => {
          renderTask(task);     // Show task
          scheduleAlarm(task);  // Set reminder
        });
      })
      .catch((err) => {
        console.error("Failed to load tasks:", err);
      });
  }

  // Load and display all quotes from db.json
  function loadQuote() {
    fetch(QUOTES_API_URL)
      .then((res) => res.json())
      .then((quotes) => {
        quoteDiv.innerHTML = ""; // Clear previous quotes

        if (quotes.length > 0) {
          quotes.forEach((quote) => {
            const p = document.createElement("p");
            p.textContent = `"${quote.text}"`;

            // Show author if available
            if (quote.author) {
              const authorSpan = document.createElement("span");
              authorSpan.textContent = ` — ${quote.author}`;
              authorSpan.style.fontWeight = "bold";
              p.appendChild(authorSpan);
            }

            quoteDiv.appendChild(p);
          });
        } else {
          quoteDiv.textContent = "No quotes found.";
        }
      })
      .catch((err) => {
        console.error("Failed to load quotes:", err);
      });
  }

  // Handle task submission from the form
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload

    // Get form values
    const text = taskInput.value.trim();
    const dueDate = dateInput.value
      ? new Date(dateInput.value).toISOString()
      : null;
    const alarmUrl = alarmSelect.value || null;

    // Don't allow empty tasks
    if (!text) return;

    // Create a new task object
    const task = {
      text,
      dueDate,
      done: false,
      alarmUrl,
    };

    // Save new task to db.json
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    })
      .then((res) => res.json())
      .then((newTask) => {
        renderTask(newTask);     // Display it
        scheduleAlarm(newTask);  // Schedule alarm
        form.reset();            // Clear form
      })
      .catch((err) => {
        console.error("Failed to save task:", err);
      });
  });

  // Initial loading of data on page open
  loadTasks();
  loadQuote();
  loadAlarms();
});
