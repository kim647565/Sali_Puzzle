# MASTER DEVELOPMENT PROMPT — SALI PUZZLE

## Run and verify the app

Use Node.js 24 for the automated SQLite tests and an Android emulator or phone with Expo Go for SDK 58. Use the matching Expo SDK when building the standalone app. [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)

```sh
npm ci
npm run start
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo export --platform android
```

Use **View records** in the app to export a player's attempt history as a CSV through Android’s share sheet. Each valid straight-line Word Hunt submission and each fully filled crossword submission counts toward accuracy. Hints, incomplete entries, and duplicate discoveries leave accuracy unchanged.

For an installable APK, run `npx eas-cli build --platform android --profile preview`. Use `--profile production` for a Play Store app bundle. To build on a configured Android workstation, run `npx expo run:android --variant release` with the Android SDK required by Expo SDK 58. Test offline behavior using a standalone Android build in airplane mode. [Build APKs for Android emulators and devices](https://docs.expo.dev/build-reference/apk/)

## ROLE AND OBJECTIVE

Act as a Senior React Native Developer, Mobile Game Developer, Software Architect, UI/UX Designer, Educational Technology Specialist, Database Engineer, and Quality Assurance Engineer.

Your task is to **design, architect, develop, test, and document a complete, production-ready offline educational mobile game called SALI PUZZLE**.

Build a real, functional application—not just UI mockups, placeholder screens, or demonstration code.

The application must be developed using **React Native, Expo, and TypeScript**, optimized primarily for Android devices.

Follow modern software engineering principles, clean architecture, reusable components, type safety, maintainable code, responsive layouts, accessibility standards, and offline-first design.

Implement all core features end-to-end.

---

# 1. PROJECT OVERVIEW

**Application Name:** SALI PUZZLE

**Application Type:** Offline Educational Mobile Puzzle Game

**Target Platform:** Android

**Primary Framework:** React Native with Expo

**Programming Language:** TypeScript

**Target Users:** Students and learners

**Primary Objective:**

Develop an engaging educational game that combines lesson-based learning, Word Hunt puzzles, Crossword puzzles, progressive levels, immediate answer feedback, and student performance tracking.

The application must work without an internet connection after installation.

## Core Learning Experience

The application follows this learning sequence:

**LEARN → HUNT → SOLVE → EVALUATE → UNLOCK**

1. LEARN: Students study a lesson.
2. HUNT: Students find lesson-related words in a letter grid.
3. SOLVE: Students use discovered words to complete a crossword puzzle.
4. EVALUATE: The application calculates scores and performance.
5. UNLOCK: The next level becomes accessible after successful completion.

The application should make learning enjoyable while supporting measurable student progress.

---

# 2. REQUIRED TECHNOLOGY STACK

Use the following technologies:

| Technology | Purpose |
|---|---|
| React Native | Mobile application framework |
| Expo | Development and build environment |
| TypeScript | Type-safe application development |
| Expo Router | File-based navigation |
| React Native Gesture Handler | Touch and swipe gestures |
| React Native Reanimated | Smooth gameplay animations |
| React Native SVG | Word-selection lines and custom graphics |
| Zustand | Application and game state management |
| Expo SQLite | Persistent offline database |
| Expo Audio | Sound effects and background music |
| Expo FileSystem | Exporting player records |
| Expo Sharing | Sharing exported records |
| Expo Haptics | Optional tactile feedback |
| Expo Linear Gradient | Visual gradients |
| Expo Font | Custom typography |
| Jest | Unit testing |
| React Native Testing Library | Component testing |
| EAS Build | Android APK/AAB generation |

Use compatible, stable package versions supported by the selected Expo SDK.

Do not introduce unnecessary dependencies.

Do not use Firebase, Supabase, or a remote backend for core functionality.

---

# 3. UI/UX DESIGN SYSTEM

Create a modern, colorful, playful, polished, and student-friendly mobile game interface.

The application must feel like a complete educational game rather than a conventional management system.

## Visual Direction

- Friendly educational design
- Rounded cards and buttons
- Soft shadows
- Smooth animations
- Clear visual hierarchy
- Colorful puzzle tiles
- Consistent spacing
- Large readable typography
- Responsive layouts
- Accessible contrast
- Touch-friendly controls
- Appropriate feedback animations
- Engaging but not distracting visuals

Avoid cluttered screens and excessive animations.

## Color Palette

Primary Indigo: `#6366F1`

Secondary Teal: `#14B8A6`

Accent Yellow: `#FBBF24`

Error Coral: `#F87171`

Background: `#F8FAFC`

Dark Text: `#1E293B`

White: `#FFFFFF`

Success Green: `#22C55E`

Locked Gray: `#94A3B8`

## Typography

Headings: Poppins Bold

Body Text: Nunito Regular

Buttons: Poppins SemiBold

Puzzle Letters: Poppins Bold

Use consistent typography throughout the application.

## Design Requirements

Implement:

- Reusable Button components
- Reusable Cards
- Modal dialogs
- Toast notifications
- Progress bars
- Level cards
- Puzzle letter tiles
- Score displays
- Loading states
- Empty states
- Confirmation dialogs
- Success and failure indicators
- Accessible icons
- Consistent screen transitions

Use a centralized design token system for colors, typography, spacing, shadows, and border radii.

---

# 4. APPLICATION SCREENS

Implement the following screens with complete functionality.

## SCREEN 1 — SPLASH SCREEN

Create an animated splash screen containing:

- SALI PUZZLE logo
- Application name
- Tagline: "Learn. Hunt. Solve."
- Subtle puzzle-themed animation

Initialize the offline database during application startup.

Check whether a player profile already exists.

Navigate to the appropriate screen.

## SCREEN 2 — NICKNAME LOGIN

Implement an offline nickname-based player system.

Features:

- Enter nickname
- Create player profile
- Select existing player
- Switch between players
- Validate nickname
- Prevent empty nicknames
- Prevent duplicate nicknames using case-insensitive comparison
- Persist player information locally
- Automatically restore the last active player

Do not require:

- Email
- Password
- Internet connection
- Online authentication

Each player must have a unique internal ID.

Nickname login is a local profile-selection mechanism, not secure authentication.

Ensure each player's scores and progress remain separate.

## SCREEN 3 — HOME PAGE

Create an attractive game dashboard.

Include:

- Personalized welcome message
- Player nickname
- SALI PUZZLE branding
- Play Now button
- Continue Playing button
- Lessons button
- Level Selection button
- How to Play button
- Records button
- Settings button
- Current level indicator
- Overall progress bar
- Completed level count
- Total points earned
- Offline availability indicator

Use colorful educational illustrations and puzzle-themed elements.

All buttons must navigate to working screens.

## SCREEN 4 — HOW TO PLAY

Develop an interactive tutorial explaining:

1. How to select a lesson
2. How to play Word Hunt
3. How to swipe across letters
4. How to identify correct words
5. How to use discovered words in Crossword
6. How to answer crossword clues
7. How to earn points
8. How to use hints
9. How to complete a level
10. How to unlock the next level

Use illustrations, animated demonstrations, and simple instructions.

Provide Next, Previous, Skip, and Finish controls.

Save tutorial completion status locally.

## SCREEN 5 — LEVEL SELECTION

Implement a progressive level selection system.

Each level must have one of these states:

- LOCKED
- UNLOCKED
- IN_PROGRESS
- COMPLETED

Rules:

- Level 1 is unlocked by default.
- Level 2 unlocks only after Level 1 is completed.
- Level 3 unlocks only after Level 2 is completed.
- Apply the same rule to all subsequent levels.
- Players cannot bypass locked levels through navigation or direct routes.
- Previously completed levels remain replayable.
- Progress is stored separately for each player.
- Restarting the application must not reset progress.

Display:

- Level number
- Level title
- Lock icon
- Completion status
- Earned stars
- Best score
- Current progress

Implement at least 10 playable levels using editable local content.

## SCREEN 6 — LESSON SPACE

Each level must contain an educational lesson.

Display:

- Lesson title
- Learning objectives
- Topic introduction
- Main discussion
- Important vocabulary
- Word definitions
- Examples
- Optional local illustrations
- Lesson summary

Include:

- Next section
- Previous section
- Start Word Hunt
- Back to Levels

Store lesson content locally.

Lessons must be accessible offline.

Use structured lesson data so new lessons can be added without modifying the core application logic.

## SCREEN 7 — WORD HUNT GAME

Develop a fully functional Word Search puzzle engine.

### Gameplay

Display a grid of letters containing hidden target words.

The player must find the words by swiping across consecutive letters.

Support:

- Horizontal words
- Vertical words
- Diagonal words
- Forward words
- Reverse words

Enable directions according to difficulty.

### Grid Sizes

Easy: 5×5

Medium: 8×8

Hard: 12×12

Allow grid dimensions to be configured per level.

### Word Hunt Engine

Implement:

- Word placement algorithm
- Grid generation
- Word overlap handling
- Random filler letters
- Valid word paths
- Collision detection
- Touch coordinate mapping
- Swipe direction validation
- Selected letter highlighting
- Word recognition
- Duplicate discovery prevention
- Puzzle completion detection

### Word Selection

When the player touches a letter:

1. Begin selection.
2. Track finger movement.
3. Determine a valid straight-line path.
4. Highlight selected cells.
5. Display a selection line.
6. Validate the selected word on release.
7. Provide immediate feedback.

Ensure the selection remains accurate across different Android screen sizes.

### Correct Word Feedback

When a valid target word is found:

- Highlight the word permanently.
- Display a success animation.
- Play a positive sound.
- Provide optional haptic feedback.
- Add the word to the discovered list.
- Update the score.
- Update the progress indicator.

### Incorrect Word Feedback

When an incorrect selection is made:

- Display a temporary red highlight.
- Show "Try Again!"
- Play an optional error sound.
- Increment the wrong-attempt counter.
- Clear the temporary selection.

Do not permanently mark incorrect selections.

### Word Hunt HUD

Display:

- Current level
- Target word list
- Found word count
- Current score
- Timer
- Hint button
- Pause button
- Progress indicator

### Hints

Provide configurable hints that reveal the starting letter or location of an undiscovered word.

Track hint usage.

Prevent hints from incorrectly marking words as completed.

### Completion

The Word Hunt stage is completed only when all required words have been discovered.

After completion, unlock the Crossword stage within the same level.

---

# 5. CROSSWORD PUZZLE ENGINE

Develop a functional Crossword Puzzle integrated with the Word Hunt stage.

## Core Mechanic

Words discovered in Word Hunt become available in a word bank.

The player must use those words to solve crossword clues related to the lesson.

Example:

Lesson: Parts of a Plant

Discovered Words:

- ROOT
- STEM
- LEAF
- FLOWER

Crossword Clues:

1. Absorbs water from the soil — ROOT
2. Supports the plant — STEM
3. Makes food through photosynthesis — LEAF
4. Produces seeds in flowering plants — FLOWER

## Crossword Features

Implement:

- Crossword grid rendering
- Numbered clues
- Across clues
- Down clues
- Shared intersecting cells
- Word bank
- Cell selection
- Letter input
- Answer validation
- Correct answer feedback
- Incorrect answer feedback
- Completion tracking
- Score calculation
- Hint system
- Responsive keyboard handling

Use predefined, validated crossword layouts for the initial release.

Every crossword layout must have:

- Valid intersections
- Consistent clue numbering
- Correct answer lengths
- No conflicting letters
- At least one valid solution

Provide development-time validation utilities for crossword data.

## Crossword Rules

- Crossword unlocks after Word Hunt completion.
- The player must answer all required clues correctly.
- Incorrect answers must not complete a clue.
- Previously solved clues remain visible.
- Completed crossword answers should use success styling.
- The player cannot complete the level without finishing both puzzle stages.

---

# 6. LEVEL PROGRESSION SYSTEM

Implement the following state transitions:

LOCKED → UNLOCKED → IN_PROGRESS → COMPLETED

Each level contains:

1. Lesson
2. Word Hunt
3. Crossword
4. Results

Completion conditions:

- All required Word Hunt words discovered.
- All required Crossword clues correctly answered.
- Final score calculated.
- Performance record saved.
- Next level unlocked.

The completion operation must be atomic and idempotent.

Prevent duplicate completion rewards.

Ensure navigation cannot bypass stage requirements.

Support replaying completed levels without deleting historical results.

---

# 7. SCORING AND PERFORMANCE SYSTEM

Implement a configurable scoring system.

Initial scoring rules:

- Correct Word Hunt word: +100 points
- Correct Crossword clue: +100 points
- Incorrect attempt: 0 points
- Hint usage: No additional points

Do not allow scores to become negative.

Keep scoring logic separate from UI components.

Track:

- Correct Word Hunt answers
- Incorrect Word Hunt selections
- Correct Crossword answers
- Incorrect Crossword submissions
- Total score
- Total attempts
- Hint usage
- Completion time
- Completion date
- Number of level replays

### Accuracy Formula

Accuracy = (Correct Submissions / Total Submissions) × 100

If there are no submissions, display N/A rather than dividing by zero.

Define and document what counts as a submission.

### Star Rating

Initial proposed criteria:

- 3 Stars: Accuracy ≥ 90%
- 2 Stars: Accuracy ≥ 75%
- 1 Star: Completed with accuracy below 75%

Star ratings must not prevent level progression once all required answers are correct.

---

# 8. RESULTS SCREEN

After completing a level, display:

- Congratulations message
- Completed level title
- Total score
- Star rating
- Accuracy percentage
- Correct answer count
- Wrong attempt count
- Hint usage
- Completion time
- Completion date

Include:

- Next Level
- Replay Level
- View Records
- Back to Home

Use animated stars and subtle celebration effects.

Save the results before showing the completion screen.

---

# 9. STUDENT PERFORMANCE TRACKING

Develop a complete offline record tracking system.

Each player must have independent records.

Track:

- Player nickname
- Player ID
- Level ID
- Attempt ID
- Start timestamp
- Completion timestamp
- Word Hunt score
- Crossword score
- Total score
- Correct submissions
- Incorrect submissions
- Accuracy percentage
- Completion duration
- Hints used
- Earned stars
- Completion status

## Records Dashboard

Display:

- Player profile
- Total completed levels
- Current level
- Total accumulated points
- Average accuracy
- Total playtime
- Total attempts
- Best score per level
- Level completion history

Implement a performance chart showing correct and incorrect submissions per level.

## Record History

Display individual attempts with:

- Level name
- Date
- Score
- Accuracy
- Duration
- Status

Allow users to review previous results.

## Export Records

Implement CSV export using local files and Android's share sheet.

Ensure exported records contain accurate player and attempt data.

Do not require an internet connection to generate the export.

---

# 10. OFFLINE DATABASE

Use Expo SQLite for persistent local storage.

Design a normalized relational database.

Required tables:

### players

- id
- nickname
- created_at
- last_active_at

### levels

- id
- level_number
- title
- difficulty
- grid_size
- created_at

### lessons

- id
- level_id
- title
- objectives
- content
- summary

### word_hunt_words

- id
- level_id
- word
- definition

### crossword_clues

- id
- level_id
- clue_number
- direction
- clue
- answer
- start_row
- start_column

### player_progress

- id
- player_id
- level_id
- status
- unlocked_at
- completed_at
- best_score
- best_stars

### game_attempts

- id
- player_id
- level_id
- status
- started_at
- completed_at
- word_hunt_score
- crossword_score
- total_score
- correct_answers
- wrong_attempts
- accuracy
- hints_used
- duration_seconds

### answer_logs

- id
- attempt_id
- stage
- submitted_answer
- is_correct
- created_at

Use foreign keys, indexes, migrations, and transactions.

Store level content as bundled local data and seed the database on first launch.

Do not overwrite player records when updating bundled content.

Persist in-progress game state so players can resume after the application closes.

---

# 11. SETTINGS SCREEN

Implement:

- Sound effects toggle
- Background music toggle
- Haptic feedback toggle
- Tutorial replay
- Player switching
- About SALI PUZZLE
- Application version
- Reset current puzzle
- Reset player progress with confirmation

All settings must persist locally.

Destructive operations must require explicit confirmation.

---

# 12. GAME CONTENT

Provide at least 10 fully playable demonstration levels.

Use educational themes such as:

1. Parts of a Plant
2. Animals
3. Human Body
4. Weather
5. Solar System
6. Environment
7. States of Matter
8. Geography
9. Filipino Vocabulary
10. General Science

These are temporary demonstration topics until the client supplies the final curriculum.

For every level, provide:

- Lesson title
- Learning objectives
- Educational discussion
- Vocabulary definitions
- Word Hunt word list
- Valid letter grid
- Crossword clues
- Valid crossword layout
- Difficulty configuration

All learning content must be understandable, age-appropriate, and factually correct.

Ensure Word Hunt and Crossword use the same lesson vocabulary.

Do not use empty or placeholder puzzles.

---

# 13. PROJECT ARCHITECTURE

Use a feature-oriented, maintainable architecture.

Suggested structure:

```text
salipuzzle/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── home.tsx
│   ├── instructions.tsx
│   ├── levels.tsx
│   ├── lesson/
│   │   └── [levelId].tsx
│   ├── word-hunt/
│   │   └── [levelId].tsx
│   ├── crossword/
│   │   └── [levelId].tsx
│   ├── results/
│   │   └── [attemptId].tsx
│   ├── records.tsx
│   └── settings.tsx
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── word-hunt/
│   │   ├── crossword/
│   │   ├── lessons/
│   │   └── records/
│   ├── features/
│   │   ├── players/
│   │   ├── lessons/
│   │   ├── levels/
│   │   ├── word-hunt/
│   │   ├── crossword/
│   │   └── records/
│   ├── engines/
│   │   ├── wordHuntEngine.ts
│   │   ├── crosswordEngine.ts
│   │   ├── scoringEngine.ts
│   │   └── levelEngine.ts
│   ├── database/
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── repositories/
│   ├── stores/
│   ├── hooks/
│   ├── services/
│   ├── constants/
│   ├── types/
│   └── utils/
├── assets/
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── data/
│   ├── lessons/
│   └── levels/
├── tests/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# 14. PERFORMANCE AND ACCESSIBILITY

Optimize the application for Android devices.

Requirements:

- Smooth puzzle interactions
- Efficient rendering
- Minimal unnecessary rerenders
- Reliable touch coordinate calculations
- Responsive layouts
- Support for small screens
- No horizontal screen overflow
- Safe-area support
- Proper keyboard handling
- Accessible button labels
- Readable text sizes
- Correct feedback that does not rely only on color
- Graceful handling of application interruptions
- Consistent behavior after restarting the app

Use memoization where beneficial.

Avoid excessive animations and unnecessary database operations.

---

# 15. TESTING REQUIREMENTS

Create automated tests for critical functionality.

## Unit Tests

Test:

- Word placement
- Grid generation
- Valid word selection
- Invalid word selection
- Reverse direction detection
- Duplicate word prevention
- Crossword answer validation
- Crossword layout integrity
- Scoring calculations
- Accuracy calculations
- Level unlocking
- Star rating
- Database repository operations

## Integration Tests

Test:

- Player creation
- Profile switching
- Lesson-to-game navigation
- Word Hunt completion
- Crossword unlocking
- Level completion
- Performance saving
- Progress restoration
- CSV export

## Manual Acceptance Tests

Verify:

1. The application works in airplane mode.
2. Players can log in using nicknames.
3. Different players have separate records.
4. Locked levels cannot be accessed.
5. Correct and incorrect answers display appropriate indicators.
6. Word Hunt selections work accurately.
7. Crossword clues match their answers.
8. Lessons are accessible offline.
9. Scores and records persist after restart.
10. Completed levels unlock the next level.
11. Records can be exported.
12. The application works on different Android screen sizes.

---

# 16. DEVELOPMENT EXECUTION PLAN

Work through these phases in order.

### Phase 1 — Foundation

- Initialize Expo project.
- Configure TypeScript.
- Install dependencies.
- Configure Expo Router.
- Create design system.
- Set up database.
- Implement nickname login.

### Phase 2 — Core Screens

- Splash
- Home
- Instructions
- Levels
- Lessons
- Settings

### Phase 3 — Word Hunt Engine

- Grid generator
- Word placement
- Swipe detection
- Word validation
- Correct/wrong feedback
- Hint system
- Completion detection

### Phase 4 — Crossword Engine

- Crossword grid
- Clue rendering
- Cell interaction
- Answer input
- Validation
- Word Hunt integration

### Phase 5 — Progression and Records

- Scoring
- Level unlocking
- Game attempts
- Results
- Performance dashboard
- CSV export

### Phase 6 — Polish

- Animations
- Sound effects
- Accessibility
- Responsive layouts
- Error handling
- Performance optimization

### Phase 7 — Testing and Release

- Unit tests
- Integration tests
- Offline testing
- Android build configuration
- APK generation instructions
- Final documentation

---

# 17. CODE QUALITY REQUIREMENTS

Follow these rules:

1. Use TypeScript strict mode.
2. Avoid `any` unless technically justified.
3. Use functional React components.
4. Implement reusable hooks and components.
5. Keep business logic outside presentation components.
6. Use centralized constants.
7. Validate game content.
8. Handle database errors.
9. Avoid hardcoded navigation assumptions.
10. Avoid duplicated game logic.
11. Keep player records isolated.
12. Use reliable state persistence.
13. Handle app backgrounding and restoration.
14. Avoid deprecated Expo APIs.
15. Use appropriate error boundaries.
16. Write readable, maintainable code.
17. Document complex algorithms.
18. Never fabricate test results.
19. Never claim an APK was built unless the build succeeded.
20. Do not leave essential features as TODO comments.

---

# 18. REQUIRED DELIVERABLES

Generate a complete working project containing:

- Fully configured Expo application
- All required screens
- Functional nickname-based profiles
- Offline SQLite database
- Progressive level system
- Educational lesson space
- Functional Word Hunt engine
- Functional Crossword engine
- Connected Word Hunt and Crossword gameplay
- Scoring and accuracy calculations
- Correct/wrong indicators
- Results screen
- Player performance records
- CSV export
- Settings
- At least 10 playable demonstration levels
- Automated tests
- README documentation
- Installation instructions
- Android build instructions

---

# 19. FINAL VERIFICATION

Before considering the project complete:

1. Run TypeScript type checking.
2. Run linting.
3. Run available automated tests.
4. Verify puzzle data integrity.
5. Check navigation.
6. Check database migrations.
7. Verify player data isolation.
8. Verify offline behavior.
9. Verify level progression.
10. Verify persistence after restarting.
11. Check Android build configuration.
12. Fix all discovered blocking errors.

Report actual verification results.

Clearly distinguish between completed, partially implemented, and unverified features.

---

# 20. FINAL INSTRUCTIONS TO THE AI CODING AGENT

You are responsible for implementing SALI PUZZLE as a functional Android educational game.

Do not stop after planning, generating folder structures, or creating static UI.

Write the actual source code, create the necessary files, implement game mechanics, integrate local persistence, and add tests.

If you have access to the project filesystem, create and modify files directly.

If starting from an existing project, inspect the codebase and preserve working functionality before making changes.

Use reasonable defaults for unspecified visual details.

Prioritize correctness, offline reliability, gameplay quality, and maintainability.

Do not implement unnecessary online services.

If the environment prevents a build or test, report the limitation and provide the exact command required to verify it.

**Definition of Done:**

A student can install SALI PUZZLE on an Android device, create a nickname profile, read a lesson, complete a Word Hunt puzzle, solve the connected Crossword puzzle, receive feedback and scores, unlock the next level, close and reopen the application, and view their saved performance records—all without internet access.

**BEGIN IMPLEMENTATION NOW.**
