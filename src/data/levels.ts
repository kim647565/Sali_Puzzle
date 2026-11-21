import { Level } from "../types";

const grid = (rows: string[]) => rows.map((row) => row.split(" "));

export const levels: Level[] = [
  {
    id: "plants", number: 1, title: "Parts of a plant", topic: "Living things", difficulty: "Easy",
    lesson: "Plants are living things. Their roots take in water, stems support the plant, and leaves use sunlight to make food.",
    objectives: ["Name three plant parts", "Explain what each part does"],
    vocabulary: [
      { word: "ROOT", definition: "The part that absorbs water and holds the plant in soil." },
      { word: "STEM", definition: "The part that supports the plant and carries water." },
      { word: "LEAF", definition: "The part that uses sunlight to make food." }
    ],
    huntWords: ["ROOT", "STEM", "LEAF"],
    clues: [
      { number: 1, clue: "It absorbs water from soil.", answer: "ROOT" },
      { number: 2, clue: "It supports the plant.", answer: "STEM" },
      { number: 3, clue: "It uses sunlight to make food.", answer: "LEAF" }
    ],
    grid: grid(["R O O T X L", "A B C D E E", "S T E M F A", "G H I J K F", "L E A F M N", "P Q R S T U"])
  },
  {
    id: "animals", number: 2, title: "Animal adaptations", topic: "Animals", difficulty: "Easy",
    lesson: "Animals have body parts and behaviors that help them live in their habitats. These helpful traits are adaptations.",
    objectives: ["Define adaptation", "Connect traits to habitats"],
    vocabulary: [{ word: "WING", definition: "A body part used by many animals for flight." }, { word: "FUR", definition: "Hair that helps some animals stay warm." }, { word: "CLAW", definition: "A sharp nail used for grasping or defense." }],
    huntWords: ["WING", "FUR", "CLAW"],
    clues: [{ number: 1, clue: "It can help a bird fly.", answer: "WING" }, { number: 2, clue: "It keeps some animals warm.", answer: "FUR" }, { number: 3, clue: "A sharp nail on an animal.", answer: "CLAW" }],
    grid: grid(["W I N G A F", "B C D E F U", "G H I J K R", "C L A W M N", "P Q R S T U", "V W X Y Z A"])
  },
  {
    id: "body", number: 3, title: "The human body", topic: "Health", difficulty: "Easy",
    lesson: "Our body systems work together. The heart pumps blood, lungs help us breathe, and bones give us shape.",
    objectives: ["Identify body parts", "Describe one body function"],
    vocabulary: [{ word: "HEART", definition: "A muscle that pumps blood." }, { word: "LUNGS", definition: "Organs that help us breathe." }, { word: "BONE", definition: "Hard tissue that supports the body." }],
    huntWords: ["HEART", "LUNGS", "BONE"],
    clues: [{ number: 1, clue: "It pumps blood.", answer: "HEART" }, { number: 2, clue: "They help you breathe.", answer: "LUNGS" }, { number: 3, clue: "It supports your body.", answer: "BONE" }],
    grid: grid(["H E A R T X", "A B C D E L", "F G H I J U", "B O N E K N", "P Q R S T G", "V W X Y Z S"])
  },
  {
    id: "weather", number: 4, title: "Weather watchers", topic: "Earth science", difficulty: "Medium",
    lesson: "Weather describes what the air is like at a place and time. Temperature, wind, clouds, and rain can change from hour to hour.",
    objectives: ["Name common weather factors", "Describe a changing sky"],
    vocabulary: [{ word: "CLOUD", definition: "A collection of tiny water drops or ice crystals in the sky." }, { word: "WIND", definition: "Moving air." }, { word: "RAIN", definition: "Water that falls from clouds." }],
    huntWords: ["CLOUD", "WIND", "RAIN"],
    clues: [{ number: 1, clue: "It floats in the sky as water drops or ice.", answer: "CLOUD" }, { number: 2, clue: "It is moving air.", answer: "WIND" }, { number: 3, clue: "It falls from clouds.", answer: "RAIN" }],
    grid: grid(["C L O U D X", "A B C D E W", "R A I N F G", "H I J K L W", "W I N D M N", "P Q R S T U"])
  },
  {
    id: "solar", number: 5, title: "Solar system", topic: "Space", difficulty: "Medium",
    lesson: "The Solar System includes the Sun, planets, moons, asteroids, and comets. The Sun's gravity keeps planets in orbit.",
    objectives: ["Name a planet", "Explain why planets orbit"],
    vocabulary: [{ word: "SUN", definition: "The star at the center of our Solar System." }, { word: "MOON", definition: "A natural object that orbits a planet." }, { word: "ORBIT", definition: "A repeated path around another object." }],
    huntWords: ["SUN", "MOON", "ORBIT"],
    clues: [{ number: 1, clue: "It is the star at our system's center.", answer: "SUN" }, { number: 2, clue: "It travels around a planet.", answer: "MOON" }, { number: 3, clue: "It is a repeated path.", answer: "ORBIT" }],
    grid: grid(["S U N A B C", "D E F G H I", "M O O N J K", "L M N O P Q", "O R B I T R", "S T U V W X"])
  },
  {
    id: "environment", number: 6, title: "Protecting nature", topic: "Environment", difficulty: "Medium",
    lesson: "People can care for the environment by reducing waste, reusing objects, recycling materials, and saving water.",
    objectives: ["Identify three ways to protect nature", "Explain a reuse practice"],
    vocabulary: [{ word: "WASTE", definition: "Material that is no longer useful." }, { word: "RECYCLE", definition: "To process used material into something new." }, { word: "WATER", definition: "A resource needed by plants, animals, and people." }],
    huntWords: ["WASTE", "RECYCLE", "WATER"],
    clues: [{ number: 1, clue: "Material that is no longer useful.", answer: "WASTE" }, { number: 2, clue: "Turn used material into something new.", answer: "RECYCLE" }, { number: 3, clue: "A resource needed by all living things.", answer: "WATER" }],
    grid: grid(["W A S T E X", "A B C D E R", "F G H I J E", "R E C Y C L", "E A B C D E", "W A T E R F"])
  },
  {
    id: "matter", number: 7, title: "States of matter", topic: "Physical science", difficulty: "Medium",
    lesson: "Matter has different states. Solids keep their shape, liquids flow, and gases spread to fill available space.",
    objectives: ["Name the three common states", "Compare solid and gas behavior"],
    vocabulary: [{ word: "SOLID", definition: "Matter that keeps its shape." }, { word: "LIQUID", definition: "Matter that flows and takes the shape of its container." }, { word: "GAS", definition: "Matter that spreads to fill available space." }],
    huntWords: ["SOLID", "LIQUID", "GAS"],
    clues: [{ number: 1, clue: "Matter that keeps its shape.", answer: "SOLID" }, { number: 2, clue: "Matter that flows.", answer: "LIQUID" }, { number: 3, clue: "Matter that spreads into space.", answer: "GAS" }],
    grid: grid(["S O L I D X", "A B C D E L", "F G H I J I", "G A S K L Q", "M N O P Q U", "R S T U V I"])
  },
  {
    id: "geography", number: 8, title: "Our world map", topic: "Geography", difficulty: "Hard",
    lesson: "Maps use symbols and directions to represent places. Continents are large land areas, while oceans are vast bodies of water.",
    objectives: ["Identify a continent", "Explain how maps show places"],
    vocabulary: [{ word: "MAP", definition: "A drawing that represents a place." }, { word: "OCEAN", definition: "A very large body of salt water." }, { word: "CONTINENT", definition: "One of Earth's largest land areas." }],
    huntWords: ["MAP", "OCEAN", "CONTINENT"],
    clues: [{ number: 1, clue: "It represents a place.", answer: "MAP" }, { number: 2, clue: "A very large body of salt water.", answer: "OCEAN" }, { number: 3, clue: "One of Earth's largest land areas.", answer: "CONTINENT" }],
    grid: grid(["M A P X Y Z", "A B C D E O", "C O N T I N", "E N T M N P", "F G O C E A", "O C E A N R"])
  },
  {
    id: "filipino", number: 9, title: "Filipino word garden", topic: "Filipino vocabulary", difficulty: "Hard",
    lesson: "In Filipino, araw means sun, araw means day in context, and tubig means water. Meaning can depend on how words are used.",
    objectives: ["Recognize basic Filipino words", "Match each word to meaning"],
    vocabulary: [{ word: "ARAW", definition: "Sun or day." }, { word: "TUBIG", definition: "Water." }, { word: "HALAMAN", definition: "Plant." }],
    huntWords: ["ARAW", "TUBIG", "HALAMAN"],
    clues: [{ number: 1, clue: "It can mean sun or day.", answer: "ARAW" }, { number: 2, clue: "It means water.", answer: "TUBIG" }, { number: 3, clue: "It means plant.", answer: "HALAMAN" }],
    grid: grid(["A R A W X X", "H A L A M A", "N A N O P Q", "T U B I G R", "S T U V W X", "Y Z A B C D"])
  },
  {
    id: "science", number: 10, title: "Science detective", topic: "General science", difficulty: "Hard",
    lesson: "Science uses observations and evidence to answer questions. A hypothesis is a testable prediction about what may happen.",
    objectives: ["Describe an observation", "Explain a testable hypothesis"],
    vocabulary: [{ word: "TEST", definition: "A careful procedure used to find information." }, { word: "DATA", definition: "Recorded observations or measurements." }, { word: "HYPOTHESIS", definition: "A testable prediction." }],
    huntWords: ["TEST", "DATA", "HYPOTHESIS"],
    clues: [{ number: 1, clue: "A careful procedure used to find information.", answer: "TEST" }, { number: 2, clue: "Recorded observations or measurements.", answer: "DATA" }, { number: 3, clue: "A testable prediction.", answer: "HYPOTHESIS" }],
    grid: grid(["T E S T X X", "D A T A Y Z", "H Y P O T H", "E S I S A B", "C D E F G H", "I J K L M N"])
  }
];

export const getLevel = (id: string) => levels.find((level) => level.id === id);
