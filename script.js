// Application state
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let showExplanation = false;
let questionOrder = [];
let isRandomMode = false;
let filterMode = 'all'; // 'all', 'incorrect', 'unanswered'
let practiceMode = false;
let saveProgressTimeout = null;
let questionsLoaded = false;
let practiceQuestionPool = [];

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;

// --- ADMIN STATE ---
let quillQuestionEditor;
let quillExplanationEditor;
let currentAdminQuestionIndex = -1; // -1 means creating new

// DOM elements (Existing Exam UI)
const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const explanationContainerEl = document.getElementById('explanation-container');
const explanationTextEl = document.getElementById('explanation-text');
const submitBtnEl = document.getElementById('submit-btn');
const prevBtnEl = document.getElementById('prev-btn');
const nextBtnEl = document.getElementById('next-btn');
const resetBtnEl = document.getElementById('reset-btn');
const progressBarEl = document.getElementById('progress-bar');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');
const accuracyEl = document.getElementById('accuracy');
const questionContainerEl = document.getElementById('question-container');
const resultContainerEl = document.getElementById('result-container');
const resultScoreEl = document.getElementById('result-score');
const resultMessageEl = document.getElementById('result-message');
const totalAnsweredEl = document.getElementById('total-answered');
const totalCorrectEl = document.getElementById('total-correct');
const totalIncorrectEl = document.getElementById('total-incorrect');
const restartBtnEl = document.getElementById('restart-btn');
const continueBtnEl = document.getElementById('continue-btn');
const multiSelectHintEl = document.getElementById('multi-select-hint');
const mainLayoutEl = document.getElementById('main-layout');

// Sidebar elements
const questionCountInput = document.getElementById('question-count');
const startPracticeBtn = document.getElementById('start-practice');
const startQuestionInput = document.getElementById('start-question');
const endQuestionInput = document.getElementById('end-question');
const randomPracticeModeBtn = document.getElementById('random-practice-mode');
const sequentialPracticeModeBtn = document.getElementById('sequential-practice-mode');
const randomPracticeControl = document.getElementById('random-practice-control');
const sequentialPracticeControl = document.getElementById('sequential-practice-control');
let currentPracticeMode = 'random';
const allQuestionsBtn = document.getElementById('all-questions');
const incorrectQuestionsBtn = document.getElementById('incorrect-questions');
const unansweredQuestionsBtn = document.getElementById('unanswered-questions');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const totalQuestionsEl = document.getElementById('total-questions');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// --- ADMIN DOM ELEMENTS ---
const manageQuestionsBtn = document.getElementById('manage-questions-btn');
const examView = document.getElementById('exam-view');
const adminView = document.getElementById('admin-view');
const exitAdminBtn = document.getElementById('exit-admin-btn');
const adminQuestionList = document.getElementById('admin-question-list');
const adminSearchInput = document.getElementById('admin-search-input');
const addNewQuestionBtn = document.getElementById('add-new-question-btn');
const backupQuestionsBtn = document.getElementById('backup-questions-btn');
const restoreQuestionsBtn = document.getElementById('restore-questions-btn');
const restoreFileInput = document.getElementById('restore-file-input');
const adminOptionsContainer = document.getElementById('admin-options-container');
const addOptionBtn = document.getElementById('add-option-btn');
const questionEditorForm = document.getElementById('question-editor-form');
const editCorrectAnswersInput = document.getElementById('edit-correct-answers');
const deleteQuestionBtn = document.getElementById('delete-question-btn');

function getTotalQuestions() {
    return questions.length;
}

// Initialize the app
function init() {
    initTheme();
    questionTextEl.innerHTML = formatQuestionText('Loading questions...');
    
    // Event listeners
    submitBtnEl.addEventListener('click', handleSubmit);
    prevBtnEl.addEventListener('click', goToPreviousQuestion);
    nextBtnEl.addEventListener('click', goToNextQuestion);
    resetBtnEl.addEventListener('click', resetAll);
    restartBtnEl.addEventListener('click', restartExam);
    continueBtnEl.addEventListener('click', continueSession);
    optionsContainerEl.addEventListener('click', handleOptionClick);
    
    allQuestionsBtn.addEventListener('click', () => setFilterMode('all'));
    incorrectQuestionsBtn.addEventListener('click', () => setFilterMode('incorrect'));
    unansweredQuestionsBtn.addEventListener('click', () => setFilterMode('unanswered'));
    
    startPracticeBtn.addEventListener('click', startPracticeMode);
    questionCountInput.addEventListener('input', validateQuestionCount);
    
    startQuestionInput.addEventListener('input', validateStartQuestion);
    endQuestionInput.addEventListener('input', validateEndQuestion);
    
    randomPracticeModeBtn.addEventListener('click', () => switchPracticeMode('random'));
    sequentialPracticeModeBtn.addEventListener('click', () => switchPracticeMode('sequential'));
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    questionCountInput.addEventListener('focus', () => {
        document.querySelector('.input-wrapper').classList.add('focus-within');
    });
    questionCountInput.addEventListener('blur', () => {
        document.querySelector('.input-wrapper').classList.remove('focus-within');
    });

    // --- ADMIN EVENT LISTENERS ---
    manageQuestionsBtn.addEventListener('click', () => openAdminPanel());
    exitAdminBtn.addEventListener('click', closeAdminPanel);
    addNewQuestionBtn.addEventListener('click', initNewQuestion);
    addOptionBtn.addEventListener('click', () => addOptionInput(''));
    questionEditorForm.addEventListener('submit', saveAdminQuestion);
    deleteQuestionBtn.addEventListener('click', deleteCurrentQuestion);
    backupQuestionsBtn.addEventListener('click', backupQuestions);
    restoreQuestionsBtn.addEventListener('click', () => restoreFileInput.click());
    restoreFileInput.addEventListener('change', handleRestoreFile);
    adminSearchInput.addEventListener('input', async (e) => await renderAdminList(e.target.value));
    
    loadQuestionsData();
}

async function loadQuestionsData() {
    try {
        // Fetch questions from the API backend
        const response = await fetch(`${API_BASE_URL}/api/questions`, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.status}`);
        }
        questions = await response.json();
        questionsLoaded = true;
        initializeQuestionState();
    } catch (error) {
        console.error('Error loading questions:', error);
        questionTextEl.innerHTML = formatQuestionText('Failed to load questions from the API. Ensure the backend server is running.');
        optionsContainerEl.innerHTML = '';
    }
}

function initializeQuestionState() {
    const total = getTotalQuestions();
    // Default pool is all questions
    questionOrder = [...Array(total).keys()];
    practiceQuestionPool = [...questionOrder];
    
    setupDynamicValues();
    loadSavedProgress();
    
    // If we have questions, render the first one
    if (total > 0) {
        renderQuestion();
        refreshMetrics();
    }
}

function ensureQuestionsReady() {
    if (!questionsLoaded || questions.length === 0) {
        alert('Questions are still loading or empty. Please wait a moment.');
        return false;
    }
    return true;
}

function setupDynamicValues() {
    const totalQuestions = getTotalQuestions();
    totalQuestionsEl.textContent = totalQuestions;
    
    if (totalQuestions === 0) {
        questionCountInput.value = '';
        questionCountInput.max = 0;
        return;
    }
    
    questionCountInput.max = totalQuestions;
    if (!questionCountInput.value) questionCountInput.value = totalQuestions;
    
    startQuestionInput.max = totalQuestions;
    if (!startQuestionInput.value) startQuestionInput.value = 1;
    
    endQuestionInput.max = totalQuestions;
    if (!endQuestionInput.value) endQuestionInput.value = totalQuestions;
}

function switchPracticeMode(mode) {
    currentPracticeMode = mode;
    randomPracticeModeBtn.classList.toggle('active', mode === 'random');
    sequentialPracticeModeBtn.classList.toggle('active', mode === 'sequential');
    randomPracticeControl.classList.toggle('hidden', mode !== 'random');
    sequentialPracticeControl.classList.toggle('hidden', mode !== 'sequential');
}

function validateQuestionCount() {
    const total = getTotalQuestions();
    let val = parseInt(questionCountInput.value);
    if(isNaN(val) || val < 1) questionCountInput.value = 1;
    else if(val > total) questionCountInput.value = total;
}

function validateStartQuestion() {
    const total = getTotalQuestions();
    let val = parseInt(startQuestionInput.value);
    if (isNaN(val) || val < 1) startQuestionInput.value = 1;
    else if (val > total) startQuestionInput.value = total;
}

function validateEndQuestion() {
    const total = getTotalQuestions();
    let val = parseInt(endQuestionInput.value);
    if (isNaN(val) || val < 1) endQuestionInput.value = 1;
    else if (val > total) endQuestionInput.value = total;
}

function saveProgress() {
    localStorage.setItem('awsExamProgress', JSON.stringify({
        userAnswers: userAnswers,
        currentQuestionIndex: currentQuestionIndex,
        questionOrder: questionOrder,
        filterMode: filterMode,
        isRandomMode: isRandomMode,
        practiceMode: practiceMode,
        practiceQuestionPool: practiceQuestionPool
    }));
}

function scheduleSaveProgress(delay = 300) {
    clearTimeout(saveProgressTimeout);
    saveProgressTimeout = setTimeout(saveProgress, delay);
}

function loadSavedProgress() { 
    const savedProgress = localStorage.getItem('awsExamProgress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            const totalQuestions = getTotalQuestions();
            
            // Only restore if questions match loosely
            userAnswers = progress.userAnswers || {};
            currentQuestionIndex = progress.currentQuestionIndex || 0;
            
            if (progress.questionOrder && progress.questionOrder.length > 0) {
                questionOrder = progress.questionOrder;
            }
            
            filterMode = progress.filterMode || 'all';
            isRandomMode = progress.isRandomMode || false;
            practiceMode = progress.practiceMode || false;
            
            // Validate index
            if(currentQuestionIndex >= questionOrder.length) currentQuestionIndex = 0;
            
            // Update UI states
            filterButtons.forEach(btn => btn.classList.remove('active'));
            if (filterMode === 'all') allQuestionsBtn.classList.add('active');
            else if (filterMode === 'incorrect') incorrectQuestionsBtn.classList.add('active');
            else if (filterMode === 'unanswered') unansweredQuestionsBtn.classList.add('active');
            
            refreshMetrics();
        } catch (e) {
            console.error("Error parsing saved progress", e);
            localStorage.removeItem('awsExamProgress');
        }
    }
}

function startPracticeMode() {
    if (!ensureQuestionsReady()) return;
    practiceMode = true;
    currentQuestionIndex = 0;
    filterMode = 'all';
    
    // Reset filters UI
    filterButtons.forEach(btn => btn.classList.remove('active'));
    allQuestionsBtn.classList.add('active');

    const total = getTotalQuestions();
    if (currentPracticeMode === 'random') {
         const count = parseInt(questionCountInput.value) || total;
         questionOrder = selectRandomSubset(count, total);
         isRandomMode = true;
    } else {
        const start = (parseInt(startQuestionInput.value) || 1) - 1;
        const end = (parseInt(endQuestionInput.value) || total);
        
        if(start > end) { alert("Start must be less than End"); return; }

        questionOrder = [];
        for(let i=start; i<end; i++) {
            if(i < total) questionOrder.push(i);
        }
        isRandomMode = false;
    }
    
    practiceQuestionPool = [...questionOrder];
    
    questionContainerEl.style.display = 'block';
    resultContainerEl.classList.remove('show');
    
    renderQuestion();
    refreshMetrics();
}

function resetAll() {
    if(confirm("Are you sure you want to reset all your answers? This action cannot be undone.")) {
        userAnswers = {};
        currentQuestionIndex = 0;
        practiceMode = false;
        isRandomMode = false;
        filterMode = 'all';
        
        // Reset filters UI
        filterButtons.forEach(btn => btn.classList.remove('active'));
        allQuestionsBtn.classList.add('active');

        const total = getTotalQuestions();
        questionOrder = [...Array(total).keys()];
        practiceQuestionPool = [...questionOrder];
        
        localStorage.removeItem('awsExamProgress');
        
        questionContainerEl.style.display = 'block';
        resultContainerEl.classList.remove('show');
        
        renderQuestion();
        refreshMetrics();
        setupDynamicValues();
    }
}

function continueSession() {
    questionContainerEl.style.display = 'block';
    resultContainerEl.classList.remove('show');
    renderQuestion();
}

// --- Formatting & Rendering ---

function formatQuestionText(text) {
    if (!text) return '';
    // Replace \n characters with <br> tags
    // Also protect against multiple breaks if data already has HTML
    let formatted = text.replace(/\n/g, '<br>');
    formatted = formatted.replace(/(<br>\s*){2,}/g, '<br>');
    return formatted;
}

function formatExplanationContent(explanation) {
    const paragraphs = Array.isArray(explanation)
        ? explanation
        : typeof explanation === 'string' && explanation.length > 0
            ? [explanation]
            : [];
    if (paragraphs.length === 0) return '';
    return paragraphs.map(p => p.replace(/\n/g, '<br>')).join('<br>');
}

function renderQuestion() {
    if (questionOrder.length === 0) {
        questionTextEl.innerHTML = 'No questions available for the current filter.';
        optionsContainerEl.innerHTML = '';
        if (multiSelectHintEl) multiSelectHintEl.classList.add('hidden');
        hideExplanation();
        return;
    }

    const questionIndex = questionOrder[currentQuestionIndex];
    const question = questions[questionIndex];
    
    if(!question) {
        console.error("Question index out of bounds");
        return;
    }

    const savedAnswer = userAnswers[question.id];
    const savedSelections = normalizeUserAnswer(savedAnswer);

    if (multiSelectHintEl) {
        if (isMultiSelectQuestion(question)) {
            multiSelectHintEl.textContent = 'Select all that apply.';
            multiSelectHintEl.classList.remove('hidden');
        } else {
            multiSelectHintEl.classList.add('hidden');
        }
    }

    questionNumberEl.textContent = `Question ${currentQuestionIndex + 1} of ${questionOrder.length}`;
    questionTextEl.innerHTML = formatQuestionText(question.text);
    
    optionsContainerEl.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.dataset.index = index;
        
        const optionLetterEl = document.createElement('div');
        optionLetterEl.className = 'option-letter';
        optionLetterEl.textContent = String.fromCharCode(65 + index); 
        
        const optionTextEl = document.createElement('div');
        optionTextEl.className = 'option-text';
        optionTextEl.innerHTML = formatQuestionText(option);
        
        optionEl.appendChild(optionLetterEl);
        optionEl.appendChild(optionTextEl);
        
        if (savedSelections.includes(index)) {
            optionEl.classList.add('selected');
        }
        optionsContainerEl.appendChild(optionEl);
    });
    
    if (savedAnswer !== undefined) {
        showExplanationForCurrentQuestion();
        submitBtnEl.textContent = 'Change Answer';
    } else {
        hideExplanation();
        submitBtnEl.textContent = 'Submit Answer';
    }
    
    prevBtnEl.disabled = currentQuestionIndex === 0;
    nextBtnEl.disabled = currentQuestionIndex === questionOrder.length - 1;
}

function handleOptionClick(event) {
    const optionEl = event.target.closest('.option');
    if (!optionEl) return;
    selectOption(parseInt(optionEl.dataset.index));
}

function selectOption(index) {
    const qIndex = questionOrder[currentQuestionIndex];
    const question = questions[qIndex];
    if (userAnswers[question.id] !== undefined) return; // Already answered
    
    if (isMultiSelectQuestion(question)) {
        document.querySelector(`.option[data-index="${index}"]`).classList.toggle('selected');
    } else {
        document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
        document.querySelector(`.option[data-index="${index}"]`).classList.add('selected');
    }
}

function handleSubmit() {
    const qIndex = questionOrder[currentQuestionIndex];
    const question = questions[qIndex];
    const existing = userAnswers[question.id];
    
    if (existing !== undefined && submitBtnEl.textContent === 'Change Answer') {
        delete userAnswers[question.id];
        renderQuestion();
        refreshMetrics();
        scheduleSaveProgress();
        return;
    }
    
    const selectedIndices = getSelectedOptionIndices();
    if (selectedIndices.length === 0) {
        alert('Please select an answer.');
        return;
    }

    if (!isMultiSelectQuestion(question) && selectedIndices.length !== 1) {
        alert('Please select one answer.');
        return;
    }
    
    userAnswers[question.id] = isMultiSelectQuestion(question) ? selectedIndices : selectedIndices[0];
    
    showExplanationForCurrentQuestion();
    refreshMetrics();
    scheduleSaveProgress();
    submitBtnEl.textContent = 'Change Answer';
}

function showExplanationForCurrentQuestion() {
    const qIndex = questionOrder[currentQuestionIndex];
    const question = questions[qIndex];
    const userAnswer = userAnswers[question.id];
    const userSelections = normalizeUserAnswer(userAnswer);
    const correctAnswers = getCorrectAnswers(question);
    
    document.querySelectorAll('.option').forEach((el, index) => {
        if (correctAnswers.includes(index)) el.classList.add('correct');
        else if (userSelections.includes(index)) el.classList.add('incorrect');
    });
    
    explanationTextEl.innerHTML = formatExplanationContent(question.explanation);
    explanationContainerEl.classList.add('show');
}

function hideExplanation() {
    explanationContainerEl.classList.remove('show');
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function goToNextQuestion() {
    if (currentQuestionIndex < questionOrder.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    let correct = 0;
    let answered = 0;
    questionOrder.forEach(idx => {
        const q = questions[idx];
        const ans = userAnswers[q.id];
        if(ans !== undefined) {
            answered++;
            if(isAnswerCorrect(q, ans)) correct++;
        }
    });
    
    resultScoreEl.textContent = `${answered > 0 ? Math.round((correct/answered)*100) : 0}%`;
    totalAnsweredEl.textContent = answered;
    totalCorrectEl.textContent = correct;
    totalIncorrectEl.textContent = answered - correct;
    
    // Set message
    let message = '';
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    if (accuracy >= 90) message = 'Excellent work!';
    else if (accuracy >= 70) message = 'Good job!';
    else message = 'Keep studying!';
    resultMessageEl.textContent = message;
    
    questionContainerEl.style.display = 'none';
    resultContainerEl.classList.add('show');
    saveProgress();
}

function restartExam() {
    userAnswers = {};
    currentQuestionIndex = 0;
    showExplanation = false;
    questionContainerEl.style.display = 'block';
    resultContainerEl.classList.remove('show');
    renderQuestion();
    refreshMetrics();
    scheduleSaveProgress();
}

function setFilterMode(mode) {
    if (!ensureQuestionsReady()) return;

    filterMode = mode;
    filterButtons.forEach(b => b.classList.remove('active'));
    if(mode === 'all') document.getElementById('all-questions').classList.add('active');
    if(mode === 'incorrect') document.getElementById('incorrect-questions').classList.add('active');
    if(mode === 'unanswered') document.getElementById('unanswered-questions').classList.add('active');
    
    const basePool = practiceMode ? practiceQuestionPool : [...Array(getTotalQuestions()).keys()];
    let newOrder = [];
    
    if (mode === 'all') {
        newOrder = [...basePool];
    } else if (mode === 'incorrect') {
        newOrder = basePool.filter(idx => {
            const q = questions[idx];
            const ans = userAnswers[q.id];
            return ans !== undefined && !isAnswerCorrect(q, ans);
        });
        if(newOrder.length === 0) { alert("No incorrect questions found."); setFilterMode('all'); return; }
    } else if (mode === 'unanswered') {
        newOrder = basePool.filter(idx => userAnswers[questions[idx].id] === undefined);
        if(newOrder.length === 0) { alert("No unanswered questions found."); setFilterMode('all'); return; }
    }
    
    if (isRandomMode) shuffleArray(newOrder);

    questionOrder = newOrder;
    currentQuestionIndex = 0;
    renderQuestion();
    refreshMetrics();
    scheduleSaveProgress();
}

function refreshMetrics() {
    let correct = 0;
    let incorrect = 0;
    let answered = 0;
    
    questionOrder.forEach(idx => {
        const q = questions[idx];
        const ans = userAnswers[q.id];
        if (ans !== undefined) {
            answered++;
            if (isAnswerCorrect(q, ans)) correct++;
            else incorrect++;
        }
    });
    
    correctCountEl.textContent = correct;
    incorrectCountEl.textContent = incorrect;
    accuracyEl.textContent = answered > 0 ? `${Math.round((correct/answered)*100)}%` : '0%';
    const pct = questionOrder.length > 0 ? (answered/questionOrder.length)*100 : 0;
    progressBarEl.style.width = `${pct}%`;
}

// --- Helper Functions ---
function getCorrectAnswers(question) {
    if (Array.isArray(question.correctAnswers)) return question.correctAnswers.map(n => parseInt(n, 10));
    if (typeof question.correctAnswer === 'number') return [question.correctAnswer];
    return [];
}
function isMultiSelectQuestion(question) { return getCorrectAnswers(question).length > 1; }
function normalizeUserAnswer(answer) {
    if (Array.isArray(answer)) return [...new Set(answer)].map(n => parseInt(n, 10)).sort((a,b) => a-b);
    if (typeof answer === 'number') return [answer];
    return [];
}
function isAnswerCorrect(question, answer) {
    const correct = getCorrectAnswers(question).sort((a,b) => a-b);
    const user = normalizeUserAnswer(answer);
    if(correct.length !== user.length) return false;
    return correct.every((val, index) => val === user[index]);
}
function getSelectedOptionIndices() {
    return Array.from(document.querySelectorAll('.option.selected')).map(el => parseInt(el.dataset.index));
}
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeIcon.className = next === 'dark' ? 'fas fa-sun fa-beat-fade' : 'fas fa-moon fa-beat-fade';
}
function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    themeIcon.className = saved === 'dark' ? 'fas fa-sun fa-beat-fade' : 'fas fa-moon fa-beat-fade';
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function selectRandomSubset(count, total) {
    const indices = [...Array(total).keys()];
    for(let i=0; i<Math.min(count, total); i++) {
        const r = i + Math.floor(Math.random()*(total-i));
        [indices[i], indices[r]] = [indices[r], indices[i]];
    }
    return indices.slice(0, Math.min(count, total));
}

// ==========================================
// ADMIN / QUESTION MANAGER FUNCTIONS
// ==========================================

async function openAdminPanel() {
    if (!ensureQuestionsReady()) return;

    // Initialize Quill editors if not already done
    if (!quillQuestionEditor) {
        quillQuestionEditor = new Quill('#quill-question-editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline', 'code-block'], ['link', 'image'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]] }
        });
    }
    if (!quillExplanationEditor) {
        quillExplanationEditor = new Quill('#quill-explanation-editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline', 'code-block'], ['link', 'image'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]] }
        });
    }

    // Hide exam view, show admin view
    examView.classList.add('hidden');
    adminView.classList.remove('hidden');

    // Hide sidebar via main layout class
    mainLayoutEl.classList.add('admin-mode');

    await renderAdminList();
    // Select the first question or start blank
    if (questions.length > 0) {
        await loadAdminQuestion(0);
    } else {
        await initNewQuestion();
    }
}

async function closeAdminPanel() {
    adminView.classList.add('hidden');
    examView.classList.remove('hidden');

    // Show sidebar
    mainLayoutEl.classList.remove('admin-mode');

    // Reload question state in case edits affected current view
    // Fetch updated questions from API
    try {
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        questions = await response.json();
        questionsLoaded = true;
    } catch (error) {
        console.error('Error refreshing questions after closing admin panel:', error);
    }

    initializeQuestionState();
    refreshMetrics();
}

async function renderAdminList(searchTerm = '') {
    try {
        // Fetch the latest questions from the API to ensure we have the most up-to-date data
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        questions = await response.json();
        questionsLoaded = true;
    } catch (error) {
        console.error('Error refreshing questions list:', error);
        alert(`Error refreshing questions list: ${error.message}`);
    }

    adminQuestionList.innerHTML = '';
    searchTerm = searchTerm.toLowerCase();

    questions.forEach((q, index) => {
        // Simple text extraction for search (removing html tags)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = q.text;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (searchTerm && !textContent.toLowerCase().includes(searchTerm) && !q.id.toString().includes(searchTerm)) {
            return;
        }

        const item = document.createElement('div');
        item.className = `admin-list-item ${index === currentAdminQuestionIndex ? 'active' : ''}`;
        item.textContent = `${q.id}: ${textContent.substring(0, 40)}...`;
        item.onclick = () => loadAdminQuestion(index);
        adminQuestionList.appendChild(item);
    });
}

async function loadAdminQuestion(index) {
    // Fetch the latest questions to ensure we have the most up-to-date data
    try {
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        questions = await response.json();
        questionsLoaded = true;
    } catch (error) {
        console.error('Error refreshing questions:', error);
        alert(`Error refreshing questions: ${error.message}`);
    }

    currentAdminQuestionIndex = index;
    renderAdminList(adminSearchInput.value); // Refresh highlighting

    const q = questions[index];
    if(!q) return;

    // Populate Form
    document.getElementById('edit-question-id').value = q.id;

    // Set Quill Content
    quillQuestionEditor.root.innerHTML = q.text;

    // Handle Explanation (could be array or string in JSON)
    const expl = Array.isArray(q.explanation) ? q.explanation.join('<br>') : q.explanation;
    quillExplanationEditor.root.innerHTML = expl;

    // Populate Options
    adminOptionsContainer.innerHTML = '';
    q.options.forEach(opt => addOptionInput(opt));

    // Correct Answers
    const correct = getCorrectAnswers(q);
    editCorrectAnswersInput.value = correct.join(',');

    deleteQuestionBtn.style.display = 'block';
}

async function initNewQuestion() {
    // Fetch the latest questions to ensure we have the most up-to-date data
    try {
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        questions = await response.json();
        questionsLoaded = true;
    } catch (error) {
        console.error('Error refreshing questions:', error);
        alert(`Error refreshing questions: ${error.message}`);
    }

    currentAdminQuestionIndex = -1;
    // Clear highlighting
    const active = document.querySelector('.admin-list-item.active');
    if(active) active.classList.remove('active');

    document.getElementById('edit-question-id').value = 'new';
    quillQuestionEditor.root.innerHTML = '';
    quillExplanationEditor.root.innerHTML = '';
    adminOptionsContainer.innerHTML = '';

    // Add 4 empty options by default
    for(let i=0; i<4; i++) addOptionInput('');

    editCorrectAnswersInput.value = '';
    deleteQuestionBtn.style.display = 'none';
}

function addOptionInput(value) {
    const row = document.createElement('div');
    row.className = 'admin-option-row';
    
    // Calculate letter based on current number of options
    const letter = String.fromCharCode(65 + adminOptionsContainer.children.length);
    
    row.innerHTML = `
        <span>${letter}</span>
        <input type="text" class="admin-option-input" value="${(value || '').replace(/"/g, '&quot;')}" placeholder="Option text">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeOptionInput(this)">X</button>
    `;
    adminOptionsContainer.appendChild(row);
}

// Define global wrapper for onclick handler in string HTML above
window.removeOptionInput = function(btn) {
    btn.parentElement.remove();
    // Re-label options A, B, C...
    const rows = document.querySelectorAll('.admin-option-row');
    rows.forEach((row, index) => {
        row.querySelector('span').textContent = String.fromCharCode(65 + index);
    });
}

async function saveAdminQuestion(e) {
    e.preventDefault();

    const text = quillQuestionEditor.root.innerHTML;
    const explanationRaw = quillExplanationEditor.root.innerHTML;

    // Convert explanations back to array of paragraphs for consistency with original JSON style,
    // although string with <br> is also fine. Let's keep it simple: array with one string containing HTML.
    const explanation = [explanationRaw];

    const optionInputs = Array.from(document.querySelectorAll('.admin-option-input'));
    const options = optionInputs.map(input => input.value);

    const correctInput = editCorrectAnswersInput.value;
    const correctAnswers = correctInput.split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n));

    if (correctAnswers.length === 0) {
        alert('Please specify at least one correct answer index (e.g., 0 for A).');
        return;
    }

    // Validation: check if indices are within options range
    if (correctAnswers.some(idx => idx < 0 || idx >= options.length)) {
        alert(`Correct answer index must be between 0 and ${options.length - 1}.`);
        return;
    }

    const questionData = {
        text,
        options,
        correctAnswers,
        explanation
    };

    try {
        if (currentAdminQuestionIndex === -1) {
            // Create new question
            const response = await fetch(`${API_BASE_URL}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });

            if (!response.ok) {
                throw new Error(`Failed to save question: ${response.status}`);
            }

            const savedQuestion = await response.json();
            // Add to local questions array for immediate UI update
            questions.push(savedQuestion);
            currentAdminQuestionIndex = questions.length - 1;

            alert('New question saved successfully!');
        } else {
            // Update existing question
            const questionId = questions[currentAdminQuestionIndex].id;
            const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });

            if (!response.ok) {
                throw new Error(`Failed to update question: ${response.status}`);
            }

            const updatedQuestion = await response.json();
            // Update local questions array
            questions[currentAdminQuestionIndex] = updatedQuestion;

            alert('Question updated successfully!');
        }

        // Refresh the admin list
        renderAdminList(adminSearchInput.value);
        loadAdminQuestion(currentAdminQuestionIndex);
    } catch (error) {
        console.error('Error saving question:', error);
        alert(`Error saving question: ${error.message}`);
    }
}

async function deleteCurrentQuestion() {
    if (currentAdminQuestionIndex === -1) return;

    const question = questions[currentAdminQuestionIndex];
    if (confirm(`Are you sure you want to delete question ${question.id}: "${question.text.substring(0, 50)}..."?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/questions/${question.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete question: ${response.status}`);
            }

            // Remove from local questions array
            questions.splice(currentAdminQuestionIndex, 1);

            // Reload the admin panel
            initNewQuestion();
            renderAdminList(adminSearchInput.value);

            alert('Question deleted successfully!');
        } catch (error) {
            console.error('Error deleting question:', error);
            alert(`Error deleting question: ${error.message}`);
        }
    }
}

function generateNewId() {
    if (questions.length === 0) return 1;
    // Find the highest existing ID
    const maxId = Math.max(...questions.map(q => q.id));
    return maxId + 1;
}


// Backup questions to a JSON file
async function backupQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/backup`);
        if (!response.ok) {
            throw new Error(`Failed to create backup: ${response.status}`);
        }

        const questions = await response.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `questions-backup-${new Date().toISOString().slice(0, 19)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        alert(`Backup created successfully! ${questions.length} questions exported.`);
    } catch (error) {
        console.error('Error creating backup:', error);
        alert(`Error creating backup: ${error.message}`);
    }
}

// Handle restore file selection
async function handleRestoreFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        return;
    }

    const confirmRestore = confirm('This will replace all current questions with the backup data. Continue?');
    if (!confirmRestore) {
        event.target.value = ''; // Reset file input
        return;
    }

    try {
        const text = await file.text();
        const questions = JSON.parse(text);

        if (!Array.isArray(questions)) {
            throw new Error('Invalid backup file format');
        }

        // Send the questions to the API for restore
        const response = await fetch(`${API_BASE_URL}/api/restore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questions)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to restore: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);

        // Optionally refresh the admin panel
        await openAdminPanel();

    } catch (error) {
        console.error('Error restoring questions:', error);
        alert(`Error restoring questions: ${error.message}`);
    } finally {
        event.target.value = ''; // Reset file input
    }
}

// Init on load
document.addEventListener('DOMContentLoaded', init);