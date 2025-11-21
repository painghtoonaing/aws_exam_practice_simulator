# AWS Certified Solutions Architect Practice Exam (SAA-C03)

An interactive, web-based practice exam application designed to help candidates prepare for the AWS Certified Solutions Architect Associate (SAA-C03) exam. This application provides a realistic exam environment with features that simulate the actual certification experience.

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
- **Question Management Tool:** Built-in editor for adding, modifying, or removing questions
- **Dark/Light Theme:** Toggle between dark and light modes for comfortable studying
- **Local Storage:** Progress is saved automatically in the browser
- **Multi-select Support:** Handles both single and multiple correct answer questions
- **Responsive Design:** Works on various screen sizes

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for loading questions.json file)

## 🔧 Setup Instructions

### Option 1: Local Server (Recommended)

The application uses the `fetch` API to load questions from the `questions.json` file. Due to browser security restrictions, this won't work when opening `index.html` directly in the browser. You need to serve the files through a local web server.

1. Clone or download this repository to your local machine
2. Start a local web server:

For Python 3:
```bash
python -m http.server 8000
```

For Python 2:
```bash
python -m SimpleHTTPServer 8000
```

For Node.js (with live-server):
```bash
npm install -g live-server
live-server
```

3. Navigate to `http://localhost:8000` (or the address indicated by your server)

### Option 2: Browser with Disabled Security (Not Recommended)

For Chrome (development only):
```bash
chrome --disable-web-security --user-data-dir="C:/temp/chrome_dev"
```
**Note:** This method is not recommended for regular use as it disables browser security features.

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

### Question Management

The application includes a powerful question management tool:

1. Click the "Question Manager" button in the sidebar
2. Browse, search, and edit existing questions
3. Add new questions with:
   - Rich text editor for question text
   - Rich text editor for explanations
   - Support for multiple answer options
   - Correct answer indexing (0-based)
4. Click "Download JSON" to save your changes to `questions.json`

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
├── questions.json      # Question database
├── img/
│   └── aws-logo.svg    # AWS logo
└── README.md           # This file
```

## ⚙️ Customizing Questions

The `questions.json` file contains all exam questions in the following format:

```json
{
  "id": 1,
  "text": "Question text here",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "explanation": [
    "Explanation of the correct answer"
  ],
  "correctAnswers": [0]  // Array indices of correct options (0-based)
}
```

- `correctAnswers` should contain an array of indices corresponding to the correct options
- For single-answer questions, use a single index: `[0]`
- For multiple-answer questions, use multiple indices: `[0, 2]`
- The explanation can be a string or an array of paragraphs