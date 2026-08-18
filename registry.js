/**
 * QUIZ REGISTRY
 * -------------
 * This is the single place you touch when adding a new quiz.
 * The sidebar menu is generated from this list automatically —
 * you never need to edit index.html again.
 *
 * Fields:
 *   id       - must match the quiz's own "id" inside its JSON/HTML file
 *   title    - text shown in the sidebar
 *   type     - "multiple-choice" | "drag-drop" | "hotspot"
 *   file     - path to the quiz's content file
 *              multiple-choice quizzes are .json (rendered by a shared template)
 *              drag-drop / hotspot quizzes are .html (custom fragments, since
 *              their layouts vary too much for a single template)
 *   disabled - true = show in menu but not clickable ("Coming Soon")
 *
 * To add a new multiple-choice quiz:
 *   1. Duplicate /quizzes/quiz-01.json, edit the questions.
 *   2. Add one entry below pointing to it.
 *
 * To add a new drag-drop or hotspot quiz:
 *   1. Build an HTML fragment in /quizzes/ (see quiz-03.html for the pattern).
 *   2. Add one entry below pointing to it.
 */

const QUIZ_REGISTRY = [
  { id: 'quiz-01', title: 'Quiz 01', type: 'interactive', file: 'quizzes/quiz-001-radar_range_equation/quiz-001-radar_range_equation.html' },
  { id: 'quiz-02', title: 'Quiz 02', type: 'multiple-choice', file: 'quizzes/quiz-02-sample.json', disabled: true },
  { id: 'quiz-03', title: 'Quiz 03', type: 'drag-drop', file: 'quizzes/quiz-03.html', disabled: true },
  { id: 'quiz-04', title: 'Quiz 04', type: 'hotspot', file: 'quizzes/quiz-04.html', disabled: true },
  { id: 'quiz-05', title: 'Quiz 05', type: 'multiple-choice', file: 'quizzes/quiz-05.json', disabled: true },
  { id: 'quiz-06', title: 'Quiz 06', type: 'multiple-choice', file: 'quizzes/quiz-06.json', disabled: true },
  { id: 'quiz-07', title: 'Quiz 07', type: 'multiple-choice', file: 'quizzes/quiz-07.json', disabled: true },
  { id: 'quiz-08', title: 'Quiz 08', type: 'multiple-choice', file: 'quizzes/quiz-08.json', disabled: true },
];
