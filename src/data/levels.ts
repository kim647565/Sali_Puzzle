import { Level, Progress } from "../types";
import { generateGrid } from "../engines/wordHunt";
import { crosswordLayouts } from "./crosswordLayouts";
import { lessonPractice } from "./lessonPractice";

type LessonData = Omit<Level, "grid" | "clues" | "example" | "summary"> & { clues: Pick<Level["clues"][number], "number" | "clue" | "answer">[] };

const lessons: LessonData[] = [
  {
    id: "plants", number: 1, title: "Parts of a plant", topic: "Living things", difficulty: "Easy",
    lesson: "Plants are living things. Their roots take in water, stems support the plant, and leaves use sunlight to make food.",
    objectives: ["Name three plant parts", "Explain what each part does"],
    vocabulary: [
      { word: "ROOTS", definition: "Plant parts that absorb water and hold the plant in soil." },
      { word: "STEM", definition: "The part that supports the plant and carries water." },
      { word: "LEAF", definition: "The part that uses sunlight to make food." }
    ],
    huntWords: ["ROOTS", "STEM", "LEAF"],
    clues: [
      { number: 1, clue: "These absorb water from soil.", answer: "ROOTS" },
      { number: 2, clue: "It supports the plant.", answer: "STEM" },
      { number: 3, clue: "It uses sunlight to make food.", answer: "LEAF" }
    ]
  },
  {
    id: "animals", number: 2, title: "Animal adaptations", topic: "Animals", difficulty: "Easy",
    lesson: "Animals have body parts and behaviors that help them live in their habitats. These helpful traits are adaptations.",
    objectives: ["Define adaptation", "Connect traits to habitats"],
    vocabulary: [{ word: "WING", definition: "A body part used by many animals for flight." }, { word: "TAIL", definition: "A body part that can help an animal balance." }, { word: "CLAW", definition: "A sharp nail used for grasping or defense." }],
    huntWords: ["WING", "TAIL", "CLAW"],
    clues: [{ number: 1, clue: "It can help a bird fly.", answer: "WING" }, { number: 2, clue: "It can help a cat balance.", answer: "TAIL" }, { number: 3, clue: "A sharp nail on an animal.", answer: "CLAW" }]
  },
  {
    id: "body", number: 3, title: "The human body", topic: "Health", difficulty: "Easy",
    lesson: "Our body systems work together. The heart pumps blood, lungs help us breathe, and the brain processes information.",
    objectives: ["Identify body parts", "Describe one body function"],
    vocabulary: [{ word: "HEART", definition: "A muscle that pumps blood." }, { word: "LUNGS", definition: "Organs that help us breathe." }, { word: "BRAIN", definition: "The organ that helps you think and controls your movements." }],
    huntWords: ["HEART", "LUNGS", "BRAIN"],
    clues: [{ number: 1, clue: "It pumps blood.", answer: "HEART" }, { number: 2, clue: "They help you breathe.", answer: "LUNGS" }, { number: 3, clue: "It helps you think and controls your movements.", answer: "BRAIN" }]
  },
  {
    id: "weather", number: 4, title: "Weather watchers", topic: "Earth science", difficulty: "Medium",
    lesson: "Weather describes what the air is like at a place and time. Temperature, wind, clouds, and rain can change from hour to hour.",
    objectives: ["Name common weather factors", "Describe a changing sky"],
    vocabulary: [{ word: "CLOUD", definition: "A collection of tiny water drops or ice crystals in the sky." }, { word: "WIND", definition: "Moving air." }, { word: "RAIN", definition: "Water that falls from clouds." }],
    huntWords: ["CLOUD", "WIND", "RAIN"],
    clues: [{ number: 1, clue: "It floats in the sky as water drops or ice.", answer: "CLOUD" }, { number: 2, clue: "It is moving air.", answer: "WIND" }, { number: 3, clue: "It falls from clouds.", answer: "RAIN" }]
  },
  {
    id: "solar", number: 5, title: "Solar system", topic: "Space", difficulty: "Medium",
    lesson: "The Solar System includes the Sun, planets, moons, asteroids, and comets. The Sun's gravity keeps planets in orbit.",
    objectives: ["Name a planet", "Explain why planets orbit"],
    vocabulary: [{ word: "SUN", definition: "The star at the center of our Solar System." }, { word: "MOON", definition: "A natural object that orbits a planet." }, { word: "ORBIT", definition: "A repeated path around another object." }],
    huntWords: ["SUN", "MOON", "ORBIT"],
    clues: [{ number: 1, clue: "It is the star at our system's center.", answer: "SUN" }, { number: 2, clue: "It travels around a planet.", answer: "MOON" }, { number: 3, clue: "It is a repeated path.", answer: "ORBIT" }]
  },
  {
    id: "environment", number: 6, title: "Protecting nature", topic: "Environment", difficulty: "Medium",
    lesson: "People can care for the environment by reducing waste, reusing objects, recycling materials, and saving water.",
    objectives: ["Identify three ways to protect nature", "Explain a reuse practice"],
    vocabulary: [{ word: "WASTE", definition: "Material that is no longer useful." }, { word: "RECYCLE", definition: "To process used material into something new." }, { word: "WATER", definition: "A resource needed by plants, animals, and people." }],
    huntWords: ["WASTE", "RECYCLE", "WATER"],
    clues: [{ number: 1, clue: "Material that is no longer useful.", answer: "WASTE" }, { number: 2, clue: "Turn used material into something new.", answer: "RECYCLE" }, { number: 3, clue: "A resource needed by all living things.", answer: "WATER" }]
  },
  {
    id: "matter", number: 7, title: "States of matter", topic: "Physical science", difficulty: "Medium",
    lesson: "Matter has different states. Solids keep their shape, liquids flow, and gases spread to fill available space.",
    objectives: ["Name the three common states", "Compare solid and gas behavior"],
    vocabulary: [{ word: "SOLID", definition: "Matter that keeps its shape." }, { word: "LIQUID", definition: "Matter that flows and takes the shape of its container." }, { word: "GAS", definition: "Matter that spreads to fill available space." }],
    huntWords: ["SOLID", "LIQUID", "GAS"],
    clues: [{ number: 1, clue: "Matter that keeps its shape.", answer: "SOLID" }, { number: 2, clue: "Matter that flows.", answer: "LIQUID" }, { number: 3, clue: "Matter that spreads into space.", answer: "GAS" }]
  },
  {
    id: "geography", number: 8, title: "Our world map", topic: "Geography", difficulty: "Hard",
    lesson: "Maps use symbols and directions to represent places. Continents are large land areas, while oceans are vast bodies of water.",
    objectives: ["Identify a continent", "Explain how maps show places"],
    vocabulary: [{ word: "MAP", definition: "A drawing that represents a place." }, { word: "OCEAN", definition: "A very large body of salt water." }, { word: "CONTINENT", definition: "One of Earth's largest land areas." }],
    huntWords: ["MAP", "OCEAN", "CONTINENT"],
    clues: [{ number: 1, clue: "It represents a place.", answer: "MAP" }, { number: 2, clue: "A very large body of salt water.", answer: "OCEAN" }, { number: 3, clue: "One of Earth's largest land areas.", answer: "CONTINENT" }]
  },
  {
    id: "filipino", number: 9, title: "Filipino word garden", topic: "Filipino vocabulary", difficulty: "Hard",
    lesson: "In Filipino, araw means sun, araw means day in context, and ulan means rain. Meaning can depend on how words are used.",
    objectives: ["Recognize basic Filipino words", "Match each word to meaning"],
    vocabulary: [{ word: "ARAW", definition: "Sun or day." }, { word: "ULAN", definition: "Rain." }, { word: "HALAMAN", definition: "Plant." }],
    huntWords: ["ARAW", "ULAN", "HALAMAN"],
    clues: [{ number: 1, clue: "It can mean sun or day.", answer: "ARAW" }, { number: 2, clue: "It means rain.", answer: "ULAN" }, { number: 3, clue: "It means plant.", answer: "HALAMAN" }]
  },
  {
    id: "science", number: 10, title: "Science detective", topic: "General science", difficulty: "Hard",
    lesson: "Science uses observations and evidence to answer questions. A hypothesis is a testable prediction about what may happen.",
    objectives: ["Describe an observation", "Explain a testable hypothesis"],
    vocabulary: [{ word: "TEST", definition: "A careful procedure used to find information." }, { word: "DATA", definition: "Recorded observations or measurements." }, { word: "HYPOTHESIS", definition: "A testable prediction." }],
    huntWords: ["TEST", "DATA", "HYPOTHESIS"],
    clues: [{ number: 1, clue: "A careful procedure used to find information.", answer: "TEST" }, { number: 2, clue: "Recorded observations or measurements.", answer: "DATA" }, { number: 3, clue: "A testable prediction.", answer: "HYPOTHESIS" }]
  }
];

const gridSizes = { Easy: 5, Medium: 8, Hard: 12 };

export const levels: Level[] = lessons.map((lesson) => {
  const entries = lesson.clues.map((clue, index) => {
    const [row, column, down] = crosswordLayouts[lesson.id][index];
    return { ...clue, row, column, direction: down ? "down" as const : "across" as const };
  }).sort((a, b) => a.row - b.row || a.column - b.column);
  const numbers = new Map<string, number>();
  const clues = entries.map((clue) => {
    const key = `${clue.row}:${clue.column}`;
    if (!numbers.has(key)) numbers.set(key, numbers.size + 1);
    return { ...clue, number: numbers.get(key)! };
  });
  return {
    ...lesson,
    ...lessonPractice[lesson.id],
    clues,
    grid: generateGrid(lesson.huntWords, gridSizes[lesson.difficulty], lesson.number * 31, lesson.difficulty !== "Easy"),
  };
});

export const getLevel = (id: string) => levels.find((level) => level.id === id);

export function isLevelUnlocked(level: Level, progress: Progress) {
  const previous = levels.find((item) => item.number === level.number - 1);
  return !previous || progress[previous.id]?.status === "COMPLETED";
}
