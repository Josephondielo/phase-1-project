# Phase 1 Project
This is a to-do list application built using HTML, CSS, and JavaScript. It allows users to manage tasks efficiently with due dates, reminders (with alarm sound), motivational quotes, and persistent storage using a local `db.json`.
## Description
 This project is a to-do list manager that allows users to:
- Add tasks with a title and due date
- Set a choice alarm reminder for each task
- View motivational quotes
- Store data locally with `db.json`
- Hear alarms play when tasks are due
## Overview
The application interface includes:
- A task entry form (with task name, date-time, and alarm selector)
- A live task list with reminders
- Motivational quote display
- Alarm sound support
## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/my-todo-list.git
   cd my-todo-list

2. **Intall JSON server**:
   ```bash
   npm install -g json-server

3. **Start JSON server**
   ```bash 
   json-server --watch db.json

   ```
   The server will start at: `http://localhost:3000`
   
## How to run the Project

1. Open index.html in your browser using Live Server (VS Code) or simply double-click it.

2. Make sure JSON Server is running in the background to load tasks, alarms, and quotes.

3. Add a task with a name, select a date and time, and choose an alarm from the dropdown.

4. The task will be stored in db.json and will trigger an alert and audio reminder at the set time.