document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements needed for interaction
  const form = document.getElementById("todo-form");
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("date-input");
  const alarmSelect = document.getElementById("alarm-select");
  const tasksDiv = document.getElementById("tasks");
  const alarmSound = document.getElementById("alarm-sound");
  const quoteDiv = document.getElementById("quote");

  // Define the backend API URLs
  const API_URL = "http://localhost:3000/tasks";
  const QUOTES_API_URL = "http://localhost:3000/quotes";
  const ALARMS_API_URL = "http://localhost:3000/alarms";

  // Load alarms into dropdown
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

  // Function to render a single task in the UI
  function renderTask(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";

    if (task.done) taskDiv.classList.add("done");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;

    if (task.dueDate) {
      const small = document.createElement("small");
      small.textContent = new Date(task.dueDate).toLocaleString();
      textSpan.appendChild(document.createElement("br"));
      textSpan.appendChild(small);
    }

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

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

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("btn-delete");
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fetch(`${API_URL}/${task.id}`, { method: "DELETE" }).then(() => {
        taskDiv.remove();
      });
    });

    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    taskDiv.appendChild(textSpan);
    taskDiv.appendChild(btnGroup);
    tasksDiv.appendChild(taskDiv);
  }

  // Schedule an alarm for tasks with a future due date
  function scheduleAlarm(task) {
    if (!task.dueDate || task.done) return;

    const timeDiff = new Date(task.dueDate).getTime() - Date.now();

    if (timeDiff > 0) {
      setTimeout(() => {
        if (task.alarmUrl) {
          alarmSound.src = task.alarmUrl;
          alarmSound
            .play()
            .then(() => console.log("Alarm played!"))
            .catch((err) => {
              console.log("Alarm playback blocked by browser. User interaction required.", err);
            });
        }

        const notification = document.getElementById("notification");
        notification.textContent = `Reminder for: ${task.text}`;
        notification.classList.add("show");

        setTimeout(() => {
          notification.classList.remove("show");
        }, 5000);
      }, timeDiff);
    }
  }

  // Fetch and display all tasks from db.json
  function loadTasks() {
    tasksDiv.innerHTML = "";
    fetch(API_URL)
      .then((res) => res.json())
      .then((tasks) => {
        tasks.forEach((task) => {
          renderTask(task);
          scheduleAlarm(task);
        });
      })
      .catch((err) => {
        console.error("Failed to load tasks:", err);
      });
  }

  // Fetch and display quotes from db.json
  function loadQuote() {
    fetch(QUOTES_API_URL)
      .then((res) => res.json())
      .then((quotes) => {
        quoteDiv.innerHTML = "";

        if (quotes.length > 0) {
          quotes.forEach((quote) => {
            const p = document.createElement("p");
            p.textContent = `"${quote.text}"`;

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

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = taskInput.value.trim();
    const dueDate = dateInput.value
      ? new Date(dateInput.value).toISOString()
      : null;
    const alarmUrl = alarmSelect.value || null;

    if (!text) return;

    const task = {
      text,
      dueDate,
      done: false,
      alarmUrl,
    };

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    })
      .then((res) => res.json())
      .then((newTask) => {
        renderTask(newTask);
        scheduleAlarm(newTask);
        form.reset();
      })
      .catch((err) => {
        console.error("Failed to save task:", err);
      });
  });

  // Load everything on page load
  loadTasks();
  loadQuote();
  loadAlarms();
});
