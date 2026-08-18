/**
 * APP.JS
 * ------
 * 1. Builds the sidebar menu from QUIZ_REGISTRY (quiz-registry.js).
 * 2. Handles hash-based routing (#quiz-01 etc.) so links, back/forward,
 *    and page refresh all work.
 * 3. Loads the right quiz file and hands it to the renderer for its type.
 *
 * Adding renderers for new quiz types: see the RENDERERS object near the
 * bottom — add a new key (matching the "type" field in the registry) with
 * a function that takes (quizData, container) and fills the container.
 */

const contentArea = document.querySelector('.content-area');
const menuList = document.querySelector('.quiz-menu-list');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const menuToggle = document.getElementById('menu-toggle');

/* ---------- Build the sidebar menu from the registry ---------- */

function buildMenu() {
  menuList.innerHTML = '';
  QUIZ_REGISTRY.forEach(quiz => {
    const li = document.createElement('li');
    if (quiz.disabled) {
      li.innerHTML = `<span class="quiz-link disabled">${quiz.title} (Coming Soon)</span>`;
    } else {
      li.innerHTML = `<a href="#${quiz.id}" class="quiz-link">${quiz.title}</a>`;
    }
    menuList.appendChild(li);
  });
}

/* ---------- Routing ---------- */

function getQuizFromHash() {
  const id = window.location.hash.replace('#', '');
  return QUIZ_REGISTRY.find(q => q.id === id && !q.disabled);
}

async function loadRoute() {
  const quiz = getQuizFromHash();

  if (!quiz) {
    renderWelcome();
    closeMenu();
    return;
  }

  await loadQuiz(quiz);
  closeMenu();
}

window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', () => {
  buildMenu();
  loadRoute();
});

/* ---------- Loading + rendering a quiz ---------- */

async function loadQuiz(quiz) {
  contentArea.innerHTML = '<p class="quiz-status">Loading…</p>';

  try {
    const response = await fetch(quiz.file);
    if (!response.ok) throw new Error(`Could not load ${quiz.file}`);

    const renderer = RENDERERS[quiz.type];

    if (quiz.file.endsWith('.json')) {
      if (!renderer) throw new Error(`No renderer registered for type "${quiz.type}"`);
      const data = await response.json();
      renderer(data, contentArea);
    } else {
      const html = await response.text();
      contentArea.innerHTML = html;
      // Scripts inserted via innerHTML do NOT execute automatically —
      // recreate each <script> tag so the fragment's own JS actually runs.
      contentArea.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.replaceWith(newScript);
      });
      // HTML-fragment quizzes may define their own init function
      // (e.g. window.initQuiz03(container)) — call it if present,
      // passing the container so the quiz can scope its querySelectors
      // instead of relying on page-wide unique ids.
      const initFnName = `init${quiz.id.replace(/(^\w|-\w)/g, c => c.replace('-', '').toUpperCase())}`;
      if (typeof window[initFnName] === 'function') window[initFnName](contentArea);
    }
  } catch (err) {
    contentArea.innerHTML = `<p class="quiz-status">Sorry, this quiz couldn't be loaded.</p>`;
    console.error(err);
  }
}

function renderWelcome() {
  contentArea.innerHTML = `
    <div class="quiz-container">
      <h1>Welcome to Learning Radar</h1>
      <p>Pick a quiz from the menu to get started.</p>
    </div>
  `;
}

/* ---------- Renderers (one per quiz type) ---------- */

const RENDERERS = {
  'multiple-choice': renderMultipleChoice,
  // 'drag-drop' and 'hotspot' quizzes ship as ready-made HTML fragments
  // (see loadQuiz above), so they don't need a renderer function here.
  // If you later want a shared template for those types too, add
  // renderer functions here the same way multiple-choice does it.
};

function renderMultipleChoice(data, container) {
  let current = 0;
  const answers = new Array(data.questions.length).fill(null);

  function renderQuestion() {
    const q = data.questions[current];
    container.innerHTML = `
      <div class="quiz-container">
        <h1>${data.title}</h1>
        <p class="quiz-progress">Question ${current + 1} of ${data.questions.length}</p>
        <div class="quiz-content-area">
          <h3>${q.question}</h3>
          <ul class="options-list">
            ${q.options.map((opt, i) => `
              <li>
                <button class="btn option-btn" data-index="${i}">${opt}</button>
              </li>
            `).join('')}
          </ul>
          <p class="quiz-feedback" hidden></p>
        </div>
        <button class="btn next-btn" hidden>
          ${current === data.questions.length - 1 ? 'See Results' : 'Next Question'}
        </button>
      </div>
    `;

    const feedbackEl = container.querySelector('.quiz-feedback');
    const nextBtn = container.querySelector('.next-btn');
    const optionButtons = container.querySelectorAll('.option-btn');

    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (answers[current] !== null) return; // already answered
        const chosen = Number(btn.dataset.index);
        answers[current] = chosen;

        optionButtons.forEach(b => b.disabled = true);
        if (chosen === q.correctIndex) {
          btn.style.borderColor = 'green';
          feedbackEl.textContent = 'Correct!';
        } else {
          btn.style.borderColor = 'crimson';
          optionButtons[q.correctIndex].style.borderColor = 'green';
          feedbackEl.textContent = 'Not quite — correct answer highlighted.';
        }
        feedbackEl.hidden = false;
        nextBtn.hidden = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (current < data.questions.length - 1) {
        current++;
        renderQuestion();
      } else {
        renderResults();
      }
    });
  }

  function renderResults() {
    const score = answers.reduce(
      (total, ans, i) => total + (ans === data.questions[i].correctIndex ? 1 : 0),
      0
    );
    container.innerHTML = `
      <div class="quiz-container">
        <h1>${data.title} — Results</h1>
        <p>You scored ${score} out of ${data.questions.length}.</p>
        <button class="btn retry-btn">Try Again</button>
      </div>
    `;
    container.querySelector('.retry-btn').addEventListener('click', () => {
      current = 0;
      answers.fill(null);
      renderQuestion();
    });
  }

  renderQuestion();
}

/* ---------- Sidebar open/close (unchanged behavior, now shared) ---------- */

function openMenu() {
  sidebar.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
  overlay.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  sidebar.classList.remove('open');
  sidebar.setAttribute('aria-hidden', 'true');
  overlay.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', closeMenu);
