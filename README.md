# AWS Certified Solutions Architect Practice Exam (SAA-C03)

An interactive, web-based practice exam application designed to help candidates prepare for the AWS Certified Solutions Architect Associate (SAA-C03) exam. This application provides a realistic exam environment with features that simulate the actual certification experience. The application now uses a database backend for persistent storage of questions.

## 🚀 Features

- **Practice Modes:**
  - Random mode: Practice with a random selection of questions
  - Sequential mode: Practice questions in sequence within a specified range
- **Question Filtering:**
  - All questions
  - Incorrect questions
  - Unanswered questions
- **Performance Tracking:**
  - Real-time accuracy statistics
  - Correct/incorrect counters
  - Progress bar
- **Detailed Explanations:** Each question includes comprehensive explanations for the correct answers
- **Question Management Tool:** Built-in editor for adding, modifying, or removing questions with database persistence
- **Backup/Restore Functionality:** Create and restore question backups from JSON files
- **Dark/Light Theme:** Toggle between dark and light modes for comfortable studying
- **Local Storage:** Progress is saved automatically in the browser
- **Multi-select Support:** Handles both single and multiple correct answer questions
- **Responsive Design:** Works on various screen sizes

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🔧 Setup Instructions

1. Clone or download this repository to your local machine
2. Navigate to the project directory:
```bash
cd aws_exam_practice_simulator
```

3. Install the required dependencies:
```bash
npm install
```

4. Start the backend server:
```bash
npm start
```
This will start the Express.js server with SQLite database on `http://localhost:3000`

5. Serve the frontend using any local server. You can use Python's built-in server:
```bash
# In a new terminal, from the project directory
python -m http.server 8000
```
Or use a Node.js server:
```bash
# Install node server if not already installed
npm install -g http-server

# Serve the application
http-server
```

6. Navigate to `http://localhost:8000` (or the address indicated by your server) to access the frontend

## 🎯 Usage

### Taking Practice Exams

1. Select your preferred practice mode:
   - **Random Mode:** Choose the number of questions to practice
   - **Sequential Mode:** Specify the range of questions to practice (from/to)
2. Click "Start Practice"
3. Answer questions one by one
4. Click "Submit Answer" to see the explanation and move to the next question
5. Navigate between questions using "Previous" and "Next" buttons
6. Track your progress using the statistics in the header

### Question Management & Backup/Restore

The application includes a powerful question management tool with backup/restore capabilities:

1. Click the "Question Manager" button in the sidebar
2. Browse, search, and edit existing questions
3. Add new questions with:
   - Rich text editor for question text
   - Rich text editor for explanations
   - Support for multiple answer options
   - Correct answer indexing (0-based)

4. **Backup Questions:** Click "Backup Questions" to download a JSON backup of all questions in the database
5. **Restore Questions:** Click "Restore Questions" to upload a JSON backup file and replace all current questions

### Filtering Questions

- View all questions or filter by:
  - **Incorrect:** Questions you answered incorrectly
  - **Unanswered:** Questions you haven't answered yet

### Statistics Tracking

- Monitor your performance with real-time counters:
  - Correct answers
  - Incorrect answers
  - Overall accuracy percentage

## 📂 Project Structure

```
AWS_EXAM_PRACTICE_V2/
├── index.html          # Main application HTML
├── script.js           # Application logic and question management
├── styles.css          # Application styling
├── server.js           # Backend API server with database integration
├── prisma/
│   ├── schema.prisma   # Prisma schema definition
│   └── dev.db          # SQLite database file
├── img/
│   └── aws-logo.svg    # AWS logo
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## 🛠️ Backend API Endpoints

The application uses the following API endpoints:

- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get a specific question by ID
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update an existing question
- `DELETE /api/questions/:id` - Delete a question
- `GET /api/backup` - Download all questions as JSON backup
- `POST /api/restore` - Restore questions from JSON backup
- `GET /api/health` - Health check endpoint

## 🚨 Important Notes

- The application now uses a SQLite database (`prisma/dev.db`) to store questions permanently
- Questions created or modified in the admin panel are saved directly to the database
- Use the backup/restore functionality to export/import question sets
- The backend server (on port 3000) must be running for the application to function properly

## 🤝 Contributing

Feel free to submit issues and enhancement requests. For major changes, please open an issue first to discuss what you would like to change.