const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    
    // Convert JSON strings back to arrays for the frontend
    const processedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      explanation: JSON.parse(q.explanation),
      correctAnswers: JSON.parse(q.correctAnswers)
    }));
    
    res.json(processedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get a specific question by ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Convert JSON strings back to arrays
    const processedQuestion = {
      ...question,
      options: JSON.parse(question.options),
      explanation: JSON.parse(question.explanation),
      correctAnswers: JSON.parse(question.correctAnswers)
    };
    
    res.json(processedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create a new question
app.post('/api/questions', async (req, res) => {
  try {
    const { text, options, explanation, correctAnswers } = req.body;
    
    const newQuestion = await prisma.question.create({
      data: {
        text,
        options: JSON.stringify(Array.isArray(options) ? options : []),
        explanation: JSON.stringify(Array.isArray(explanation) ? explanation : []),
        correctAnswers: JSON.stringify(Array.isArray(correctAnswers) ? correctAnswers : [])
      }
    });
    
    // Convert JSON strings back to arrays for the response
    const processedQuestion = {
      ...newQuestion,
      options: JSON.parse(newQuestion.options),
      explanation: JSON.parse(newQuestion.explanation),
      correctAnswers: JSON.parse(newQuestion.correctAnswers)
    };
    
    res.status(201).json(processedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update a question
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, explanation, correctAnswers } = req.body;
    
    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        text,
        options: JSON.stringify(Array.isArray(options) ? options : []),
        explanation: JSON.stringify(Array.isArray(explanation) ? explanation : []),
        correctAnswers: JSON.stringify(Array.isArray(correctAnswers) ? correctAnswers : [])
      }
    });
    
    // Convert JSON strings back to arrays for the response
    const processedQuestion = {
      ...updatedQuestion,
      options: JSON.parse(updatedQuestion.options),
      explanation: JSON.parse(updatedQuestion.explanation),
      correctAnswers: JSON.parse(updatedQuestion.correctAnswers)
    };
    
    res.json(processedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Backup all questions
app.get('/api/backup', async (req, res) => {
  try {
    const questions = await prisma.question.findMany();

    // Convert JSON strings back to arrays for the response
    const processedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      explanation: JSON.parse(q.explanation),
      correctAnswers: JSON.parse(q.correctAnswers)
    }));

    res.json(processedQuestions);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore questions from backup
app.post('/api/restore', express.json(), async (req, res) => {
  try {
    const questionsToRestore = req.body;

    if (!Array.isArray(questionsToRestore)) {
      return res.status(400).json({ error: 'Invalid backup data format' });
    }

    // Clear existing questions
    await prisma.question.deleteMany({});

    // Insert restored questions
    for (const question of questionsToRestore) {
      await prisma.question.create({
        data: {
          id: question.id,
          text: question.text,
          options: JSON.stringify(question.options),
          explanation: JSON.stringify(question.explanation),
          correctAnswers: JSON.stringify(question.correctAnswers)
        }
      });
    }

    res.json({ message: `Successfully restored ${questionsToRestore.length} questions` });
  } catch (error) {
    console.error('Error restoring questions:', error);
    res.status(500).json({ error: 'Failed to restore questions' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}/api`);
});