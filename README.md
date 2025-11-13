📘 Modelltest B1 – German Language Examination Platform

A full-stack web application that provides a complete German B1 mock exam, including Lesen, Hören and Schreiben, automatic scoring, PDF certificate generation, and an Admin dashboard with database storage.

<p align="center"> <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue" /> <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green" /> <img src="https://img.shields.io/badge/Database-PostgreSQL-orange" /> <img src="https://img.shields.io/badge/Deployed%20on-Railway-purple" /> </p>
✨ Features
🎓 Complete B1 German Exam Simulation

Reading comprehension (Lesen)

Listening comprehension (Hören)

Writing task with auto-evaluation (Schreiben)

Integrated audio player for Hören

📝 Automatic B1 Writing Evaluation

The AI-logic evaluates:

Word count

Topic relevance

B1 connectors

Email structure

Grammar indicators

Frequent errors (das/dass, capitalization, simple mistakes)

Penalties for copy/paste

⏱️ Built-in 1h Exam Timer

Countdown visible at all times

Automatic submission when time expires

🇩🇪 German Virtual Keyboard

Includes ä, ö, ü, ß for writing convenience.

📄 Automatic PDF Certificate

Generates a personalized certificate (Landscape A4)

Includes score, candidate name, and signature

📊 Admin Dashboard

DataTables interface

Real-time fetching of all candidate results

Full writing text visible

PostgreSQL backend storage

🧩 Tech Stack
Frontend

HTML5

CSS3

JavaScript (ES6)

DataTables (Admin)

jsPDF (Certificate generation)

Backend

Node.js

Express.js

Database

PostgreSQL (Railway)

Deployment

Railway.app

📁 Project Structure
##
```bash
📦 modeltest-b1
 ┣ 📂 audio
 ┣ 📂 images
 ┣ 📂 css / js
 ┣ 📄 index.html
 ┣ 📄 start.html
 ┣ 📄 admin.html
 ┣ 📄 script.js
 ┣ 📄 admin.js
 ┣ 📄 server.js
 ┗ 📄 README.md
 ```

🚀 Running Locally
### 1️⃣ Install dependencies

```bash
npm install
```


## 2️⃣ Start the server
```bash
node server.js
```

### 3️⃣ Open the app
```bash
http://localhost:3000
```

🗄️ Environment Variables
Create a .env file:
##
```bash
DATABASE_URL=your_postgres_url_here
PORT=3000
```

🔐 Admin Panel

## Access:
```bash
/admin.html
```

🧠 Auto-Writing Evaluation Logic (Simplified)
## const score = evaluateWritingB1(text);
```bash

/*
Checks:
- Word count
- Topic relevance
- B1 connectors
- Email structure markers
- Grammar indicators
- Frequent errors (das/dass…)
- Copy/paste detection
*/
```


📜 License

This project is licensed under the MIT License.

👩‍💻 Author

Chaymae AL Morchid
Full-Stack Developer – Java | Spring Boot | JS | React
Creator of the Modelltest B1 Platform