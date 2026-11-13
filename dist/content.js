export const profile = {
  name: "Demo Student", matric: "STUDENT-ID", organisation: "Training Organisation",
  location: "Training location", address: "Organisation address", dates: "Training dates", duration: "Training duration",
};

export const topics = [
  {
    id: "html", title: "HTML", icon: "code", tone: "amber",
    summary: "Semantic structure, accessible forms, and tables.",
    introduction: "HTML describes the structure and meaning of a page. A defensible design uses an element that matches the purpose of its content.",
    points: [
      ["Document structure", "Use meaningful landmarks such as header, nav, main, and footer. Use headings in a logical hierarchy."],
      ["Forms", "Associate a visible label with each control. A required attribute provides basic browser validation."],
      ["Tables and images", "Use tables for tabular data and identify headers with th. Provide a text alternative for informative images."],
    ],
    exampleTitle: "Labelled training entry field", language: "HTML",
    code: `<main>
  <h1>Training entry</h1>
  <form>
    <label for="entry-title">Activity title</label>
    <input id="entry-title" name="title" required>
    <button type="submit">Save entry</button>
  </form>
</main>`,
    explanation: "The label’s for attribute matches the input’s id, so browsers and assistive technology can identify the field.",
    question: "html-semantic",
  },
  {
    id: "css", title: "CSS", icon: "palette", tone: "sky",
    summary: "The box model, selectors, and responsive layouts.",
    introduction: "CSS controls how elements appear and how they are laid out. Start with the applied rule, the available space, and the element’s computed size when debugging.",
    points: [
      ["Box model", "An element’s box has content, padding, border, and margin. With border-box, a declared width includes padding and border."],
      ["Cascade", "The cascade resolves competing declarations. Specificity and source order matter when earlier cascade criteria are equal."],
      ["Responsive layout", "Use flexible lengths and Flexbox or Grid. Add media queries where content benefits from a different layout."],
    ],
    exampleTitle: "Responsive logbook grid", language: "CSS",
    code: `* { box-sizing: border-box; }

.entries {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 48rem) {
  .entries {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}`,
    explanation: "The grid begins with one column and switches to two equal columns at 48 rem. The gap controls the space between entries.",
    question: "css-box",
  },
  {
    id: "tailwind", title: "Tailwind CSS", icon: "layers", tone: "teal",
    summary: "Utility classes, variants, and mobile-first breakpoints.",
    introduction: "Tailwind CSS provides small utility classes for styling elements directly in markup. This section supplements the placement topics recorded in your report.",
    points: [
      ["Utilities", "Combine classes such as p-4, rounded-lg, and text-sm to control spacing, shape, and typography."],
      ["Responsive variants", "Unprefixed utilities apply at all widths unless overridden. A variant such as md: applies at its breakpoint and above."],
      ["State and reuse", "Variants such as hover: and focus-visible: style interaction states. Extract recurring markup into a reusable component where appropriate."],
    ],
    exampleTitle: "Utility-based responsive grid", language: "HTML",
    code: `<section class="grid grid-cols-1 gap-4 md:grid-cols-2">
  <article class="rounded-lg border p-4">HTML practice</article>
  <article class="rounded-lg border p-4">Python practice</article>
</section>`,
    explanation: "In a Tailwind-enabled project, the layout starts with one column and uses two at the configured md breakpoint.",
    question: "tailwind-responsive",
  },
  {
    id: "bootstrap", title: "Bootstrap", icon: "grid", tone: "lavender",
    summary: "The responsive grid, components, and accessibility.",
    introduction: "Bootstrap supplies a responsive grid, utility classes, and styled components. The grid is based on 12 columns and uses a mobile-first approach.",
    points: [
      ["Grid structure", "Place columns in rows within a container. A class such as col-md-6 occupies six of twelve columns from the md breakpoint."],
      ["Components", "Cards, alerts, navigation bars, and modals provide consistent patterns. Interactive components such as modals use Bootstrap’s JavaScript."],
      ["Accessibility checks", "Use real buttons for actions, explicit form labels, and meaningful headings. Verify keyboard behavior when assembling components."],
    ],
    exampleTitle: "Two responsive Bootstrap columns", language: "HTML",
    code: `<div class="container">
  <div class="row g-3">
    <div class="col-12 col-md-6">Web development</div>
    <div class="col-12 col-md-6">Python programming</div>
  </div>
</div>`,
    explanation: "With Bootstrap’s stylesheet loaded, both columns are full width on small screens and half width from md upward.",
    question: "bootstrap-grid",
  },
  {
    id: "python", title: "Python", icon: "terminal", tone: "amber",
    summary: "Control flow, functions, lists, and file handling.",
    introduction: "Python uses indentation to define blocks. For a short exercise, state the inputs, show the processing steps, and explain the expected result and one edge case.",
    points: [
      ["Input and types", "input() returns a string. Convert it with int() or float() when numerical work is required and handle invalid values."],
      ["Control flow and functions", "Use conditions for decisions and loops for repetition. A function groups operations and can return a result for another part of the program."],
      ["Files", "Use with open(...) to close a file reliably. Append mode preserves existing lines, and read mode loads existing data."],
    ],
    exampleTitle: "Append a validated diary note", language: "Python",
    code: `def add_note(note, path="training_diary.txt"):
    cleaned = note.strip()
    if not cleaned:
        return False

    with open(path, "a", encoding="utf-8") as diary:
        diary.write(cleaned + "\\n")
    return True`,
    explanation: "A blank note is rejected before the file is opened. Append mode writes a new line at the end of the file.",
    question: "python-file",
  },
  {
    id: "github", title: "Git & GitHub", icon: "branch", tone: "teal",
    summary: "Staging, commits, branches, and remote collaboration.",
    introduction: "Git tracks source changes. GitHub hosts Git repositories and supports collaboration through pull requests. This section supplements the placement topics recorded in your report.",
    points: [
      ["Inspect and stage", "Use git status and git diff to inspect changes. git add selects the content to include in the next commit."],
      ["Commit and push", "A commit records a local snapshot with a message. A push sends the branch’s commits to a configured remote."],
      ["Branches and review", "A branch isolates work. A pull request proposes merging a branch and provides a place for review and discussion."],
    ],
    exampleTitle: "Commit a change on a feature branch", language: "Shell",
    code: `git switch -c improve-logbook-form
git status
git diff
git add index.html
git diff --staged
git commit -m "Improve logbook form labels"
git push -u origin improve-logbook-form`,
    explanation: "Run these commands in a Git repository with a configured origin and push access. After the push, open a pull request in GitHub if the project uses branch review.",
    question: "git-workflow",
  },
];

export const slides = [
  {
    id: "intro", title: "Introduction and objectives", time: "0:30",
    purpose: "Introduce yourself and explain the purpose of the presentation.",
    points: [
      `${profile.name} · ${profile.matric} · 400 Level Computer Science · AFIT Kaduna.`,
      "Expand SIWES as Students’ Industrial Work Experience Scheme.",
      "State the placement, the main learning areas, and the project you will demonstrate.",
    ],
    cue: "I will summarise my training at the training organisation, explain one example from each main learning area, and demonstrate the Fieldwork digital logbook.",
  },
  {
    id: "placement", title: "Placement at the training organisation", time: "1:00",
    purpose: "Establish where the training took place and what you worked on.",
    points: [
      `the training organisation, ${profile.address}.`,
      `${profile.dates}, covering ${profile.duration}.`,
      "Summarise HTML, CSS, Bootstrap, and Python as the areas documented in the report. Choose one activity you can verify in your logbook.",
    ],
    cue: "The placement helped me connect page structure, responsive design, and basic programming to practical exercises.",
  },
  {
    id: "frontend", title: "Frontend development", time: "1:15",
    purpose: "Explain a web example in terms of structure, layout, and accessibility.",
    points: [
      "Show a semantic HTML section or labelled form and explain why those elements were chosen.",
      "Identify the CSS layout rule and demonstrate a narrow-screen and a wide-screen view.",
      "Explain a Bootstrap grid class. Prepare a Tailwind comparison as a possible follow-up question.",
    ],
    cue: "On a narrow screen the columns stack. At the selected breakpoint the grid places the two sections side by side.",
  },
  {
    id: "python", title: "Python programming", time: "1:15",
    purpose: "Trace the input, processing, and result of one Python exercise.",
    points: [
      "Use either the score analyser or the training diary from the report.",
      "Point to one function, one control-flow decision, and the value returned or written.",
      "Trace one normal input and one edge case, such as an empty score list or blank note.",
    ],
    cue: "For the score analyser, I first check that the list contains scores. I then calculate the count, total, and mean.",
  },
  {
    id: "fieldwork", title: "Fieldwork demonstration", time: "2:00",
    purpose: "Show the logbook and explain how an entry moves through the application.",
    points: [
      "Describe the project as a digital SIWES logbook developed with assistance. State the work you personally carried out.",
      "Show the student profile, logbook entries, and recorded-hours summary.",
      "Trace the React and TypeScript interface, the server-side ownership check, and the Cloudflare D1 record store.",
      "Demonstrate a sample entry, the new hours total, and the saved entry after reloading if you have owner access.",
    ],
    cue: "The interface submits the entry to the server. The server checks ownership, saves a valid record, and the page updates the hours total from the saved entries.",
  },
  {
    id: "testing", title: "Testing and challenges", time: "1:15",
    purpose: "Explain how you checked that an example worked and what you learned when it failed.",
    points: [
      "State the input, expected result, and observed result for a check you actually carried out.",
      "Describe one genuine issue, how you reproduced it, what you changed, and how you verified the fix.",
      "For Fieldwork, be ready to discuss validation, access control, and persistence after a refresh.",
    ],
    cue: "Give the panel the test input, your expected result, and what you observed. Show supporting evidence if available.",
  },
  {
    id: "closing", title: "Conclusion and questions", time: "0:45",
    purpose: "Summarise what the placement contributed to your Computer Science studies.",
    points: [
      "Name one practical web development skill and one Python skill you can now demonstrate.",
      "Identify one next step for your work, such as broader interface testing or better validation feedback.",
      "Thank the panel and invite questions.",
    ],
    cue: "The placement gave me practice building responsive pages and tracing small programs. I am ready to answer your questions.",
  },
];

export const categories = [
  { id: "placement", name: "the organisation placement", tone: "amber", icon: "building" },
  { id: "html", name: "HTML", tone: "amber", icon: "code" },
  { id: "css", name: "CSS", tone: "sky", icon: "palette" },
  { id: "tailwind", name: "Tailwind CSS", tone: "teal", icon: "layers" },
  { id: "bootstrap", name: "Bootstrap", tone: "lavender", icon: "grid" },
  { id: "python", name: "Python", tone: "amber", icon: "terminal" },
  { id: "github", name: "Git & GitHub", tone: "teal", icon: "branch" },
  { id: "project", name: "Fieldwork project", tone: "sky", icon: "folder" },
  { id: "panel", name: "General defense", tone: "lavender", icon: "messages" },
];

const prompts = [
  ["placement-purpose", "placement", "What is SIWES, and why was it relevant to your degree?",
    "SIWES is the Students’ Industrial Work Experience Scheme. It connects academic study with practical work. At the organisation, I applied introductory web development and Python concepts through structured practice."],
  ["placement-scope", "placement", "Where did you undertake your training, and what did it cover?",
    "I trained at the training organisation on the training organisation address, from the agreed training period. My report covers HTML, CSS, Bootstrap, and introductory Python."],
  ["placement-outcome", "placement", "Which skill improved most during your placement?",
    "Name one skill and support it with a specific example from your own work. Describe what you could do by the end of the placement and how you checked the result."],
  ["html-semantic", "html", "What is semantic HTML, and why does it matter?",
    "Semantic elements describe their role. For example, main identifies the principal content and nav identifies navigation. Meaningful structure helps assistive technology interpret the page and makes the markup easier to maintain."],
  ["html-form", "html", "How do you make an HTML form field accessible?",
    "Give the control a visible label and associate it by matching the label’s for attribute to the input’s id. Use an appropriate input type and provide clear, associated error feedback."],
  ["html-table", "html", "When would you use an HTML table?",
    "Use a table for related data arranged in rows and columns, such as logbook dates and hours. A caption gives context and header cells identify the meaning of each row or column."],
  ["css-box", "css", "Explain the CSS box model.",
    "From the inside out, an element has content, padding, a border, and margin. With box-sizing set to border-box, the declared width includes padding and border. Margin remains outside that width."],
  ["css-layout", "css", "When would you choose Flexbox or CSS Grid?",
    "Flexbox works well for layout primarily along one axis, such as a navigation row. Grid is useful when rows and columns must work together, such as a dashboard card layout."],
  ["css-debug", "css", "How would you investigate a CSS rule that has no visible effect?",
    "Verify the stylesheet loaded and the selector matches. Inspect computed styles to find an override or an invalid declaration. Change one thing at a time and confirm the result in the browser."],
  ["tailwind-responsive", "tailwind", "How do responsive utilities work in Tailwind CSS?",
    "Tailwind uses mobile-first variants. A class such as grid-cols-1 provides the base layout. The md:grid-cols-2 variant overrides it at the configured md breakpoint and above."],
  ["tailwind-compare", "tailwind", "How do Tailwind CSS and Bootstrap differ?",
    "Tailwind provides composable utility classes for building custom interfaces. Bootstrap provides utilities and a set of styled components and layout conventions. The choice depends on the desired design and how much of the interface you want to assemble yourself."],
  ["bootstrap-grid", "bootstrap", "Explain the Bootstrap grid using col-12 and col-md-6.",
    "Bootstrap divides a row into 12 columns. col-12 spans the whole row. col-md-6 overrides that span to six columns from the md breakpoint upward, allowing two equal-width columns."],
  ["bootstrap-component", "bootstrap", "What should you check before using a Bootstrap modal in a project?",
    "Load the required Bootstrap JavaScript, give the modal an accessible title, and test keyboard focus, closing behavior, and the trigger that opens it."],
  ["python-input", "python", "Why must Python input often be converted before arithmetic?",
    "input() returns a string. Convert it with int() or float() when you expect a number. Handle ValueError when the text cannot be converted and check the accepted range separately."],
  ["python-function", "python", "Why use a function in the score analyser?",
    "A function separates the calculation from input and display. It can return a result for the caller and can be tested independently with a normal list and an empty list."],
  ["python-file", "python", "How did the training diary store notes between runs?",
    "The Python example removes leading and trailing whitespace and rejects blank notes. It uses a context manager and append mode to write valid notes to a text file. A later run can open the same file in read mode."],
  ["python-empty", "python", "What happens if the score analyser receives an empty list?",
    "It should return an empty result or a clear message before calculating the mean. Dividing by len(scores) when the list is empty raises ZeroDivisionError."],
  ["git-workflow", "github", "Explain the workflow from editing a file to pushing it to GitHub.",
    "Inspect the changes with git status and git diff. Stage the intended file with git add, record a local commit with git commit, then push the branch’s commits to the configured remote."],
  ["git-branch", "github", "What is the purpose of a branch and a pull request?",
    "A branch isolates a line of development. A pull request proposes integrating changes into another branch and gives collaborators a place to inspect, discuss, and approve them."],
  ["project-purpose", "project", "What problem does Fieldwork address?",
    "Fieldwork brings a student profile, dated training entries, and a recorded-hours summary together in a digital SIWES logbook. It was developed with assistance as a demonstration project. Explain your own contribution with a specific example."],
  ["project-storage", "project", "What happens after the owner submits a Fieldwork entry?",
    "The React and TypeScript interface sends the entry to server code. The server checks ownership and validates the request before writing to Cloudflare D1. The interface shows the saved entries and calculates recorded hours from them."],
  ["project-access", "project", "Why does Fieldwork check ownership on the server?",
    "The server is responsible for deciding whether a write may change the records. Hiding editing controls helps the interface, but the server must independently verify that the signed-in user is the owner before saving."],
  ["project-tests", "project", "How would you test that a Fieldwork entry was saved correctly?",
    "Record the current hours, save a clearly identified sample entry as the owner, and reload the page. Check that the entry persists and the total increases by the entry’s hours. Record the expected and observed results."],
  ["panel-challenge", "panel", "Describe one challenge you faced and how you resolved it.",
    "Choose a real issue from your training or project. Explain what you observed, how you isolated the cause, what you changed, and the result of repeating the test."],
];

export const questions = prompts.map(([id, category, question, answer]) => ({
  id, category, question, answer,
}));

export const scoreExample = `def summarise_scores(scores):
    if not scores:
        return None

    total = sum(scores)
    return {
        "count": len(scores),
        "total": total,
        "average": total / len(scores),
    }

scores = [35, 48, 41, 52, 26, 28]
summary = summarise_scores(scores)
if summary is None:
    print("No scores to summarise.")
else:
    print(f"Count: {summary['count']}")
    print(f"Total: {summary['total']}")
    print(f"Average: {summary['average']:.2f}")`;
