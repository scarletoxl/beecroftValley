// Beecroft Valley - OC Practice Test System
// Interactive educational game integration for Year 3-4 students

class OCPracticeTest {
    constructor(game) {
        this.game = game;
        this.currentSection = null;
        this.currentQuestionIndex = 0;
        this.score = { reading: 0, maths: 0, thinking: 0 };
        this.totalAttempted = { reading: 0, maths: 0, thinking: 0 };
        this.questionsPerSession = 5;
        this.sessionQuestions = [];
        this.sessionAnswers = [];
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.timedMode = false;

        // Performance tracking
        this.questionStartTime = null;
        this.sessionDetails = []; // Detailed info for each question

        // Load saved progress
        this.loadProgress();

        // Initialize question banks
        this.initQuestionBanks();

        // Create UI
        this.createUI();
    }

    // ===== MASSIVE QUESTION BANK =====
    initQuestionBanks() {
        // ===== READING COMPREHENSION =====
        this.readingPassages = [
            {
                id: 'dragon',
                title: "The Lonely Dragon",
                text: `Far up in the misty mountains, there lived a dragon named Ember. Unlike other dragons who loved to soar through the skies and breathe fire, Ember preferred to read books in her cozy cave. The other dragons thought she was strange.

"Why do you waste your time with those dusty old books?" asked Blaze, the biggest dragon in the mountain. "You should be out hunting and flying like a proper dragon!"

But Ember just smiled and turned another page. She had discovered something remarkable in her books—stories about humans who weren't afraid of dragons, stories about friendship between different creatures, and most importantly, stories about being yourself.

One stormy night, a young human girl named Maya got lost in the mountains. She stumbled into Ember's cave, shivering and scared. Instead of being frightened, Ember remembered her books. She gently warmed the cave with her breath and offered Maya some berries she had collected.

"Thank you," Maya whispered, surprised. "I thought dragons were dangerous."

"Only if you believe everything you hear," Ember replied softly. "Books have taught me that being different isn't wrong—it's special."

From that day on, Maya visited Ember often, and the dragon finally had a friend who understood that true strength comes from kindness, not from fire and fury.`,
                questions: [
                    {
                        q: "Why did the other dragons think Ember was strange?",
                        options: ["She couldn't breathe fire", "She preferred reading books to flying", "She was afraid of heights", "She was the smallest dragon"],
                        correct: 1,
                        explanation: "The passage says 'Unlike other dragons who loved to soar through the skies and breathe fire, Ember preferred to read books in her cozy cave.'"
                    },
                    {
                        q: "What does the word 'remarkable' most likely mean in this passage?",
                        options: ["Ordinary", "Boring", "Extraordinary and wonderful", "Frightening"],
                        correct: 2,
                        explanation: "'Remarkable' means extraordinary or wonderful. Ember found something special in her books."
                    },
                    {
                        q: "How did Ember help Maya when she arrived at the cave?",
                        options: ["She scared her away", "She warmed the cave and gave her berries", "She flew her home", "She called other dragons"],
                        correct: 1,
                        explanation: "The passage states 'She gently warmed the cave with her breath and offered Maya some berries she had collected.'"
                    },
                    {
                        q: "What is the main message of this story?",
                        options: ["Dragons should always breathe fire", "Being different and kind is special", "Books are boring", "Humans and dragons can never be friends"],
                        correct: 1,
                        explanation: "The story teaches that being different isn't wrong—it's special, and true strength comes from kindness."
                    },
                    {
                        q: "Based on the passage, what can we infer about Blaze?",
                        options: ["He was Ember's best friend", "He valued traditional dragon behaviour", "He secretly loved reading", "He was kind to humans"],
                        correct: 1,
                        explanation: "Blaze criticised Ember for reading and said she should be 'hunting and flying like a proper dragon,' showing he valued traditional behaviour."
                    }
                ]
            },
            {
                id: 'scientist',
                title: "The Young Scientist",
                text: `Dear Diary,

Today was the most exciting day of my life! My science experiment finally worked after three months of trying.

It all started when I noticed the plants on our windowsill grew faster on sunny days. I wondered: could different coloured lights affect how plants grow? My teacher, Mrs. Patterson, said this was an excellent hypothesis to test.

I set up four identical bean plants in identical pots with the same soil. I placed each one under a different coloured lamp—red, blue, green, and regular white light. Every day for three months, I measured their height and counted their leaves. I made sure to water them exactly the same amount.

The results were fascinating! The plant under blue light grew the tallest—28 centimetres! The red light plant was second at 24 centimetres. The white light plant grew to 22 centimetres, but the green light plant only reached 15 centimetres.

Mrs. Patterson explained that plants use blue and red light the most for photosynthesis, which is how they make their food. Green light mostly bounces off leaves—that's why plants look green to us!

I'm entering my project in the school science fair next week. Even if I don't win, I've learned something amazing: science isn't just about getting the right answer. It's about asking questions, being patient, and never giving up.

I can't wait to see what I'll discover next!

Amelia, Age 9`,
                questions: [
                    {
                        q: "What was Amelia's hypothesis (educated guess)?",
                        options: ["Plants need water to grow", "Different coloured lights might affect plant growth", "Blue light is the best", "Plants don't need light"],
                        correct: 1,
                        explanation: "Amelia wondered 'could different coloured lights affect how plants grow?' This was her hypothesis."
                    },
                    {
                        q: "Which plant grew the tallest in the experiment?",
                        options: ["The one under green light", "The one under red light", "The one under blue light", "The one under white light"],
                        correct: 2,
                        explanation: "The passage states 'The plant under blue light grew the tallest—28 centimetres!'"
                    },
                    {
                        q: "Why do plants look green to us?",
                        options: ["They absorb green light", "Green light bounces off their leaves", "They are painted green", "They prefer green light"],
                        correct: 1,
                        explanation: "Mrs. Patterson explained that 'Green light mostly bounces off leaves—that's why plants look green to us!'"
                    },
                    {
                        q: "How did Amelia make her experiment fair?",
                        options: ["She used different amounts of water", "She used different soil types", "She used identical plants, pots, soil, and watering", "She changed the lights every day"],
                        correct: 2,
                        explanation: "Amelia used 'four identical bean plants in identical pots with the same soil' and watered them 'exactly the same amount.'"
                    },
                    {
                        q: "What is the most important lesson Amelia learned?",
                        options: ["Blue light is always best", "Science is about asking questions and not giving up", "Plants don't need light", "Experiments always work the first time"],
                        correct: 1,
                        explanation: "Amelia concludes that 'science isn't just about getting the right answer. It's about asking questions, being patient, and never giving up.'"
                    },
                    {
                        q: "What does 'photosynthesis' mean based on the context?",
                        options: ["Taking photographs of plants", "How plants make their food using light", "A type of experiment", "A green colour"],
                        correct: 1,
                        explanation: "The passage explains photosynthesis as 'how they make their food' using light."
                    }
                ]
            },
            {
                id: 'ocean',
                title: "Secrets of the Deep Ocean",
                text: `The ocean covers more than 70% of Earth's surface, yet we have explored less than 5% of it. The deepest part of the ocean, the Mariana Trench, is so deep that if you placed Mount Everest at the bottom, its peak would still be more than 2 kilometres underwater!

At these extreme depths, no sunlight can penetrate. Scientists call this the "midnight zone" because it's always completely dark. Yet incredibly, life thrives here. Many creatures have developed their own light through a process called bioluminescence—they literally glow in the dark!

The anglerfish is perhaps the most famous deep-sea creature. It has a glowing lure that dangles from its head like a fishing rod, attracting curious prey straight into its enormous mouth. Other creatures, like the vampire squid (despite its scary name, it only eats tiny particles), have light-producing organs all over their bodies.

The pressure at the bottom of the ocean is crushing—over 1,000 times the pressure at the surface. Human divers would be squashed instantly. Yet creatures like the snailfish have adapted to survive. Their bodies are mostly soft and gelatinous, with no air spaces that could be compressed.

Every time scientists send submarines to explore the deep ocean, they discover new species. In 2020 alone, researchers identified over 70 previously unknown creatures! Some scientists believe there may be millions of species still waiting to be discovered in the ocean's depths.

The ocean remains Earth's final frontier—a mysterious world right here on our own planet.`,
                questions: [
                    {
                        q: "What percentage of the ocean have we explored?",
                        options: ["More than 70%", "About 50%", "Less than 5%", "100%"],
                        correct: 2,
                        explanation: "The passage states 'we have explored less than 5% of it.'"
                    },
                    {
                        q: "What is 'bioluminescence'?",
                        options: ["A type of deep-sea fish", "The ability of creatures to produce their own light", "A kind of submarine", "The pressure at the bottom of the ocean"],
                        correct: 1,
                        explanation: "The passage explains bioluminescence as when creatures 'developed their own light' and 'literally glow in the dark.'"
                    },
                    {
                        q: "Why is the deep ocean called the 'midnight zone'?",
                        options: ["Scientists only explore at midnight", "It's always completely dark there", "It's colder at midnight", "Fish sleep there at night"],
                        correct: 1,
                        explanation: "It's called the midnight zone 'because it's always completely dark' as 'no sunlight can penetrate.'"
                    },
                    {
                        q: "How has the snailfish adapted to survive deep ocean pressure?",
                        options: ["It has a very hard shell", "It has a soft, gelatinous body with no air spaces", "It swims very fast", "It only lives near the surface"],
                        correct: 1,
                        explanation: "The passage states snailfish 'bodies are mostly soft and gelatinous, with no air spaces that could be compressed.'"
                    },
                    {
                        q: "What does the author mean by calling the ocean 'Earth's final frontier'?",
                        options: ["The ocean is at the edge of Earth", "The ocean is mostly unexplored and mysterious", "We should stop exploring the ocean", "The ocean is empty"],
                        correct: 1,
                        explanation: "The author means the ocean remains largely unexplored, 'a mysterious world right here on our own planet.'"
                    },
                    {
                        q: "Based on the passage, what can we conclude about deep-sea exploration?",
                        options: ["We have discovered all species", "New discoveries continue to be made regularly", "It's too dangerous to explore", "The ocean is empty of life"],
                        correct: 1,
                        explanation: "The passage states that in 2020 alone, 'researchers identified over 70 previously unknown creatures' and 'there may be millions of species still waiting to be discovered.'"
                    }
                ]
            },
            {
                id: 'aboriginal',
                title: "Australia's First Storytellers",
                text: `For over 65,000 years, Aboriginal Australians have passed down stories, knowledge, and traditions through oral storytelling, making their culture the oldest continuous culture on Earth.

These stories, often called Dreamtime or Dreaming stories, explain how the world was created and teach important lessons about respecting the land, animals, and each other. The stories are connected to specific places—mountains, rivers, and rock formations each have their own meaning and history.

Unlike Western stories that are written in books, Aboriginal stories are told through many different ways: spoken words, songs, dances, and paintings. Elders carefully teach younger generations these stories, ensuring the knowledge survives. Some stories are sacred and can only be shared with certain people.

One famous Dreamtime story tells of the Rainbow Serpent, a powerful creator being who shaped the rivers and valleys as it travelled across the land. The Rainbow Serpent is still an important figure in many Aboriginal communities today, representing water, life, and renewal.

Aboriginal rock art, found across Australia, is some of the oldest art in the world—some paintings are over 40,000 years old! These artworks often illustrate Dreamtime stories and were sometimes created to teach younger people about their culture and history.

Today, Aboriginal Australians continue to share their stories while also creating new ways to keep their culture alive. Many Indigenous artists, writers, and musicians blend traditional stories with modern forms, ensuring these ancient tales will continue for many more generations.`,
                questions: [
                    {
                        q: "How old is Aboriginal Australian culture?",
                        options: ["About 1,000 years", "About 10,000 years", "Over 65,000 years", "About 200 years"],
                        correct: 2,
                        explanation: "The passage states Aboriginal culture has existed 'For over 65,000 years,' making it 'the oldest continuous culture on Earth.'"
                    },
                    {
                        q: "How are Dreamtime stories different from Western stories?",
                        options: ["They are shorter", "They are told through words, songs, dances, and paintings rather than just books", "They are not important", "They are only for children"],
                        correct: 1,
                        explanation: "The passage explains that 'Unlike Western stories that are written in books, Aboriginal stories are told through many different ways: spoken words, songs, dances, and paintings.'"
                    },
                    {
                        q: "What does the Rainbow Serpent represent?",
                        options: ["Fire and destruction", "Water, life, and renewal", "Mountains and valleys", "Clouds and rain"],
                        correct: 1,
                        explanation: "The passage states the Rainbow Serpent is 'representing water, life, and renewal.'"
                    },
                    {
                        q: "Why are some Aboriginal stories only shared with certain people?",
                        options: ["Because they are too boring", "Because they are sacred", "Because elders have forgotten them", "Because they are written in books"],
                        correct: 1,
                        explanation: "The passage explains that 'Some stories are sacred and can only be shared with certain people.'"
                    },
                    {
                        q: "How old can Aboriginal rock art be?",
                        options: ["About 100 years old", "About 1,000 years old", "Over 40,000 years old", "Only recently created"],
                        correct: 2,
                        explanation: "The passage states 'some paintings are over 40,000 years old!'"
                    }
                ]
            },
            {
                id: 'mars',
                title: "Life on Mars?",
                text: `Dear Mission Control,

Astronaut's Log, Day 247 on Mars.

Today we made a discovery that will change everything. While drilling into the ancient riverbed in Jezero Crater, our rover uncovered something extraordinary: microscopic fossils that appear to be 3.5 billion years old.

I still can't believe I'm typing these words. Evidence of ancient life on Mars. It's just bacteria—nothing like the green aliens from movies—but it proves that Earth isn't the only place in the universe where life has existed.

The fossils look similar to stromatolites we find on Earth—layered rock structures built by ancient microbes. Billions of years ago, Mars had rivers, lakes, and possibly even oceans. The atmosphere was thicker and warmer. It was a planet where life could thrive.

So what happened? Our best theory is that Mars lost its magnetic field. Without that invisible shield, solar wind slowly stripped away the atmosphere. Water evaporated into space. The planet froze and dried out. Any life that existed either died or perhaps retreated underground where liquid water might still exist today.

This discovery raises a fascinating question: if life started on two planets in our solar system, how common might it be across the universe? With billions of galaxies, each containing billions of stars, the odds of Earth being the only planet with life suddenly seem very small indeed.

Tomorrow we'll analyse the samples more carefully. But tonight, I'm just looking up at the stars, wondering who else might be out there looking back.

Commander Elena Rodriguez
Mars Base Alpha`,
                questions: [
                    {
                        q: "What did the astronauts discover on Mars?",
                        options: ["Living aliens", "Ancient microscopic fossils", "Water fountains", "Green plants"],
                        correct: 1,
                        explanation: "The passage describes finding 'microscopic fossils that appear to be 3.5 billion years old.'"
                    },
                    {
                        q: "What are stromatolites?",
                        options: ["A type of alien", "Layered rock structures built by ancient microbes", "A kind of spaceship", "Mars rocks"],
                        correct: 1,
                        explanation: "The passage explains stromatolites are 'layered rock structures built by ancient microbes.'"
                    },
                    {
                        q: "What happened to Mars's atmosphere according to the passage?",
                        options: ["It got thicker", "Solar wind stripped it away after Mars lost its magnetic field", "It turned green", "Nothing changed"],
                        correct: 1,
                        explanation: "The passage explains that when 'Mars lost its magnetic field... solar wind slowly stripped away the atmosphere.'"
                    },
                    {
                        q: "What does this discovery suggest about life in the universe?",
                        options: ["Earth is the only planet with life", "Life might be common across the universe", "Life is impossible elsewhere", "Aliens have visited Earth"],
                        correct: 1,
                        explanation: "The commander concludes that 'the odds of Earth being the only planet with life suddenly seem very small indeed.'"
                    },
                    {
                        q: "How does Commander Rodriguez feel about the discovery?",
                        options: ["Bored and uninterested", "Amazed and thoughtful", "Scared and worried", "Angry and frustrated"],
                        correct: 1,
                        explanation: "The commander says 'I still can't believe I'm typing these words' and reflects thoughtfully about life in the universe."
                    }
                ]
            }
        ];

        // ===== MATHEMATICAL REASONING =====
        this.mathsQuestions = [
            // PATTERNS AND SEQUENCES
            { q: "What comes next: 2, 4, 8, 16, __?", options: ["20", "24", "32", "64"], correct: 2, explanation: "Each number is multiplied by 2. 16 × 2 = 32", category: "patterns" },
            { q: "What comes next: 3, 6, 12, 24, __?", options: ["36", "48", "30", "72"], correct: 1, explanation: "Each number is multiplied by 2. 24 × 2 = 48", category: "patterns" },
            { q: "What comes next: 1, 4, 9, 16, __?", options: ["20", "25", "24", "36"], correct: 1, explanation: "These are square numbers (1², 2², 3², 4²). Next is 5² = 25", category: "patterns" },
            { q: "What comes next: 5, 10, 20, 40, __?", options: ["60", "80", "50", "100"], correct: 1, explanation: "Each number doubles. 40 × 2 = 80", category: "patterns" },
            { q: "What comes next: 100, 90, 81, 73, __?", options: ["65", "66", "64", "63"], correct: 1, explanation: "Pattern: -10, -9, -8, so next is -7. 73 - 7 = 66", category: "patterns" },
            { q: "What comes next: 2, 5, 11, 23, __?", options: ["35", "47", "46", "48"], correct: 1, explanation: "Pattern: ×2+1. 23×2+1 = 47", category: "patterns" },
            { q: "What comes next: 1, 1, 2, 3, 5, 8, __?", options: ["11", "13", "10", "12"], correct: 1, explanation: "Fibonacci sequence: each number is the sum of the two before it. 5+8=13", category: "patterns" },
            { q: "Find the pattern: 3, 9, 27, 81, __?", options: ["162", "243", "108", "324"], correct: 1, explanation: "Each number is multiplied by 3. 81 × 3 = 243", category: "patterns" },
            { q: "What comes next: 7, 14, 28, 56, __?", options: ["84", "112", "70", "98"], correct: 1, explanation: "Each number doubles. 56 × 2 = 112", category: "patterns" },
            { q: "Complete: 1000, 500, 250, 125, __?", options: ["100", "62.5", "75", "50"], correct: 1, explanation: "Each number is halved. 125 ÷ 2 = 62.5", category: "patterns" },
            
            // WORD PROBLEMS - ADDITION/SUBTRACTION
            { q: "Tom has 47 marbles. He wins 28 more. How many does he have now?", options: ["65", "75", "85", "19"], correct: 1, explanation: "47 + 28 = 75 marbles", category: "word" },
            { q: "A library has 856 books. 178 are borrowed. How many are left?", options: ["678", "688", "778", "668"], correct: 0, explanation: "856 - 178 = 678 books", category: "word" },
            { q: "Sophie saved $45 one week and $38 the next. How much did she save in total?", options: ["$73", "$83", "$93", "$63"], correct: 1, explanation: "$45 + $38 = $83", category: "word" },
            { q: "A train has 312 passengers. At a stop, 87 get off and 54 get on. How many passengers now?", options: ["279", "289", "269", "299"], correct: 0, explanation: "312 - 87 + 54 = 279 passengers", category: "word" },
            { q: "Emma has 500 stickers. She gives 125 to her brother and 89 to her friend. How many left?", options: ["286", "296", "276", "306"], correct: 0, explanation: "500 - 125 - 89 = 286 stickers", category: "word" },
            
            // WORD PROBLEMS - MULTIPLICATION/DIVISION
            { q: "Each box has 12 pencils. How many pencils in 8 boxes?", options: ["86", "96", "106", "76"], correct: 1, explanation: "12 × 8 = 96 pencils", category: "word" },
            { q: "72 students need to be divided into groups of 9. How many groups?", options: ["6", "7", "8", "9"], correct: 2, explanation: "72 ÷ 9 = 8 groups", category: "word" },
            { q: "A cinema has 15 rows with 24 seats each. How many seats in total?", options: ["340", "350", "360", "370"], correct: 2, explanation: "15 × 24 = 360 seats", category: "word" },
            { q: "144 apples shared equally among 12 baskets. How many in each?", options: ["10", "11", "12", "14"], correct: 2, explanation: "144 ÷ 12 = 12 apples per basket", category: "word" },
            { q: "A baker makes 6 trays of cookies with 15 cookies each. How many cookies?", options: ["80", "90", "100", "85"], correct: 1, explanation: "6 × 15 = 90 cookies", category: "word" },
            
            // FRACTIONS
            { q: "What is 1/4 of 100?", options: ["20", "25", "40", "50"], correct: 1, explanation: "100 ÷ 4 = 25", category: "fractions" },
            { q: "What is 3/5 of 40?", options: ["8", "24", "32", "12"], correct: 1, explanation: "40 ÷ 5 = 8, then 8 × 3 = 24", category: "fractions" },
            { q: "If 2/3 of a class are girls and there are 30 students, how many are girls?", options: ["15", "20", "10", "25"], correct: 1, explanation: "30 ÷ 3 = 10, then 10 × 2 = 20 girls", category: "fractions" },
            { q: "What is 1/2 + 1/4?", options: ["2/6", "3/4", "1/6", "2/4"], correct: 1, explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4", category: "fractions" },
            { q: "Which is greater: 3/4 or 2/3?", options: ["3/4", "2/3", "They are equal", "Cannot tell"], correct: 0, explanation: "3/4 = 0.75 and 2/3 ≈ 0.67, so 3/4 is greater", category: "fractions" },
            { q: "What is 5/8 of 64?", options: ["35", "40", "45", "50"], correct: 1, explanation: "64 ÷ 8 = 8, then 8 × 5 = 40", category: "fractions" },
            { q: "Simplify 8/12 to lowest terms.", options: ["4/6", "2/3", "2/4", "3/4"], correct: 1, explanation: "8/12: divide both by 4 = 2/3", category: "fractions" },
            
            // TIME
            { q: "A movie starts at 2:45 PM and lasts 1 hour 35 minutes. When does it end?", options: ["4:10 PM", "4:20 PM", "3:80 PM", "4:15 PM"], correct: 1, explanation: "2:45 + 1:35 = 4:20 PM", category: "time" },
            { q: "How many minutes in 2.5 hours?", options: ["120", "150", "130", "180"], correct: 1, explanation: "2.5 × 60 = 150 minutes", category: "time" },
            { q: "School starts at 8:50 AM and ends at 3:15 PM. How long is the school day?", options: ["6 hours 25 min", "6 hours 35 min", "7 hours 25 min", "5 hours 25 min"], correct: 0, explanation: "From 8:50 to 3:15 = 6 hours 25 minutes", category: "time" },
            { q: "A bus arrives every 15 minutes. If one arrives at 9:12 AM, when is the next?", options: ["9:22 AM", "9:27 AM", "9:30 AM", "9:17 AM"], correct: 1, explanation: "9:12 + 15 minutes = 9:27 AM", category: "time" },
            { q: "How many seconds in 5 minutes?", options: ["500", "300", "250", "350"], correct: 1, explanation: "5 × 60 = 300 seconds", category: "time" },
            
            // MONEY
            { q: "Tom buys 3 items at $4.50 each. How much in total?", options: ["$12.50", "$13.50", "$14.50", "$11.50"], correct: 1, explanation: "3 × $4.50 = $13.50", category: "money" },
            { q: "Sarah has $20. She buys a book for $7.85. How much change?", options: ["$12.15", "$12.85", "$13.15", "$11.15"], correct: 0, explanation: "$20 - $7.85 = $12.15", category: "money" },
            { q: "4 friends share a $36 bill equally. How much each?", options: ["$8", "$9", "$10", "$7"], correct: 1, explanation: "$36 ÷ 4 = $9 each", category: "money" },
            { q: "An item costs $45. With 10% discount, what's the price?", options: ["$40.50", "$35.00", "$41.50", "$36.00"], correct: 0, explanation: "10% of $45 = $4.50, so $45 - $4.50 = $40.50", category: "money" },
            { q: "5 notebooks cost $12.50. What is the cost of 1 notebook?", options: ["$2.00", "$2.50", "$3.00", "$2.25"], correct: 1, explanation: "$12.50 ÷ 5 = $2.50", category: "money" },
            
            // AVERAGES
            { q: "What is the average of 5, 10, 15, and 10?", options: ["8", "10", "12", "9"], correct: 1, explanation: "(5+10+15+10) ÷ 4 = 40 ÷ 4 = 10", category: "averages" },
            { q: "Tom scored 85, 90, and 95 on three tests. What's his average?", options: ["88", "89", "90", "91"], correct: 2, explanation: "(85+90+95) ÷ 3 = 270 ÷ 3 = 90", category: "averages" },
            { q: "The average of 4 numbers is 25. What is their total?", options: ["75", "100", "50", "125"], correct: 1, explanation: "Average × count = total. 25 × 4 = 100", category: "averages" },
            { q: "Heights of 3 students: 142cm, 138cm, 145cm. Average height?", options: ["140cm", "141cm", "142cm", "143cm"], correct: 2, explanation: "(142+138+145) ÷ 3 = 425 ÷ 3 ≈ 142cm (rounded)", category: "averages" },
            
            // GEOMETRY
            { q: "What is the perimeter of a square with sides of 8cm?", options: ["16cm", "24cm", "32cm", "64cm"], correct: 2, explanation: "Perimeter = 4 × side = 4 × 8 = 32cm", category: "geometry" },
            { q: "What is the area of a rectangle 6m by 4m?", options: ["10 m²", "20 m²", "24 m²", "12 m²"], correct: 2, explanation: "Area = length × width = 6 × 4 = 24 m²", category: "geometry" },
            { q: "A triangle has angles of 60° and 70°. What is the third angle?", options: ["40°", "50°", "60°", "70°"], correct: 1, explanation: "180° - 60° - 70° = 50°", category: "geometry" },
            { q: "How many faces does a cube have?", options: ["4", "5", "6", "8"], correct: 2, explanation: "A cube has 6 faces", category: "geometry" },
            { q: "What is the perimeter of a rectangle 12cm by 5cm?", options: ["34cm", "17cm", "60cm", "24cm"], correct: 0, explanation: "Perimeter = 2 × (12 + 5) = 2 × 17 = 34cm", category: "geometry" },
            { q: "How many vertices does a rectangular prism have?", options: ["6", "8", "10", "12"], correct: 1, explanation: "A rectangular prism has 8 vertices (corners)", category: "geometry" },
            
            // MULTI-STEP PROBLEMS
            { q: "Tom has $50. He buys 3 books at $8 each and a pen for $2. How much left?", options: ["$22", "$24", "$20", "$26"], correct: 1, explanation: "Books: 3 × $8 = $24. Total spent: $24 + $2 = $26. Left: $50 - $26 = $24", category: "multistep" },
            { q: "A farmer has 248 apples. He packs them into boxes of 12. How many full boxes and how many left over?", options: ["20 boxes, 8 left", "21 boxes, 4 left", "20 boxes, 4 left", "19 boxes, 8 left"], correct: 0, explanation: "248 ÷ 12 = 20 remainder 8. So 20 full boxes with 8 apples left", category: "multistep" },
            { q: "Sarah earns $12 per hour. She works 5 hours on Saturday and 4 hours on Sunday. How much does she earn?", options: ["$96", "$108", "$120", "$84"], correct: 1, explanation: "Total hours: 5 + 4 = 9. Earnings: 9 × $12 = $108", category: "multistep" },
            { q: "A shop sells 156 items on Monday, twice as many on Tuesday. Total items sold?", options: ["312", "468", "624", "234"], correct: 1, explanation: "Tuesday: 156 × 2 = 312. Total: 156 + 312 = 468", category: "multistep" },
            { q: "Bus tickets cost $3.50. A family of 4 buys return tickets (there and back). Total cost?", options: ["$14", "$21", "$28", "$35"], correct: 2, explanation: "Each person needs 2 tickets: 4 × 2 = 8 tickets. Cost: 8 × $3.50 = $28", category: "multistep" },
            
            // PLACE VALUE AND ORDERING
            { q: "What is the value of 7 in 4,725?", options: ["7", "70", "700", "7000"], correct: 2, explanation: "The 7 is in the hundreds place, so its value is 700", category: "place_value" },
            { q: "Order from smallest to largest: 0.35, 0.4, 0.305", options: ["0.35, 0.305, 0.4", "0.305, 0.35, 0.4", "0.4, 0.35, 0.305", "0.305, 0.4, 0.35"], correct: 1, explanation: "0.305 = 0.305, 0.35 = 0.350, 0.4 = 0.400. Order: 0.305, 0.35, 0.4", category: "place_value" },
            { q: "Round 3,847 to the nearest hundred.", options: ["3,800", "3,850", "3,900", "4,000"], correct: 0, explanation: "3,847 rounded to nearest hundred is 3,800 (47 < 50)", category: "place_value" },
            { q: "What is 6.8 rounded to the nearest whole number?", options: ["6", "7", "8", "6.5"], correct: 1, explanation: "6.8 rounds up to 7 (0.8 ≥ 0.5)", category: "place_value" }
        ];

        // ===== THINKING SKILLS =====
        this.thinkingQuestions = [
            // CONDITIONAL LOGIC (15)
            { q: "If you are a member of the swim team, you must go to practice on Tuesdays. Mia does NOT go to practice on Tuesdays. What MUST be true?", options: ["Mia is lazy", "Mia is not a member of the swim team", "Mia is sick", "Mia goes on Wednesdays instead"], correct: 1, explanation: "If swim team members MUST go on Tuesdays, and Mia doesn't go, she can't be on the swim team. This is called the contrapositive.", category: "conditional" },
            { q: "If it snows, school will be cancelled. School was cancelled today. What can we say for sure?", options: ["It definitely snowed", "It might have snowed, but something else could have caused the cancellation too", "It did not snow", "School will reopen tomorrow"], correct: 1, explanation: "School could be cancelled for many reasons (teacher strike, flood, etc.), not just snow. We can't be certain it snowed.", category: "conditional" },
            { q: "If a shape has exactly 3 sides, then it is a triangle. Shape X has 4 sides. What MUST be true?", options: ["Shape X is a triangle", "Shape X is not a triangle", "Shape X is a square", "We cannot tell"], correct: 1, explanation: "If having 3 sides means triangle, then NOT having 3 sides means NOT a triangle. Shape X has 4 sides, so it is not a triangle.", category: "conditional" },
            { q: "Every student who finishes their homework gets a sticker. Raj got a sticker. What can we conclude?", options: ["Raj definitely finished his homework", "Raj might have finished his homework, or got a sticker another way", "Raj did not finish his homework", "Raj is the best student"], correct: 1, explanation: "Finishing homework is one way to get a sticker, but there might be other ways (good behaviour, helping others). We can't be 100% sure.", category: "conditional" },
            { q: "If today is Saturday, then there is no school. Today is Wednesday. What can we conclude?", options: ["There is school today", "There is no school today", "We cannot be sure if there is school", "It must be the weekend"], correct: 2, explanation: "The rule only tells us about Saturdays. It says nothing about other days. Wednesday could or could not have school — we simply don't know from this rule alone.", category: "conditional" },
            { q: "All children in Year 4 must learn multiplication. Priya is learning multiplication. Is Priya in Year 4?", options: ["Yes, definitely", "No, definitely not", "Maybe — other years might also learn multiplication", "Only if she is 9 years old"], correct: 2, explanation: "Year 4 must learn multiplication, but so might Year 3 or Year 5. Learning multiplication doesn't prove you're in Year 4.", category: "conditional" },
            { q: "If a fruit is a banana, then it is yellow. This fruit is yellow. What MUST be true?", options: ["It is a banana", "It might be a banana, but could be another yellow fruit", "It is not a banana", "All yellow things are bananas"], correct: 1, explanation: "Bananas are yellow, but so are lemons, pineapples, and mangoes. Being yellow doesn't guarantee it's a banana.", category: "conditional" },
            { q: "If animal X is a cat, then animal X has whiskers. If animal X has whiskers, then animal X has fur. Animal X is a cat. What MUST be true?", options: ["Animal X has scales", "Animal X has fur", "Animal X can fly", "Animal X lives in water"], correct: 1, explanation: "Cat → has whiskers → has fur. Since X is a cat, X has whiskers, and therefore X has fur.", category: "conditional" },
            { q: "If the light is green, cars can go. If cars can go, pedestrians must wait. The light is green. What MUST pedestrians do?", options: ["Cross the road", "Wait", "Run", "Nothing — we cannot tell"], correct: 1, explanation: "Green light → cars go → pedestrians must wait. Following the chain, pedestrians must wait.", category: "conditional" },
            { q: "If you eat too much sugar, you might get a tummy ache. Tom has a tummy ache. Did Tom eat too much sugar?", options: ["Yes, for sure", "No, definitely not", "We cannot tell — many things cause tummy aches", "Only if he ate lollies"], correct: 2, explanation: "Sugar MIGHT cause a tummy ache, but tummy aches have many causes (flu, nerves, bad food). We cannot tell.", category: "conditional" },
            { q: "All birds have feathers. All eagles are birds. What MUST be true?", options: ["All feathered things are eagles", "All eagles have feathers", "All birds are eagles", "Some eagles have no feathers"], correct: 1, explanation: "Eagles are birds, and all birds have feathers, so all eagles must have feathers.", category: "conditional" },
            { q: "If it is Monday, Lily has piano lessons. If Lily has piano lessons, she gets home late. It is NOT Monday. What can we say?", options: ["Lily definitely does not get home late", "Lily definitely has piano lessons", "We cannot be sure whether Lily gets home late", "Lily always gets home early"], correct: 2, explanation: "The rules only tell us what happens on Monday. On other days, Lily might still get home late for other reasons. We cannot be sure.", category: "conditional" },
            { q: "Every student who passes the test gets a certificate. No student who is absent gets a certificate. Ben is absent. What MUST be true?", options: ["Ben passed the test", "Ben did not get a certificate", "Ben failed the test", "Ben will take the test tomorrow"], correct: 1, explanation: "Absent students get no certificate. Ben is absent, so Ben did not get a certificate.", category: "conditional" },
            { q: "If a number is divisible by 10, it must be divisible by 5. The number 35 is divisible by 5. Is 35 divisible by 10?", options: ["Yes, definitely", "No, definitely not", "We cannot tell just from this rule", "Only if it ends in 0"], correct: 2, explanation: "Divisible by 10 → divisible by 5, but NOT the other way around. Being divisible by 5 does not prove divisibility by 10. (In fact, 35 is NOT divisible by 10, but the rule alone cannot tell us that.)", category: "conditional" },
            { q: "If you bring an umbrella, you will stay dry. If you stay dry, you will be happy. Sophie is happy. Did she bring an umbrella?", options: ["Yes, she must have", "No, she did not", "We cannot tell — she might be happy for another reason", "Only if it was raining"], correct: 2, explanation: "Umbrella → stay dry → happy. But Sophie could be happy for many reasons (good test score, birthday, etc.). We cannot be sure she brought an umbrella.", category: "conditional" },
            // SYLLOGISMS & SET LOGIC (12)
            { q: "All Frozzles are Glinkers. All Glinkers are Snibbles. What MUST be true?", options: ["All Snibbles are Frozzles", "All Frozzles are Snibbles", "All Glinkers are Frozzles", "No Frozzles are Snibbles"], correct: 1, explanation: "Frozzles → Glinkers → Snibbles. So all Frozzles must be Snibbles. But not all Snibbles are necessarily Frozzles.", category: "syllogism" },
            { q: "All Wompats have stripes. Some Wompats can fly. What MUST be true?", options: ["All striped things can fly", "Some things that have stripes can fly", "All flying things are Wompats", "No Wompats can swim"], correct: 1, explanation: "Some Wompats can fly, and all Wompats have stripes, so some striped things (those particular Wompats) can fly.", category: "syllogism" },
            { q: "No Quibbles are Plonkets. All Gruffs are Quibbles. What MUST be true?", options: ["Some Gruffs are Plonkets", "All Plonkets are Gruffs", "No Gruffs are Plonkets", "All Quibbles are Gruffs"], correct: 2, explanation: "Gruffs are Quibbles, and no Quibbles are Plonkets, so no Gruffs can be Plonkets.", category: "syllogism" },
            { q: "All Drimbles are Tazzles. All Drimbles are Voobles. What MUST be true?", options: ["All Tazzles are Voobles", "All Voobles are Tazzles", "Some Tazzles are Voobles", "No Tazzles are Voobles"], correct: 2, explanation: "Every Drimble is both a Tazzle and a Vooble. So at least some Tazzles (the Drimbles) are also Voobles.", category: "syllogism" },
            { q: "Some Flibbers are Jompers. All Jompers are Kazzles. What MUST be true?", options: ["All Flibbers are Kazzles", "Some Flibbers are Kazzles", "All Kazzles are Flibbers", "No Flibbers are Kazzles"], correct: 1, explanation: "Some Flibbers are Jompers, and all Jompers are Kazzles. So those Flibbers that are Jompers must also be Kazzles.", category: "syllogism" },
            { q: "All Murbles are Splinks. No Murbles are Treeks. Can a Splink be a Treek?", options: ["No, never", "Yes, definitely all of them", "Yes, some Splinks might be Treeks", "Only on weekends"], correct: 2, explanation: "We only know Murbles cannot be Treeks. But there might be Splinks that are NOT Murbles, and those could be Treeks.", category: "syllogism" },
            { q: "In a class of 25 students, 14 play netball and 16 play cricket. What is the SMALLEST number who play both?", options: ["2", "5", "6", "3"], correct: 1, explanation: "14 + 16 = 30, but there are only 25 students. At least 30 - 25 = 5 students must play both.", category: "syllogism" },
            { q: "All Zibbles have tails. Zork is not a Zibble. What can we say about Zork?", options: ["Zork has no tail", "Zork definitely has a tail", "We cannot tell whether Zork has a tail", "Zork is a cat"], correct: 2, explanation: "We know all Zibbles have tails, but Zork is NOT a Zibble. Other things might also have tails. We simply cannot tell.", category: "syllogism" },
            { q: "All Plinkers are round. All Plinkers are blue. Which MUST be true?", options: ["All round things are blue", "All blue things are round", "Some round things are blue", "Nothing round is blue"], correct: 2, explanation: "Plinkers are both round and blue, so at least some round things (the Plinkers) are blue. But not all round things need to be.", category: "syllogism" },
            { q: "No Gropples are Wendles. Some Wendles are Harbles. What MUST be true?", options: ["No Gropples are Harbles", "Some Harbles are not Gropples", "All Harbles are Gropples", "All Gropples are Harbles"], correct: 1, explanation: "Some Wendles are Harbles, and no Gropples are Wendles. Those Wendle-Harbles definitely are NOT Gropples.", category: "syllogism" },
            { q: "All Crumbles have wings. All Crumbles have claws. Bob has wings but no claws. Is Bob a Crumble?", options: ["Yes, because he has wings", "No, because he has no claws", "Maybe — we need more information", "Yes, if he can fly"], correct: 1, explanation: "All Crumbles have BOTH wings AND claws. Bob has no claws, so Bob cannot be a Crumble.", category: "syllogism" },
            { q: "Some Yonkers are Zepples. Some Zepples are Minkles. Does that mean some Yonkers are Minkles?", options: ["Yes, definitely", "No, definitely not", "Not necessarily — the Yonker-Zepples and Minkle-Zepples might be different", "Only if all Zepples are Minkles"], correct: 2, explanation: "The Zepples that are Yonkers might be completely different from the Zepples that are Minkles. We cannot be sure any Yonker is a Minkle.", category: "syllogism" },
            // ORDERING & RANKING (12)
            { q: "In a race, Kai beat Nora. Nora beat Liam. Oscar beat Kai. Who came 2nd?", options: ["Oscar", "Kai", "Nora", "Liam"], correct: 1, explanation: "Oscar beat Kai, Kai beat Nora, Nora beat Liam. Order: Oscar, Kai, Nora, Liam. Kai is 2nd.", category: "ordering" },
            { q: "Ella is taller than Finn. Grace is shorter than Finn but taller than Hugo. Who is shortest?", options: ["Ella", "Finn", "Grace", "Hugo"], correct: 3, explanation: "Ella > Finn > Grace > Hugo. Hugo is shortest.", category: "ordering" },
            { q: "In a spelling test: Ava scored more than Zoe. Zoe scored more than Will. Will scored more than Xander. Who came 3rd?", options: ["Ava", "Zoe", "Will", "Xander"], correct: 2, explanation: "Ava > Zoe > Will > Xander. Will is 3rd.", category: "ordering" },
            { q: "Town A is north of Town B. Town B is east of Town C. Which direction is Town A from Town C?", options: ["North-east", "South-west", "North-west", "South-east"], correct: 0, explanation: "From C, go east to reach B, then go north to reach A. So A is north-east of C.", category: "ordering" },
            { q: "4 friends measured their heights. Priya is shorter than Ren. Quinn is the tallest. Ren is shorter than Sam. Sam is shorter than Quinn. Who is 3rd tallest?", options: ["Priya", "Ren", "Sam", "Quinn"], correct: 1, explanation: "Quinn > Sam > Ren > Priya. Ren is 3rd tallest.", category: "ordering" },
            { q: "In a swimming race, Beth finished after Amy but before Chen. Dana finished after Chen. Who came 3rd?", options: ["Amy", "Beth", "Chen", "Dana"], correct: 2, explanation: "Order: Amy, Beth, Chen, Dana. Chen is 3rd.", category: "ordering" },
            { q: "Jake is older than Keira. Keira is older than Leo. Max is younger than Leo. Who is the youngest?", options: ["Jake", "Keira", "Leo", "Max"], correct: 3, explanation: "Jake > Keira > Leo > Max. Max is youngest.", category: "ordering" },
            { q: "The library is west of the school. The park is south of the school. The bakery is east of the library and north of the park. Where is the bakery relative to the school?", options: ["North-west", "South-west", "At or near the school", "East"], correct: 2, explanation: "The library is west of school. The bakery is east of the library (back towards school) and north of the park (which is south of school). This puts the bakery roughly at the school's location.", category: "ordering" },
            { q: "6 students ran a race. Tina was not last. Tina finished right behind Uma. Victor finished right behind Tina. Uma was 3rd. Where did Victor finish?", options: ["3rd", "4th", "5th", "6th"], correct: 2, explanation: "Uma was 3rd. Tina was right behind Uma so 4th. Victor right behind Tina so 5th.", category: "ordering" },
            { q: "Ava, Ben, Carla, and Dev each got a different mark: 60, 70, 80, 90. Ava did better than Carla. Ben got 70. Dev beat Ava. What did Carla get?", options: ["60", "70", "80", "90"], correct: 0, explanation: "Ben=70. Dev beat Ava, and Ava beat Carla. So Dev>Ava>Carla. Dev=90, Ava=80, Carla=60.", category: "ordering" },
            { q: "Anna is 3 years older than Bianca. Bianca is 2 years older than Chloe. Chloe is 7. How old is Anna?", options: ["10", "11", "12", "13"], correct: 2, explanation: "Chloe=7, Bianca=7+2=9, Anna=9+3=12.", category: "ordering" },
            { q: "Five dogs have different weights. Buddy weighs more than Coco. Archie weighs less than Buddy but more than Daisy. Daisy weighs more than Coco. Coco weighs more than Ella. Who is 2nd heaviest?", options: ["Buddy", "Archie", "Daisy", "Coco"], correct: 1, explanation: "Buddy > Archie > Daisy > Coco > Ella. Archie is 2nd heaviest.", category: "ordering" },
            // ANALOGIES — ADVANCED (15)
            { q: "COMPASS is to DIRECTION as CLOCK is to ___", options: ["HANDS", "TIME", "NUMBERS", "WALL"], correct: 1, explanation: "A compass tells you direction. A clock tells you time. Both are tools that measure something.", category: "analogies" },
            { q: "SEED is to TREE as EGG is to ___", options: ["NEST", "SHELL", "CHICKEN", "BREAKFAST"], correct: 2, explanation: "A seed grows into a tree. An egg grows into a chicken. Both are starting forms that become something bigger.", category: "analogies" },
            { q: "CHAPTER is to NOVEL as VERSE is to ___", options: ["POEM", "RHYME", "WORD", "SINGER"], correct: 0, explanation: "A chapter is a section of a novel. A verse is a section of a poem.", category: "analogies" },
            { q: "TELESCOPE is to DISTANT as MICROSCOPE is to ___", options: ["LARGE", "TINY", "SCIENCE", "LENS"], correct: 1, explanation: "A telescope helps see distant things. A microscope helps see tiny things.", category: "analogies" },
            { q: "BARK is to TREE as SKIN is to ___", options: ["BONE", "HUMAN", "SMOOTH", "COLOUR"], correct: 1, explanation: "Bark is the outer covering of a tree. Skin is the outer covering of a human.", category: "analogies" },
            { q: "REHEARSAL is to PERFORMANCE as PRACTICE is to ___", options: ["SPORT", "MATCH", "COACH", "UNIFORM"], correct: 1, explanation: "A rehearsal prepares you for a performance. Practice prepares you for a match.", category: "analogies" },
            { q: "SAIL is to WIND as PADDLE is to ___", options: ["BOAT", "WATER", "MUSCLE", "OAR"], correct: 2, explanation: "A sail uses wind to move a boat. A paddle uses muscle power to move a boat.", category: "analogies" },
            { q: "DROUGHT is to RAIN as FAMINE is to ___", options: ["FOOD", "HUNGER", "DESERT", "WATER"], correct: 0, explanation: "A drought is a lack of rain. A famine is a lack of food.", category: "analogies" },
            { q: "KEYBOARD is to TYPE as BRUSH is to ___", options: ["HAIR", "PAINT", "ART", "BRISTLE"], correct: 1, explanation: "You use a keyboard to type. You use a brush to paint. Both are tool-to-action relationships.", category: "analogies" },
            { q: "AUTHOR is to STORY as ARCHITECT is to ___", options: ["BRICKS", "BUILDING", "DRAWING", "OFFICE"], correct: 1, explanation: "An author creates a story. An architect creates a building.", category: "analogies" },
            { q: "PAWS is to DOG as HOOVES is to ___", options: ["SADDLE", "HORSE", "GALLOP", "FARM"], correct: 1, explanation: "Dogs have paws. Horses have hooves. Both are animal-to-foot-type relationships.", category: "analogies" },
            { q: "EMPTY is to FULL as QUESTION is to ___", options: ["ASK", "ANSWER", "TEST", "WONDER"], correct: 1, explanation: "Empty and full are opposites (one lacks, the other completes). A question seeks; an answer completes it.", category: "analogies" },
            { q: "OVEN is to BAKE as FREEZER is to ___", options: ["COLD", "FREEZE", "ICE", "KITCHEN"], correct: 1, explanation: "An oven is used to bake (make hot). A freezer is used to freeze (make cold). Both are appliance-to-function.", category: "analogies" },
            { q: "CATERPILLAR is to BUTTERFLY as TADPOLE is to ___", options: ["POND", "FROG", "FISH", "SWIM"], correct: 1, explanation: "A caterpillar transforms into a butterfly. A tadpole transforms into a frog.", category: "analogies" },
            { q: "CAPTAIN is to SHIP as PILOT is to ___", options: ["SKY", "AEROPLANE", "UNIFORM", "AIRPORT"], correct: 1, explanation: "A captain leads/operates a ship. A pilot operates an aeroplane.", category: "analogies" },
            // CODES & CIPHERS — ADVANCED (12)
            { q: "If triangle + circle = 14, and triangle - circle = 6, what is triangle x circle?", options: ["40", "48", "20", "36"], correct: 0, explanation: "Adding the equations: 2 x triangle = 20, so triangle = 10. Circle = 14 - 10 = 4. Triangle x circle = 10 x 4 = 40.", category: "codes" },
            { q: "If star = 7 and moon = 4, what is (star x moon) - star?", options: ["21", "24", "28", "35"], correct: 0, explanation: "Star x moon = 7 x 4 = 28. Then 28 - 7 = 21.", category: "codes" },
            { q: "Each letter is worth its position (A=1, B=2...). Which word is worth the most when you add the letters?", options: ["SUN", "WET", "FOG", "ICE"], correct: 0, explanation: "SUN: S(19)+U(21)+N(14)=54. WET: W(23)+E(5)+T(20)=48. FOG: F(6)+O(15)+G(7)=28. ICE: I(9)+C(3)+E(5)=17. SUN is highest at 54.", category: "codes" },
            { q: "In a code, each letter shifts 3 forward (A becomes D, B becomes E...). What does FRGH decode to?", options: ["CODE", "CORE", "CORD", "CRAB"], correct: 0, explanation: "Shift each letter 3 backward to decode: F→C, R→O, G→D, H→E. FRGH decodes to CODE.", category: "codes" },
            { q: "If diamond + diamond + diamond = 21, what is diamond x diamond?", options: ["42", "49", "63", "7"], correct: 1, explanation: "3 x diamond = 21, so diamond = 7. Diamond x diamond = 7 x 7 = 49.", category: "codes" },
            { q: "In a code where each letter shifts forward by 1 (A→B, B→C...), what does IFMQ decode to?", options: ["HELP", "HERO", "HELM", "HEAP"], correct: 0, explanation: "Shift each letter back by 1: I→H, F→E, M→L, Q→P. IFMQ decodes to HELP.", category: "codes" },
            { q: "If square + triangle = 11, and square + square + triangle = 15, what is triangle?", options: ["3", "4", "7", "8"], correct: 2, explanation: "Subtract first equation from second: square = 15 - 11 = 4. Then triangle = 11 - 4 = 7.", category: "codes" },
            { q: "In a code, ROSE = 4, DAISY = 5, TULIP = 5. What is SUNFLOWER?", options: ["7", "8", "9", "10"], correct: 2, explanation: "The code counts the number of letters in each word. SUNFLOWER has 9 letters.", category: "codes" },
            { q: "If A=2, B=4, C=6 (each letter equals its position times 2), what does BAD add up to?", options: ["14", "18", "28", "10"], correct: 0, explanation: "B is the 2nd letter so B=4. A is the 1st so A=2. D is the 4th so D=8. Total: 4+2+8 = 14.", category: "codes" },
            { q: "If A=1, B=2, C=3... what is the value of MATHS? (Add the letters)", options: ["54", "56", "61", "50"], correct: 2, explanation: "M=13, A=1, T=20, H=8, S=19. Total: 13+1+20+8+19 = 61.", category: "codes" },
            { q: "Heart + heart = 16. Spade + spade + spade = 15. What is heart + spade?", options: ["13", "11", "12", "15"], correct: 0, explanation: "2 x heart = 16, so heart = 8. 3 x spade = 15, so spade = 5. Heart + spade = 8 + 5 = 13.", category: "codes" },
            { q: "In a secret code, TREE = 1233 and REED = 2334. What is DEER?", options: ["4332", "3324", "4233", "2334"], correct: 0, explanation: "From TREE=1233: T=1, R=2, E=3. From REED=2334: R=2, E=3, D=4. So DEER = D(4) E(3) E(3) R(2) = 4332.", category: "codes" },
            // ODD ONE OUT — TRICKY (12)
            { q: "Which number does NOT belong: 4, 9, 16, 25, 30?", options: ["4", "9", "30", "25"], correct: 2, explanation: "4, 9, 16, 25 are perfect squares (2², 3², 4², 5²). 30 is not a perfect square.", category: "oddoneout" },
            { q: "Which does NOT belong: whale, dolphin, shark, seal?", options: ["Whale", "Dolphin", "Shark", "Seal"], correct: 2, explanation: "Whale, dolphin, and seal are mammals. Shark is a fish. The odd one out is the shark.", category: "oddoneout" },
            { q: "Which number does NOT belong: 2, 3, 5, 7, 9?", options: ["2", "3", "9", "7"], correct: 2, explanation: "2, 3, 5, 7 are prime numbers. 9 is not prime (9 = 3 x 3).", category: "oddoneout" },
            { q: "Which does NOT belong: guitar, violin, drum, cello?", options: ["Guitar", "Violin", "Drum", "Cello"], correct: 2, explanation: "Guitar, violin, and cello are all stringed instruments. A drum is a percussion instrument.", category: "oddoneout" },
            { q: "Which number does NOT belong: 1, 3, 6, 10, 16?", options: ["1", "3", "16", "10"], correct: 2, explanation: "1, 3, 6, 10 are triangular numbers (1, 1+2, 1+2+3, 1+2+3+4). The next would be 15, not 16.", category: "oddoneout" },
            { q: "Which does NOT belong: penguin, ostrich, eagle, kiwi?", options: ["Penguin", "Ostrich", "Eagle", "Kiwi"], correct: 2, explanation: "Penguin, ostrich, and kiwi are all flightless birds. Eagles can fly.", category: "oddoneout" },
            { q: "Which does NOT belong: Mars, Jupiter, Moon, Saturn?", options: ["Mars", "Jupiter", "Moon", "Saturn"], correct: 2, explanation: "Mars, Jupiter, and Saturn are planets. The Moon is a natural satellite, not a planet.", category: "oddoneout" },
            { q: "Which number does NOT belong: 8, 27, 64, 100, 125?", options: ["8", "27", "100", "125"], correct: 2, explanation: "8=2³, 27=3³, 64=4³, 125=5³ are all perfect cubes. 100 is not a perfect cube.", category: "oddoneout" },
            { q: "Which does NOT belong: democracy, monarchy, geography, dictatorship?", options: ["Democracy", "Monarchy", "Geography", "Dictatorship"], correct: 2, explanation: "Democracy, monarchy, and dictatorship are types of government. Geography is a subject, not a government type.", category: "oddoneout" },
            { q: "Which does NOT belong: centimetre, kilogram, metre, kilometre?", options: ["Centimetre", "Kilogram", "Metre", "Kilometre"], correct: 1, explanation: "Centimetre, metre, and kilometre all measure length. Kilogram measures mass/weight.", category: "oddoneout" },
            { q: "Which does NOT belong: simile, metaphor, fraction, alliteration?", options: ["Simile", "Metaphor", "Fraction", "Alliteration"], correct: 2, explanation: "Simile, metaphor, and alliteration are all literary devices used in English. Fraction is a maths concept.", category: "oddoneout" },
            { q: "Which number does NOT belong: 12, 18, 24, 30, 35?", options: ["12", "18", "35", "30"], correct: 2, explanation: "12, 18, 24, 30 are all multiples of 6. 35 is not divisible by 6.", category: "oddoneout" },
            // MATRIX & GRID PATTERNS (10)
            { q: "In a 3x3 grid, each row adds to 15. Row 1: 2, 7, 6. Row 2: 9, 5, 1. Row 3: 4, 3, ?. What is the missing number?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Row 3 must add to 15: 4 + 3 + ? = 15, so ? = 8.", category: "matrix" },
            { q: "In a grid, Row 1: 1, 4, 7. Row 2: 2, 5, 8. Row 3: 3, 6, ?. What is the missing number?", options: ["7", "8", "9", "10"], correct: 2, explanation: "Each column increases by 1 going down. Column 3: 7, 8, 9. The missing number is 9.", category: "matrix" },
            { q: "In a grid, Row 1: A, C, E. Row 2: B, D, F. Row 3: C, E, ?. What letter is missing?", options: ["F", "G", "H", "I"], correct: 1, explanation: "Row 1 starts at A and skips letters (A,C,E). Row 2 starts at B (B,D,F). Row 3 starts at C (C,E,G). Missing letter is G.", category: "matrix" },
            { q: "In a 3x3 grid, each row doubles: Row 1: 1, 2, 4. Row 2: 3, 6, 12. Row 3: 5, 10, ?. What is the missing number?", options: ["15", "20", "25", "30"], correct: 1, explanation: "Each number doubles across the row. Row 3: 5, 10, 20. The missing number is 20.", category: "matrix" },
            { q: "Grid pattern — Row 1: 2, 4, 6. Row 2: 3, 6, 9. Row 3: 4, 8, ?. What is the missing number?", options: ["10", "12", "14", "16"], correct: 1, explanation: "Row 1: multiples of 2. Row 2: multiples of 3. Row 3: multiples of 4 (4, 8, 12).", category: "matrix" },
            { q: "In a grid — Row 1: 10, 8, 6. Row 2: 9, 7, 5. Row 3: 8, 6, ?. What is the missing number?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Each row decreases by 2. Each column decreases by 1. Row 3: 8, 6, 4.", category: "matrix" },
            { q: "Grid — Row 1: 1, 1, 2. Row 2: 1, 2, 3. Row 3: 2, 3, ?. What number completes the grid?", options: ["4", "5", "6", "7"], correct: 1, explanation: "In each row, the third number equals the sum of the first two. Row 3: 2 + 3 = 5.", category: "matrix" },
            { q: "In a 3x3 grid, columns add to 12. Column 1: 3, 5, 4. Column 2: 2, 6, 4. Column 3: 7, 1, ?. What is the missing number?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Column 3 must add to 12: 7 + 1 + ? = 12, so ? = 4.", category: "matrix" },
            { q: "Grid — Row 1: 2, 6, 18. Row 2: 3, 9, 27. Row 3: 4, 12, ?. What is the missing number?", options: ["24", "36", "48", "16"], correct: 1, explanation: "Each row multiplies by 3: 4 x 3 = 12, 12 x 3 = 36.", category: "matrix" },
            { q: "Grid — Row 1: 100, 50, 25. Row 2: 80, 40, 20. Row 3: 60, 30, ?. What is the missing number?", options: ["10", "15", "20", "25"], correct: 1, explanation: "Each row halves then halves again. Row 3: 60, 30, 15.", category: "matrix" },
            // TRUTH-TELLERS & LIARS (10)
            { q: "Maya always tells the truth. Noah always lies. Maya says: 'Noah took the last cookie.' Did Noah take the last cookie?", options: ["Yes, because Maya always tells the truth", "No, because Noah always lies", "We cannot tell", "Only if Maya saw it"], correct: 0, explanation: "Maya always tells the truth, so if she says Noah took it, he did.", category: "truthliar" },
            { q: "Olive always tells the truth. Pete always lies. Pete says: 'I did NOT break the vase.' What really happened?", options: ["Pete did not break the vase", "Pete broke the vase", "Olive broke the vase", "Nobody broke the vase"], correct: 1, explanation: "Pete always lies. He says he did NOT break it, so the opposite is true: he DID break it.", category: "truthliar" },
            { q: "One of Ruby and Sami always tells the truth, and the other always lies. Ruby says: 'I always lie.' What do we know?", options: ["Ruby is the truth-teller", "Ruby is the liar", "Sami is the liar", "We cannot tell"], correct: 1, explanation: "A truth-teller would never say 'I always lie' (that would be a lie). A liar WOULD say 'I always lie' (because it is actually true, and liars lie). So Ruby is the liar.", category: "truthliar" },
            { q: "Tara always tells the truth. Uma always lies. Tara says: 'Uma would say the treasure is in Box A.' Where is the treasure?", options: ["Box A", "Not in Box A", "We cannot tell", "In both boxes"], correct: 1, explanation: "Tara truthfully reports what Uma WOULD say. Uma would lie about the location. If Uma says Box A, the treasure is NOT in Box A.", category: "truthliar" },
            { q: "Vince always tells the truth. Wendy always lies. Vince says: 'We are both liars.' Is this possible?", options: ["Yes", "No, this is impossible", "Only on Tuesdays", "Only if there are 3 people"], correct: 1, explanation: "Vince always tells the truth. If he says 'we are both liars,' that would be a lie (since he is a truth-teller). But he cannot lie. So this statement is impossible.", category: "truthliar" },
            { q: "Alex always lies. Bea always tells the truth. Alex says: 'Bea and I are the same type.' What does this tell us?", options: ["They are the same type", "They are different types", "Alex is a truth-teller", "Nothing — it is meaningless"], correct: 1, explanation: "Alex lies, so his statement is false. They are NOT the same type. (Which checks out: Alex is a liar, Bea is a truth-teller.)", category: "truthliar" },
            { q: "Three friends: one always tells truth, one always lies, one sometimes lies. The truth-teller says: 'I am not the one who sometimes lies.' Is this helpful?", options: ["Yes, it confirms who they are", "No, because anyone could say that", "Only if we know who the liar is", "It proves they are the liar"], correct: 1, explanation: "A truth-teller would say this truthfully. But a liar would also say this (lying about being the sometimes-liar). And the sometimes-liar could say it too. So this statement doesn't help us identify anyone.", category: "truthliar" },
            { q: "Dan always tells the truth. Eve always lies. You need to find which door leads to safety. You can ask ONE person ONE question. You ask Dan: 'Which door leads to safety?' He points to Door 1. What should you do?", options: ["Go through Door 1", "Go through Door 2", "Ask Eve as well", "We cannot decide"], correct: 0, explanation: "Dan always tells the truth. If he points to Door 1, Door 1 is safe.", category: "truthliar" },
            { q: "Freya always lies. George always tells the truth. Freya says: 'George would tell you the answer is 7.' What is the real answer?", options: ["7", "Not 7", "We need more information", "Both 7 and not 7"], correct: 1, explanation: "Freya lies about what George would say. If George would truthfully say the answer is 7, Freya would NOT say that. Since Freya says George would say 7, George would NOT say 7, meaning the answer is NOT 7.", category: "truthliar" },
            { q: "Hannah always tells the truth. Ivan always lies. Ivan says: 'Neither of us ate the cake.' Hannah says: 'One of us did.' Who ate the cake?", options: ["Hannah", "Ivan", "Both of them", "Neither of them"], correct: 1, explanation: "Ivan always lies. He says neither of them ate the cake, so that is false — at least one of them DID eat it. Hannah always tells the truth and says one of them did. Since Hannah is truthful, she would not claim to have eaten it if she did not, but the question is about who. Since Ivan is the liar and is covering up, Ivan ate the cake.", category: "truthliar" },
            // SPATIAL REASONING — ADVANCED (12)
            { q: "A square piece of paper is folded in half once, then a single hole is punched through all layers. How many holes are there when unfolded?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Folding once creates 2 layers. Punching through all layers makes 2 holes when unfolded.", category: "spatial" },
            { q: "A square piece of paper is folded in half twice, then a single hole is punched. How many holes when unfolded?", options: ["2", "3", "4", "8"], correct: 2, explanation: "Folding twice creates 4 layers. One punch goes through all 4 layers = 4 holes.", category: "spatial" },
            { q: "A cube has how many corners (vertices)?", options: ["4", "6", "8", "12"], correct: 2, explanation: "A cube has 8 corners. Think of the top face (4 corners) and bottom face (4 corners).", category: "spatial" },
            { q: "If you look at the letter 'b' in a mirror placed to its right, what do you see?", options: ["b", "d", "p", "q"], correct: 1, explanation: "A mirror on the right flips the letter horizontally. 'b' becomes 'd'.", category: "spatial" },
            { q: "A 3D shape has 5 faces, 8 edges, and 5 vertices. What is it?", options: ["Cube", "Triangular prism", "Square-based pyramid", "Cone"], correct: 2, explanation: "A square-based pyramid has 1 square base + 4 triangular faces = 5 faces, 8 edges, 5 vertices.", category: "spatial" },
            { q: "How many squares can you count in a 3x3 grid? (Count all sizes)", options: ["9", "10", "13", "14"], correct: 3, explanation: "9 small (1x1) + 4 medium (2x2) + 1 large (3x3) = 14 squares.", category: "spatial" },
            { q: "A cube is painted red on all sides, then cut into 27 small cubes (3x3x3). How many small cubes have NO red paint?", options: ["0", "1", "6", "8"], correct: 1, explanation: "Only the cube in the very centre has no painted faces. That is 1 cube.", category: "spatial" },
            { q: "If you rotate the letter N by 90 degrees clockwise, what does it look like?", options: ["Z", "N", "U", "S"], correct: 0, explanation: "Rotating N by 90° clockwise makes it look like Z.", category: "spatial" },
            { q: "A piece of paper is folded in half three times. How many sections are there when fully unfolded?", options: ["4", "6", "8", "16"], correct: 2, explanation: "Each fold doubles the sections: 1→2→4→8. Three folds make 8 sections.", category: "spatial" },
            { q: "Which of these nets can be folded into a cube? Net A: a cross shape (T-shape with extra square). Net B: 6 squares in a straight line. Net C: 5 squares in an L with 1 extra on top.", options: ["Only Net A", "Only Net B", "Only Net C", "Both Net A and Net C"], correct: 0, explanation: "A cross/plus shape is a valid cube net. Six squares in a straight line cannot fold into a cube (sides would overlap). The answer is Net A.", category: "spatial" },
            { q: "A tower is built with blocks: bottom layer has 4 blocks in a 2x2 square, middle layer has 2 blocks side by side, top layer has 1 block. How many blocks total?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Bottom: 4 blocks + Middle: 2 blocks + Top: 1 block = 7 blocks.", category: "spatial" },
            { q: "If you look at the word 'BED' in a mirror placed below it (reflecting upward), which letter looks the same?", options: ["B", "E", "D", "None of them"], correct: 3, explanation: "A mirror below flips vertically (upside down). None of B, E, or D look the same when flipped upside down.", category: "spatial" },
            // NUMBER LOGIC & LATERAL THINKING (12)
            { q: "A pencil and eraser cost $1.10 together. The pencil costs $1 more than the eraser. How much does the eraser cost?", options: ["$0.10", "$0.05", "$1.00", "$0.55"], correct: 1, explanation: "If eraser = $0.05, then pencil = $1.05 (which is $1 more). $1.05 + $0.05 = $1.10. If eraser = $0.10, pencil = $1.10, total = $1.20 (too much!).", category: "number_logic" },
            { q: "5 machines make 5 toys in 5 minutes. How many minutes does it take 100 machines to make 100 toys?", options: ["100 minutes", "20 minutes", "5 minutes", "1 minute"], correct: 2, explanation: "Each machine makes 1 toy in 5 minutes. So 100 machines each make 1 toy in 5 minutes = 100 toys in 5 minutes.", category: "number_logic" },
            { q: "A snail climbs 3 metres up a wall during the day but slides back 2 metres at night. The wall is 10 metres high. How many days to reach the top?", options: ["10", "8", "7", "9"], correct: 1, explanation: "Each full day+night = +1 metre. After 7 days: 7m. On day 8, it climbs 3m to reach 10m and escapes before sliding back.", category: "number_logic" },
            { q: "How many times does the digit 1 appear when you write all numbers from 1 to 20?", options: ["9", "10", "11", "12"], correct: 3, explanation: "1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21... wait, up to 20: 1(1), 10(1), 11(2), 12(1), 13(1), 14(1), 15(1), 16(1), 17(1), 18(1), 19(1). Count: 1+1+2+1+1+1+1+1+1+1+1 = 12.", category: "number_logic" },
            { q: "In 5 years, Dad will be exactly 3 times as old as his son. Dad is currently 31 and his son is currently 7. Is this true?", options: ["Yes", "No — Dad will be more than 3 times as old", "No — Dad will be less than 3 times as old", "We need more information"], correct: 0, explanation: "In 5 years: Dad = 36, Son = 12. Is 36 = 3 x 12? Yes!", category: "number_logic" },
            { q: "You have 3 pairs of socks in a drawer (red, blue, green) all mixed up. What is the minimum number you need to pull out (in the dark) to GUARANTEE a matching pair?", options: ["2", "3", "4", "6"], correct: 2, explanation: "Worst case: you pick one red, one blue, one green (all different). The 4th sock MUST match one of those 3.", category: "number_logic" },
            { q: "A train leaves Town A at 9:00 AM going 60 km/h. Another train leaves Town B (120 km away) at 9:00 AM going 40 km/h toward Town A. When do they meet?", options: ["9:30 AM", "10:00 AM", "10:12 AM", "10:30 AM"], correct: 2, explanation: "Combined speed = 100 km/h. Distance = 120 km. Time = 120/100 = 1.2 hours = 1 hour 12 minutes. They meet at 10:12 AM.", category: "number_logic" },
            { q: "There are 12 months in a year. How many months have exactly 30 days?", options: ["4", "6", "7", "11"], correct: 0, explanation: "April, June, September, November — exactly 4 months have exactly 30 days.", category: "number_logic" },
            { q: "If you have 10 coins totalling $1.00, and you must use at least one of each: 5c, 10c, 20c, which combination works?", options: ["Five 5c, three 10c, two 20c", "Six 5c, two 10c, two 20c", "Four 5c, four 10c, two 20c", "Seven 5c, one 10c, two 20c"], correct: 2, explanation: "Check each: A: 25+30+40=95c ✗. B: 30+20+40=90c ✗. C: 20+40+40=100c ✓ and 4+4+2=10 coins ✓. D: 35+10+40=85c ✗.", category: "number_logic" },
            { q: "A farmer has chickens and cows. She counts 20 heads and 56 legs. How many chickens does she have?", options: ["8", "10", "12", "14"], correct: 2, explanation: "Let chickens = c, cows = w. c + w = 20. 2c + 4w = 56. From first: w = 20-c. Substituting: 2c + 4(20-c) = 56 → 2c + 80 - 4c = 56 → -2c = -24 → c = 12.", category: "number_logic" },
            { q: "What is the smallest number of cuts needed to cut a pizza into 8 equal slices?", options: ["3", "4", "7", "8"], correct: 1, explanation: "You cannot get 8 equal slices with 3 straight cuts through the centre (3 cuts give max 6 equal pieces through centre). You need 4 cuts through the centre, each 45° apart.", category: "number_logic" },
            { q: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°", "7.5°", "15°", "90°"], correct: 1, explanation: "At 3:15, the minute hand is on 3 (90°). The hour hand has moved past 3 by 15 minutes worth: 15/60 × 30° = 7.5° past the 3. So the angle between them is 7.5°.", category: "number_logic" },
            // FIND THE FLAW / FAULTY REASONING (18)
            { q: "Mia wore her lucky socks to the test and got 100%. She says the socks made her do well. What is wrong with her reasoning?", options: ["The socks might actually be lucky", "Just because two things happened together does not mean one caused the other", "She should have worn lucky shoes too", "She needs to test it more than once"], correct: 1, explanation: "This is correlation, not causation. Mia did well because she studied (or was lucky), not because of the socks. Two things happening together does not prove one caused the other.", category: "flaw" },
            { q: "Tom says: 'My grandma smoked and lived to 95, so smoking is not bad for you.' What is wrong with this reasoning?", options: ["His grandma was just lucky", "One example does not prove something is true for everyone", "Smoking is illegal", "He should ask a doctor"], correct: 1, explanation: "This is a hasty generalisation from one example. One person surviving does not prove smoking is safe for everyone. Scientific studies of millions of people show it is harmful.", category: "flaw" },
            { q: "Everyone in class voted for pizza for the party. Lily says: 'Pizza must be the healthiest food since everyone chose it.' What is the flaw?", options: ["Pizza is actually healthy", "Something being popular does not make it healthy or correct", "They should have voted for salad", "Lily did not vote"], correct: 1, explanation: "This is an appeal to popularity. Just because many people like something does not make it true, correct, or best. Popularity does not equal quality or truth.", category: "flaw" },
            { q: "Ben says: 'You either love sport or you love reading. Since you love reading, you must hate sport.' What is wrong?", options: ["Reading is better than sport", "You can love both sport and reading at the same time", "Sport is better than reading", "He should try both"], correct: 1, explanation: "This is a false dichotomy (false either/or). Ben presents only two options when many people enjoy BOTH sport and reading. Life is not always one-or-the-other.", category: "flaw" },
            { q: "Sophie says: 'This is the best movie because it is so well-made, and you can tell it is well-made because it is the best movie.' What is wrong?", options: ["The movie might not be good", "She is using her conclusion to prove her conclusion (going in circles)", "She should read reviews", "She has not seen enough movies"], correct: 1, explanation: "This is circular reasoning. Sophie is using her conclusion (best movie) as evidence for itself (well-made because it is best, and best because it is well-made). She needs independent evidence.", category: "flaw" },
            { q: "Noah says: 'Tall people are better at maths. My proof? My sister is tall and she got an A.' What is wrong?", options: ["His sister is not really tall", "Height has nothing to do with maths ability, and one example proves nothing", "He should measure more people", "Tall people are actually better at English"], correct: 1, explanation: "Two flaws: irrelevant evidence (height has nothing to do with maths ability) and a hasty generalisation (one example does not prove a general rule).", category: "flaw" },
            { q: "Ella says: 'I asked 3 friends and they all prefer cats, so everyone in Australia prefers cats to dogs.' What is wrong?", options: ["Dogs are actually more popular", "3 friends is far too small a group to represent all of Australia", "She should have asked 10 friends", "Cats are better pets"], correct: 1, explanation: "This is a hasty generalisation from a tiny sample. 3 friends cannot represent millions of Australians. A proper survey would need many more people from different places.", category: "flaw" },
            { q: "Jake says: 'It rained every time I washed Dad\\'s car last month. So washing the car causes rain.' What is wrong?", options: ["Cars do not affect weather", "Just because two things happen at the same time does not mean one causes the other", "He should wash the car more often to check", "Rain causes car washing, not the other way around"], correct: 1, explanation: "This is confusing correlation with causation. It likely rained coincidentally on those days, or Jake noticed rain more on those days. Washing a car cannot change the weather.", category: "flaw" },
            { q: "Ava says: 'Everyone should eat ice cream for dinner because it would make everyone happy.' What is the flaw?", options: ["Ice cream is too expensive", "Feeling happy is not the only thing that matters — nutrition matters too", "Not everyone likes ice cream", "Dinner should always be hot food"], correct: 1, explanation: "Ava ignores other important factors like health and nutrition. Making people happy in the short term does not mean something is a good idea overall.", category: "flaw" },
            { q: "Ryan says: 'The school cricket team lost every game this year. If we get new uniforms, we will start winning.' What is wrong?", options: ["New uniforms are too expensive", "Uniforms do not affect how well a team plays — they need to practise more", "The old uniforms are fine", "They should get a new coach instead"], correct: 1, explanation: "Ryan assumes uniforms affect performance, which is irrelevant evidence. Winning depends on skill, practice, and teamwork — not clothes.", category: "flaw" },
            { q: "Zara checked the weather every Monday for 4 weeks. It was sunny each time. She concludes: 'Mondays are always sunny.' What is the flaw?", options: ["She should check Tuesdays too", "Four weeks is too small a sample, and she is generalising from limited data", "Mondays are actually rainy", "Weather cannot be predicted"], correct: 1, explanation: "This is a hasty generalisation. Four observations is far too few to conclude Mondays are ALWAYS sunny. Weather varies and does not follow the day of the week.", category: "flaw" },
            { q: "Liam says: 'My team won when I sat in seat 7. We lost when I sat elsewhere. Seat 7 is our lucky seat.' What is the flaw?", options: ["Seat 7 might actually be lucky", "The team winning has nothing to do with where Liam sits — it is just a coincidence", "He should sit in seat 7 more often to check", "Seats do not have numbers"], correct: 1, explanation: "This confuses correlation with causation. The team won or lost because of how they played, not because of Liam\\'s seat. It was a coincidence.", category: "flaw" },
            { q: "Chloe says: 'We should not listen to the new girl\\'s idea because she just started at our school.' What is wrong?", options: ["New students have better ideas", "The quality of an idea does not depend on how long someone has been at the school", "She should wait a year before sharing ideas", "The new girl should try harder"], correct: 1, explanation: "This is an irrelevant argument (sometimes called ad hominem). How long someone has attended a school says nothing about whether their idea is good or bad. Judge the idea, not the person.", category: "flaw" },
            { q: "Max says: 'Every swan I have ever seen is white. Therefore, all swans in the world are white.' What is the flaw?", options: ["Swans come in many colours", "He cannot know about all swans everywhere just from the ones he has personally seen", "He should visit more lakes", "White is the most common swan colour"], correct: 1, explanation: "This is a hasty generalisation. Max has only seen a limited number of swans. In fact, black swans exist in Australia! You cannot generalise from limited personal experience to all cases.", category: "flaw" },
            { q: "Isla says: 'I failed the maths test because I sat next to Jack, and he is bad at maths.' What is wrong?", options: ["Jack might actually be good at maths", "Someone else\\'s ability does not affect your own test performance", "She should sit next to someone smart", "The teacher should move Jack"], correct: 1, explanation: "Sitting near someone has no effect on your own test performance (assuming no cheating). Isla is blaming an irrelevant factor instead of looking at her own preparation.", category: "flaw" },
            { q: "Oscar says: 'My dad says this car is the best, and he would not lie to me, so it must be the best car.' What is the flaw?", options: ["His dad might be lying", "His dad might believe it, but that does not make it objectively true — it is just one opinion", "He should ask his mum too", "Cars are all the same"], correct: 1, explanation: "This is an appeal to authority without evidence. Even if Oscar\\'s dad is honest, his opinion about cars is still just an opinion, not a proven fact. Being trustworthy does not make someone always correct.", category: "flaw" },
            { q: "Ruby says: 'I got sick after eating at that restaurant, so their food must be unsafe.' What is the flaw?", options: ["The restaurant is actually safe", "She might have gotten sick from something else — one experience is not enough proof", "She should eat there again to check", "Everyone gets sick sometimes"], correct: 1, explanation: "Ruby assumes the restaurant caused her illness (correlation, not proven causation) and generalises from one event. She could have caught a virus, eaten something else, or been unwell already.", category: "flaw" },
            { q: "Kai says: 'Our class scored 80% on the science test after our teacher gave us lollies. Lollies must make you smarter!' What is the flaw?", options: ["Lollies do make you smarter because of sugar", "Getting lollies and scoring well happened together, but that does not prove lollies caused the good score", "The teacher should give lollies more often", "80% is not a good score"], correct: 1, explanation: "This is correlation, not causation. The class likely scored well because they studied or the test was well-taught, not because of lollies. Two events happening together does not mean one caused the other.", category: "flaw" },
            // PROCESS OF ELIMINATION / CONSTRAINT PUZZLES (10)
            { q: "Ali, Bea, and Cal each have a different pet: cat, dog, fish. Ali does not have the dog. Bea has the fish. Who has the dog?", options: ["Ali", "Bea", "Cal", "Cannot tell"], correct: 2, explanation: "Bea has fish. Ali does not have dog. So Ali has cat, and Cal has dog.", category: "elimination" },
            { q: "Three friends (Dan, Eve, Fay) each play a different sport: tennis, soccer, swimming. Dan does not play soccer. Eve does not play tennis or soccer. What sport does Dan play?", options: ["Tennis", "Soccer", "Swimming", "Cannot tell"], correct: 0, explanation: "Eve does not play tennis or soccer, so Eve plays swimming. Dan does not play soccer, so Dan plays tennis. Fay plays soccer.", category: "elimination" },
            { q: "Four children (Gus, Hana, Ian, Jess) sit in a row. Gus sits at the left end. Hana sits next to Ian. Jess does not sit next to Gus. What position is Jess in? (1=left end)", options: ["1st", "2nd", "3rd", "4th"], correct: 3, explanation: "Gus is 1st. Jess is not next to Gus, so Jess is not 2nd. Hana and Ian must be next to each other. They fill positions 2 and 3, leaving Jess in 4th.", category: "elimination" },
            { q: "Kim, Leo, and Mia each bring a different snack: apple, banana, cookie. Kim does not bring fruit. Leo brings the apple. What does Mia bring?", options: ["Apple", "Banana", "Cookie", "Cannot tell"], correct: 1, explanation: "Leo brings apple. Kim does not bring fruit (apple or banana), so Kim brings cookie. Mia brings banana.", category: "elimination" },
            { q: "Nia, Omar, and Pip each wear a different colour: red, blue, green. Nia does not wear red. Omar does not wear red or green. What colour does Pip wear?", options: ["Red", "Blue", "Green", "Cannot tell"], correct: 0, explanation: "Omar cannot wear red or green, so Omar wears blue. Nia does not wear red, so Nia wears green. Pip wears red.", category: "elimination" },
            { q: "Three activities (art, music, drama) happen on three days (Mon, Tue, Wed). Art is not on Monday. Music is on Wednesday. Drama is not on Wednesday. When is art?", options: ["Monday", "Tuesday", "Wednesday", "Cannot tell"], correct: 1, explanation: "Music is on Wednesday. Drama is not on Wednesday, and art is not on Monday. So drama is on Monday, and art is on Tuesday.", category: "elimination" },
            { q: "Quin, Rosa, Sam, and Tia each like a different season: spring, summer, autumn, winter. Quin likes a warm season. Rosa does not like autumn or winter. Sam likes winter. Tia does not like summer. What season does Tia like?", options: ["Spring", "Summer", "Autumn", "Winter"], correct: 2, explanation: "Sam likes winter. Rosa does not like autumn or winter, so Rosa likes spring or summer. Quin likes a warm season (spring or summer). Tia does not like summer and not winter (Sam has it). If Rosa and Quin both like warm seasons, one gets spring and one gets summer. Tia gets autumn.", category: "elimination" },
            { q: "Four friends sit around a square table (one on each side). Uma sits across from Val. Wes sits to the left of Uma. Where does Xia sit?", options: ["Across from Wes", "Next to Uma on her left", "Across from Uma", "Next to Wes on his left"], correct: 0, explanation: "Uma is on one side, Val across from her. Wes is to Uma's left. The only remaining seat is to Uma's right (across from Wes). Xia sits across from Wes.", category: "elimination" },
            { q: "Three children (Yara, Zane, Abby) scored 75, 85, and 95 on a test. Yara scored higher than Zane. Abby scored higher than Yara. What did Zane score?", options: ["75", "85", "95", "Cannot tell"], correct: 0, explanation: "Abby > Yara > Zane. Highest to lowest: Abby=95, Yara=85, Zane=75.", category: "elimination" },
            { q: "Ben, Cara, and Dev each own a different coloured bike: yellow, purple, orange. Dev does not own the yellow bike. Cara owns the purple bike. What colour is Ben\\'s bike?", options: ["Yellow", "Purple", "Orange", "Cannot tell"], correct: 0, explanation: "Cara owns purple. Dev does not own yellow, so Dev owns orange. Ben owns yellow.", category: "elimination" }
        ];
    }

    // ===== UI CREATION =====
    createUI() {
        // Main OC Test modal
        const modal = document.createElement('div');
        modal.id = 'oc-test-modal';
        modal.className = 'oc-modal';
        modal.innerHTML = `
            <div class="oc-modal-content">
                <div class="oc-header">
                    <h2>🎓 OC Practice Test</h2>
                    <button class="oc-close-btn" onclick="window.ocTest.close()">×</button>
                </div>
                <div class="oc-body">
                    <!-- Content changes based on state -->
                    <div id="oc-menu" class="oc-section">
                        <h3>Welcome to OC Practice!</h3>
                        <p class="oc-subtitle">Choose a section to practice:</p>
                        
                        <div class="oc-section-cards">
                            <div class="oc-card" onclick="window.ocTest.startSection('reading')">
                                <span class="oc-card-emoji">📖</span>
                                <span class="oc-card-title">Reading Comprehension</span>
                                <span class="oc-card-desc">Passages & questions</span>
                                <span class="oc-card-score" id="reading-score">Score: 0/0</span>
                            </div>
                            <div class="oc-card" onclick="window.ocTest.startSection('maths')">
                                <span class="oc-card-emoji">🔢</span>
                                <span class="oc-card-title">Mathematical Reasoning</span>
                                <span class="oc-card-desc">Patterns, problems, geometry</span>
                                <span class="oc-card-score" id="maths-score">Score: 0/0</span>
                            </div>
                            <div class="oc-card" onclick="window.ocTest.startSection('thinking')">
                                <span class="oc-card-emoji">🧠</span>
                                <span class="oc-card-title">Thinking Skills</span>
                                <span class="oc-card-desc">Logic, codes, puzzles</span>
                                <span class="oc-card-score" id="thinking-score">Score: 0/0</span>
                            </div>
                            <div class="oc-card guided-practice-card" onclick="window.ocTest.startGuidedPractice()">
                                <span class="oc-card-emoji">🎯</span>
                                <span class="oc-card-title">Guided Practice</span>
                                <span class="oc-card-desc">Thinking Skills with hints</span>
                                <span class="oc-card-badge">Learn Mode</span>
                            </div>
                        </div>
                        
                        <div class="oc-options">
                            <label class="oc-checkbox">
                                <input type="checkbox" id="timed-mode"> 
                                ⏱️ Timed Mode (30 seconds per question)
                            </label>
                        </div>
                        
                        <div class="oc-total-stats">
                            <h4>📊 Overall Progress</h4>
                            <div id="total-stats">Loading...</div>
                        </div>

                        <button class="oc-btn oc-btn-secondary" onclick="window.ocTest.showPerformanceDashboard()" style="margin-top: 15px;">
                            📈 View Performance Dashboard
                        </button>
                    </div>

                    <div id="oc-dashboard" class="oc-section" style="display:none;">
                        <div class="oc-dashboard-header">
                            <h3>📈 Performance Dashboard</h3>
                            <button class="oc-btn oc-btn-small" onclick="window.ocTest.showMenu()">← Back</button>
                        </div>
                        <div id="oc-dashboard-content">
                            <!-- Dashboard content loaded dynamically -->
                        </div>
                    </div>
                    
                    <div id="oc-question" class="oc-section" style="display:none;">
                        <div class="oc-question-header">
                            <span id="oc-section-label">Section</span>
                            <span id="oc-progress">Question 1/5</span>
                            <span id="oc-timer" style="display:none;">⏱️ 30s</span>
                        </div>
                        
                        <div id="oc-passage-container" style="display:none;">
                            <div class="oc-passage">
                                <h4 id="oc-passage-title"></h4>
                                <div id="oc-passage-text"></div>
                            </div>
                        </div>
                        
                        <div class="oc-question-text" id="oc-question-text">
                            Question text here
                        </div>
                        
                        <div class="oc-options-list" id="oc-options-list">
                            <!-- Options generated dynamically -->
                        </div>
                        
                        <div class="oc-feedback" id="oc-feedback" style="display:none;">
                            <div id="oc-feedback-text"></div>
                            <button class="oc-btn" onclick="window.ocTest.nextQuestion()">Next Question →</button>
                        </div>
                    </div>
                    
                    <div id="oc-results" class="oc-section" style="display:none;">
                        <h3>🎉 Session Complete!</h3>
                        <div class="oc-results-content" id="oc-results-content">
                            <!-- Results displayed here -->
                        </div>
                        <div class="oc-results-buttons">
                            <button class="oc-btn" onclick="window.ocTest.showMenu()">Back to Menu</button>
                            <button class="oc-btn oc-btn-primary" onclick="window.ocTest.startSection(window.ocTest.currentSection)">Try Again</button>
                        </div>
                    </div>

                    <div id="oc-guided-question" class="oc-section" style="display:none;">
                        <!-- Progress indicator -->
                        <div class="guided-progress">
                            <span class="guided-progress-text">Question <span id="guided-q-num">1</span> of <span id="guided-q-total">5</span></span>
                            <div class="guided-progress-bar">
                                <div class="guided-progress-fill" id="guided-progress-fill"></div>
                            </div>
                        </div>

                        <!-- The Rule Box -->
                        <div class="guided-rule-box">
                            <div class="guided-rule-label">📋 The Rule:</div>
                            <div class="guided-rule-text" id="guided-rule-text"></div>
                        </div>

                        <!-- Person's Statement -->
                        <div class="guided-person-section">
                            <div class="guided-person-avatar" id="guided-person-avatar">👦</div>
                            <div class="guided-person-bubble">
                                <div class="guided-person-name" id="guided-person-name">Jack:</div>
                                <div class="guided-person-statement" id="guided-person-statement"></div>
                            </div>
                        </div>

                        <!-- Question -->
                        <div class="guided-question-prompt">
                            Which one of the following sentences shows the mistake <span id="guided-person-name-q">Jack</span> has made?
                        </div>

                        <!-- Hint Button (shows before answering) -->
                        <div class="guided-hint-section" id="guided-hint-section">
                            <button class="guided-hint-btn" id="guided-hint-btn" onclick="window.ocTest.showGuidedHint()">
                                💡 Need a hint?
                            </button>
                            <div class="guided-hint-box" id="guided-hint-box" style="display:none;"></div>
                        </div>

                        <!-- Answer Options -->
                        <div class="guided-options" id="guided-options"></div>

                        <!-- Feedback (shows after answering) -->
                        <div class="guided-feedback" id="guided-feedback" style="display:none;">
                            <div class="guided-feedback-result" id="guided-feedback-result"></div>
                            <div class="guided-feedback-explanation" id="guided-feedback-explanation"></div>
                            <div class="guided-teaching-point" id="guided-teaching-point"></div>
                            <button class="oc-btn oc-btn-primary" onclick="window.ocTest.nextGuidedQuestion()">
                                Next Question →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.updateScoreDisplays();
    }

    // ===== PROGRESS MANAGEMENT =====
    loadProgress() {
        const saved = localStorage.getItem('ocTestProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.score = data.score || { reading: 0, maths: 0, thinking: 0 };
            this.totalAttempted = data.totalAttempted || { reading: 0, maths: 0, thinking: 0 };
        }
    }

    saveProgress() {
        localStorage.setItem('ocTestProgress', JSON.stringify({
            score: this.score,
            totalAttempted: this.totalAttempted
        }));
    }

    updateScoreDisplays() {
        const readingEl = document.getElementById('reading-score');
        const mathsEl = document.getElementById('maths-score');
        const thinkingEl = document.getElementById('thinking-score');
        const totalEl = document.getElementById('total-stats');

        if (readingEl) readingEl.textContent = `Score: ${this.score.reading}/${this.totalAttempted.reading}`;
        if (mathsEl) mathsEl.textContent = `Score: ${this.score.maths}/${this.totalAttempted.maths}`;
        if (thinkingEl) thinkingEl.textContent = `Score: ${this.score.thinking}/${this.totalAttempted.thinking}`;

        if (totalEl) {
            const total = this.score.reading + this.score.maths + this.score.thinking;
            const attempted = this.totalAttempted.reading + this.totalAttempted.maths + this.totalAttempted.thinking;
            const percentage = attempted > 0 ? Math.round((total / attempted) * 100) : 0;
            totalEl.innerHTML = `
                <p>Total Correct: <strong>${total}/${attempted}</strong> (${percentage}%)</p>
                <div class="oc-progress-bar">
                    <div class="oc-progress-fill" style="width: ${percentage}%"></div>
                </div>
            `;
        }
    }

    // ===== MODAL CONTROL =====
    open() {
        document.getElementById('oc-test-modal').style.display = 'flex';
        this.showMenu();
    }

    close() {
        document.getElementById('oc-test-modal').style.display = 'none';
        this.stopTimer();
    }

    showMenu() {
        document.getElementById('oc-menu').style.display = 'block';
        document.getElementById('oc-question').style.display = 'none';
        document.getElementById('oc-results').style.display = 'none';
        const dashboard = document.getElementById('oc-dashboard');
        if (dashboard) dashboard.style.display = 'none';
        const guidedQuestion = document.getElementById('oc-guided-question');
        if (guidedQuestion) guidedQuestion.style.display = 'none';
        this.updateScoreDisplays();
        this.stopTimer();
    }

    // ===== TEST SESSION =====
    startSection(section) {
        this.currentSection = section;
        this.currentQuestionIndex = 0;
        this.sessionQuestions = [];
        this.sessionAnswers = [];
        this.sessionDetails = []; // Reset detailed tracking
        this.timedMode = document.getElementById('timed-mode')?.checked || false;

        // Generate questions for this session
        // Mix procedural (new each time) with static (curated) questions
        if (section === 'reading') {
            // Pick a random passage
            const passage = this.readingPassages[Math.floor(Math.random() * this.readingPassages.length)];
            this.currentPassage = passage;
            // Shuffle and pick questions
            this.sessionQuestions = this.shuffleArray([...passage.questions]).slice(0, this.questionsPerSession);
        } else if (section === 'maths') {
            // Use procedural generator for fresh questions if available
            if (window.proceduralOC) {
                // Mix: 2 procedural + 3 from bank for variety
                const proceduralQs = window.proceduralOC.generateBatch(3, 'maths');
                const staticQs = this.shuffleArray([...this.mathsQuestions]).slice(0, 2);
                this.sessionQuestions = this.shuffleArray([...proceduralQs, ...staticQs]);
            } else {
                this.sessionQuestions = this.shuffleArray([...this.mathsQuestions]).slice(0, this.questionsPerSession);
            }
        } else if (section === 'thinking') {
            // Use procedural generator for fresh questions if available
            if (window.proceduralOC) {
                // Mix: 4 procedural + 1 from bank for variety
                const proceduralQs = window.proceduralOC.generateBatch(4, 'thinking');
                const staticQs = this.shuffleArray([...this.thinkingQuestions]).slice(0, 1);
                this.sessionQuestions = this.shuffleArray([...proceduralQs, ...staticQs]);
            } else {
                this.sessionQuestions = this.shuffleArray([...this.thinkingQuestions]).slice(0, this.questionsPerSession);
            }
        }

        this.showQuestion();
    }

    showQuestion() {
        document.getElementById('oc-menu').style.display = 'none';
        document.getElementById('oc-question').style.display = 'block';
        document.getElementById('oc-results').style.display = 'none';
        document.getElementById('oc-feedback').style.display = 'none';

        const question = this.sessionQuestions[this.currentQuestionIndex];

        // Update header
        const sectionLabels = { reading: '📖 Reading', maths: '🔢 Maths', thinking: '🧠 Thinking' };
        document.getElementById('oc-section-label').textContent = sectionLabels[this.currentSection];
        document.getElementById('oc-progress').textContent = `Question ${this.currentQuestionIndex + 1}/${this.sessionQuestions.length}`;

        // Show passage for reading section
        const passageContainer = document.getElementById('oc-passage-container');
        if (this.currentSection === 'reading' && this.currentPassage) {
            passageContainer.style.display = 'block';
            document.getElementById('oc-passage-title').textContent = this.currentPassage.title;
            document.getElementById('oc-passage-text').innerHTML = this.currentPassage.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        } else {
            passageContainer.style.display = 'none';
        }

        // Show question
        document.getElementById('oc-question-text').textContent = question.q;

        // Show options
        const optionsList = document.getElementById('oc-options-list');
        optionsList.innerHTML = '';
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'oc-option-btn';
            btn.innerHTML = `<span class="oc-option-letter">${String.fromCharCode(65 + index)}</span> ${option}`;
            btn.onclick = () => this.selectAnswer(index);
            optionsList.appendChild(btn);
        });

        // Timer
        if (this.timedMode) {
            this.startTimer();
        }

        // Start timing this question for performance tracking
        this.questionStartTime = Date.now();
    }

    selectAnswer(index) {
        this.stopTimer();

        const question = this.sessionQuestions[this.currentQuestionIndex];
        const isCorrect = index === question.correct;

        // Calculate time spent
        const timeSpent = this.questionStartTime ? Math.round((Date.now() - this.questionStartTime) / 1000) : 0;

        // Get question category
        const category = question.category || 'general';

        // Update stats
        this.totalAttempted[this.currentSection]++;
        if (isCorrect) {
            this.score[this.currentSection]++;
        }
        this.saveProgress();

        // Record to performance tracker
        if (window.ocPerformance) {
            window.ocPerformance.recordAnswer(this.currentSection, category, isCorrect, timeSpent);
        }

        // Store detailed session info
        this.sessionDetails.push({
            category: category,
            isCorrect: isCorrect,
            timeSpent: timeSpent
        });

        // Store answer
        this.sessionAnswers.push({ questionIndex: this.currentQuestionIndex, selected: index, correct: question.correct, isCorrect, category, timeSpent });

        // Show feedback
        const optionBtns = document.querySelectorAll('.oc-option-btn');
        optionBtns.forEach((btn, i) => {
            btn.disabled = true;
            if (i === question.correct) {
                btn.classList.add('correct');
            } else if (i === index && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        const feedback = document.getElementById('oc-feedback');
        const feedbackText = document.getElementById('oc-feedback-text');

        if (isCorrect) {
            feedbackText.innerHTML = `<span class="oc-correct">✅ Correct!</span><p>${question.explanation}</p>`;
            // Award gold in game
            if (this.game) {
                this.game.player.gold += 10;
                this.game.updateHUD();
            }
        } else {
            feedbackText.innerHTML = `<span class="oc-incorrect">❌ Not quite.</span><p>The correct answer was: <strong>${question.options[question.correct]}</strong></p><p>${question.explanation}</p>`;
        }

        feedback.style.display = 'block';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.sessionQuestions.length) {
            this.showResults();
        } else {
            this.showQuestion();
        }
    }

    showResults() {
        document.getElementById('oc-menu').style.display = 'none';
        document.getElementById('oc-question').style.display = 'none';
        document.getElementById('oc-results').style.display = 'block';

        const correct = this.sessionAnswers.filter(a => a.isCorrect).length;
        const total = this.sessionAnswers.length;
        const percentage = Math.round((correct / total) * 100);

        // Record session to performance tracker
        if (window.ocPerformance) {
            window.ocPerformance.recordSession({
                section: this.currentSection,
                questions: this.sessionDetails,
                score: correct,
                total: total
            });
        }

        let message = '';
        let emoji = '';
        if (percentage === 100) {
            message = 'Perfect! Amazing work! 🌟';
            emoji = '🏆';
        } else if (percentage >= 80) {
            message = 'Excellent! Keep it up!';
            emoji = '🎉';
        } else if (percentage >= 60) {
            message = 'Good effort! Practice makes perfect!';
            emoji = '👍';
        } else {
            message = "Keep practicing! You're improving!";
            emoji = '💪';
        }

        const goldEarned = correct * 10;

        // Get recommendations if available
        let recommendationsHtml = '';
        if (window.ocPerformance) {
            const recommendations = window.ocPerformance.getRecommendations();
            const relevantRecs = recommendations.filter(r => r.section === this.currentSection).slice(0, 2);
            if (relevantRecs.length > 0) {
                recommendationsHtml = `
                    <div class="oc-recommendations">
                        <h4>💡 Tips to Improve:</h4>
                        ${relevantRecs.map(r => `
                            <div class="oc-recommendation-item ${r.priority}">
                                <strong>${r.categoryName}</strong>: ${r.tip}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        document.getElementById('oc-results-content').innerHTML = `
            <div class="oc-results-score">
                <span class="oc-results-emoji">${emoji}</span>
                <span class="oc-results-number">${correct}/${total}</span>
                <span class="oc-results-percent">(${percentage}%)</span>
            </div>
            <p class="oc-results-message">${message}</p>
            <p class="oc-results-gold">💰 You earned ${goldEarned} gold!</p>

            <div class="oc-results-breakdown">
                <h4>Your Answers:</h4>
                ${this.sessionAnswers.map((a, i) => `
                    <div class="oc-result-item ${a.isCorrect ? 'correct' : 'incorrect'}">
                        <span>Q${i + 1}${a.category ? ` (${a.category})` : ''}:</span>
                        <span>${a.isCorrect ? '✅' : '❌'}</span>
                        <span class="oc-time">${a.timeSpent}s</span>
                    </div>
                `).join('')}
            </div>

            ${recommendationsHtml}
        `;
    }

    // ===== TIMER =====
    startTimer() {
        this.timeRemaining = 30;
        const timerEl = document.getElementById('oc-timer');
        timerEl.style.display = 'inline';
        timerEl.textContent = `⏱️ ${this.timeRemaining}s`;

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            timerEl.textContent = `⏱️ ${this.timeRemaining}s`;

            if (this.timeRemaining <= 10) {
                timerEl.classList.add('warning');
            }

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.selectAnswer(-1); // Time's up, wrong answer
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        const timerEl = document.getElementById('oc-timer');
        if (timerEl) {
            timerEl.style.display = 'none';
            timerEl.classList.remove('warning');
        }
    }

    // ===== PERFORMANCE DASHBOARD =====
    showPerformanceDashboard() {
        document.getElementById('oc-menu').style.display = 'none';
        document.getElementById('oc-question').style.display = 'none';
        document.getElementById('oc-results').style.display = 'none';
        document.getElementById('oc-dashboard').style.display = 'block';

        this.renderDashboard();
    }

    renderDashboard() {
        const container = document.getElementById('oc-dashboard-content');

        if (!window.ocPerformance) {
            container.innerHTML = '<p>Performance tracking not available.</p>';
            return;
        }

        const summary = window.ocPerformance.getSummary();

        // Section overview
        const sectionHtml = `
            <div class="oc-dashboard-sections">
                <h4>Section Performance</h4>
                <div class="oc-section-stats">
                    ${this.renderSectionStat('📖 Reading', summary.sections.reading, 'reading')}
                    ${this.renderSectionStat('🔢 Maths', summary.sections.maths, 'maths')}
                    ${this.renderSectionStat('🧠 Thinking', summary.sections.thinking, 'thinking')}
                </div>
            </div>
        `;

        // Overall stats
        const overallHtml = `
            <div class="oc-dashboard-overall">
                <div class="oc-stat-box">
                    <span class="oc-stat-number">${summary.totalQuestions}</span>
                    <span class="oc-stat-label">Questions Attempted</span>
                </div>
                <div class="oc-stat-box">
                    <span class="oc-stat-number">${summary.overall !== null ? summary.overall + '%' : '-'}</span>
                    <span class="oc-stat-label">Overall Accuracy</span>
                </div>
                <div class="oc-stat-box">
                    <span class="oc-stat-number">${summary.recentSessions.length}</span>
                    <span class="oc-stat-label">Sessions Completed</span>
                </div>
            </div>
        `;

        // Weaknesses
        let weaknessHtml = '';
        if (summary.weaknesses.length > 0) {
            weaknessHtml = `
                <div class="oc-dashboard-weaknesses">
                    <h4>⚠️ Areas to Improve</h4>
                    <div class="oc-weakness-list">
                        ${summary.weaknesses.map(w => `
                            <div class="oc-weakness-item">
                                <span class="oc-weakness-name">${w.categoryName}</span>
                                <span class="oc-weakness-accuracy" style="color: ${this.getAccuracyColor(w.accuracy)}">${w.accuracy}%</span>
                                <span class="oc-weakness-attempts">(${w.attempts} attempts)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Strengths
        let strengthHtml = '';
        if (summary.strengths.length > 0) {
            strengthHtml = `
                <div class="oc-dashboard-strengths">
                    <h4>⭐ Your Strengths</h4>
                    <div class="oc-strength-list">
                        ${summary.strengths.map(s => `
                            <div class="oc-strength-item">
                                <span class="oc-strength-name">${s.categoryName}</span>
                                <span class="oc-strength-accuracy" style="color: ${this.getAccuracyColor(s.accuracy)}">${s.accuracy}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Recommendations
        let recsHtml = '';
        if (summary.recommendations.length > 0) {
            recsHtml = `
                <div class="oc-dashboard-recs">
                    <h4>💡 Recommendations</h4>
                    <div class="oc-rec-list">
                        ${summary.recommendations.map(r => `
                            <div class="oc-rec-item oc-rec-${r.priority}">
                                <div class="oc-rec-header">
                                    <span class="oc-rec-priority">${this.getPriorityBadge(r.priority)}</span>
                                    <span class="oc-rec-category">${r.categoryName}</span>
                                </div>
                                <p class="oc-rec-message">${r.message}</p>
                                ${r.tip ? `<p class="oc-rec-tip">💡 ${r.tip}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Category breakdown
        const categoryHtml = this.renderCategoryBreakdown();

        // Recent sessions
        let sessionsHtml = '';
        if (summary.recentSessions.length > 0) {
            sessionsHtml = `
                <div class="oc-dashboard-sessions">
                    <h4>📅 Recent Sessions</h4>
                    <div class="oc-session-list">
                        ${summary.recentSessions.map(s => `
                            <div class="oc-session-item">
                                <span class="oc-session-section">${this.getSectionEmoji(s.section)} ${s.section}</span>
                                <span class="oc-session-score">${s.score}/${s.total}</span>
                                <span class="oc-session-date">${this.formatDate(s.date)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // No data message
        let noDataHtml = '';
        if (summary.totalQuestions === 0) {
            noDataHtml = `
                <div class="oc-no-data">
                    <p>No performance data yet!</p>
                    <p>Start practicing to see your progress here.</p>
                </div>
            `;
        }

        container.innerHTML = `
            ${noDataHtml || overallHtml + sectionHtml + weaknessHtml + strengthHtml + recsHtml + categoryHtml + sessionsHtml}
            <div class="oc-dashboard-actions">
                <button class="oc-btn oc-btn-danger" onclick="window.ocTest.confirmResetData()">Reset All Data</button>
            </div>
        `;
    }

    renderSectionStat(label, accuracy, section) {
        const trend = window.ocPerformance ? window.ocPerformance.getTrend(section) : 'insufficient_data';
        const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : trend === 'stable' ? '➡️' : '';

        return `
            <div class="oc-section-stat">
                <span class="oc-section-label">${label}</span>
                <span class="oc-section-accuracy" style="color: ${this.getAccuracyColor(accuracy)}">${accuracy !== null ? accuracy + '%' : '-'}</span>
                <span class="oc-section-trend">${trendIcon}</span>
            </div>
        `;
    }

    renderCategoryBreakdown() {
        if (!window.ocPerformance) return '';

        const sections = ['maths', 'thinking', 'reading'];
        let html = '<div class="oc-category-breakdown"><h4>📊 Detailed Breakdown</h4>';

        for (const section of sections) {
            const stats = window.ocPerformance.getSectionStats(section);
            const categories = Object.entries(stats);

            if (categories.length === 0) continue;

            html += `<div class="oc-category-section">
                <h5>${this.getSectionEmoji(section)} ${section.charAt(0).toUpperCase() + section.slice(1)}</h5>
                <div class="oc-category-grid">`;

            for (const [name, data] of categories) {
                const displayName = window.ocPerformance.formatCategoryName(`${section}_${name}`);
                html += `
                    <div class="oc-category-item">
                        <span class="oc-cat-name">${displayName}</span>
                        <div class="oc-cat-bar">
                            <div class="oc-cat-fill" style="width: ${data.accuracy}%; background: ${this.getAccuracyColor(data.accuracy)}"></div>
                        </div>
                        <span class="oc-cat-stats">${data.accuracy}% (${data.correct}/${data.total})</span>
                    </div>
                `;
            }

            html += '</div></div>';
        }

        html += '</div>';
        return html;
    }

    getAccuracyColor(accuracy) {
        if (accuracy === null) return '#888';
        if (accuracy >= 80) return '#4CAF50';
        if (accuracy >= 60) return '#FF9800';
        return '#f44336';
    }

    getPriorityBadge(priority) {
        switch (priority) {
            case 'critical': return '🔴';
            case 'moderate': return '🟡';
            case 'explore': return '🔵';
            default: return '⚪';
        }
    }

    getSectionEmoji(section) {
        const emojis = { maths: '🔢', thinking: '🧠', reading: '📖' };
        return emojis[section] || '📝';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    confirmResetData() {
        if (confirm('Are you sure you want to reset all performance data? This cannot be undone.')) {
            if (window.ocPerformance) {
                window.ocPerformance.resetAllData();
                this.renderDashboard();
            }
        }
    }

    // ===== GUIDED PRACTICE MODE =====

    startGuidedPractice() {
        // Check if question bank is loaded
        if (!window.GUIDED_THINKING_QUESTIONS || window.GUIDED_THINKING_QUESTIONS.length === 0) {
            console.error('Guided thinking questions not loaded!');
            alert('Guided Practice questions are still loading. Please try again.');
            return;
        }

        this.guidedMode = true;
        this.guidedQuestionIndex = 0;
        this.guidedScore = 0;
        this.guidedHintUsed = false;
        this.guidedAnswered = false;
        this.guidedTotalHintsUsed = 0;

        // Shuffle and pick 5 questions
        this.guidedQuestions = this.shuffleArray([...window.GUIDED_THINKING_QUESTIONS]).slice(0, 5);

        // Hide menu, show guided question UI
        document.getElementById('oc-menu').style.display = 'none';
        document.getElementById('oc-question').style.display = 'none';
        document.getElementById('oc-results').style.display = 'none';
        document.getElementById('oc-dashboard').style.display = 'none';
        document.getElementById('oc-guided-question').style.display = 'block';

        this.showGuidedQuestion();
    }

    showGuidedQuestion() {
        const q = this.guidedQuestions[this.guidedQuestionIndex];
        this.guidedHintUsed = false;
        this.guidedAnswered = false;

        // Update progress
        document.getElementById('guided-q-num').textContent = this.guidedQuestionIndex + 1;
        document.getElementById('guided-q-total').textContent = this.guidedQuestions.length;
        const progressPercent = ((this.guidedQuestionIndex) / this.guidedQuestions.length) * 100;
        document.getElementById('guided-progress-fill').style.width = progressPercent + '%';

        // Fill in the content
        document.getElementById('guided-rule-text').textContent = q.rule;
        document.getElementById('guided-person-avatar').textContent = q.personAvatar;
        document.getElementById('guided-person-name').textContent = q.person + ':';
        document.getElementById('guided-person-statement').textContent = '"' + q.statement + '"';
        document.getElementById('guided-person-name-q').textContent = q.person;

        // Reset hint section
        document.getElementById('guided-hint-btn').disabled = false;
        document.getElementById('guided-hint-box').style.display = 'none';
        document.getElementById('guided-hint-section').style.display = 'block';

        // Build options
        const optionsContainer = document.getElementById('guided-options');
        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'guided-option';
            btn.textContent = opt;
            btn.onclick = () => this.selectGuidedAnswer(idx);
            optionsContainer.appendChild(btn);
        });

        // Hide feedback
        document.getElementById('guided-feedback').style.display = 'none';
    }

    showGuidedHint() {
        const q = this.guidedQuestions[this.guidedQuestionIndex];

        // Get appropriate hint based on flaw type
        const hint = window.GUIDED_HINT_TEMPLATES && window.GUIDED_HINT_TEMPLATES[q.flawType]
            ? window.GUIDED_HINT_TEMPLATES[q.flawType]
            : "💡 Hint: Read the rule carefully and compare it to what the person said. What did they assume or miss?";

        const hintBox = document.getElementById('guided-hint-box');
        hintBox.textContent = hint;
        hintBox.style.display = 'block';

        document.getElementById('guided-hint-btn').disabled = true;
        this.guidedHintUsed = true;
        this.guidedTotalHintsUsed++;
    }

    selectGuidedAnswer(selectedIndex) {
        if (this.guidedAnswered) return;
        this.guidedAnswered = true;

        const q = this.guidedQuestions[this.guidedQuestionIndex];
        const isCorrect = selectedIndex === q.correctIndex;

        // Update option styling
        const options = document.querySelectorAll('.guided-option');
        options.forEach((opt, idx) => {
            opt.style.pointerEvents = 'none';
            if (idx === q.correctIndex) {
                opt.classList.add('correct');
            } else if (idx === selectedIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        // Hide hint section
        document.getElementById('guided-hint-section').style.display = 'none';

        // Show feedback
        const feedbackEl = document.getElementById('guided-feedback');
        const resultEl = document.getElementById('guided-feedback-result');
        const explanationEl = document.getElementById('guided-feedback-explanation');
        const teachingEl = document.getElementById('guided-teaching-point');

        if (isCorrect) {
            this.guidedScore++;
            resultEl.className = 'guided-feedback-result correct';
            resultEl.textContent = '✓ Correct!' + (this.guidedHintUsed ? ' (with hint)' : ' Great job!');

            // Award gold (less if hint was used)
            const goldEarned = this.guidedHintUsed ? 5 : 10;
            if (this.game && this.game.player) {
                this.game.player.gold += goldEarned;
                if (this.game.updateHUD) this.game.updateHUD();
            }
        } else {
            resultEl.className = 'guided-feedback-result incorrect';
            resultEl.textContent = "✗ Not quite - let's learn from this!";
        }

        explanationEl.textContent = q.explanation;
        teachingEl.textContent = q.teachingPoint;
        feedbackEl.style.display = 'block';

        // Scroll feedback into view
        feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    nextGuidedQuestion() {
        this.guidedQuestionIndex++;

        if (this.guidedQuestionIndex >= this.guidedQuestions.length) {
            this.showGuidedResults();
        } else {
            this.showGuidedQuestion();
            // Scroll to top of question
            document.getElementById('oc-guided-question').scrollIntoView({ behavior: 'smooth' });
        }
    }

    showGuidedResults() {
        document.getElementById('oc-guided-question').style.display = 'none';
        document.getElementById('oc-results').style.display = 'block';

        const total = this.guidedQuestions.length;
        const score = this.guidedScore;
        const percentage = Math.round((score / total) * 100);

        let emoji, message;
        if (percentage >= 80) {
            emoji = '🌟';
            message = 'Excellent thinking skills!';
        } else if (percentage >= 60) {
            emoji = '👍';
            message = 'Good work! Keep practising!';
        } else {
            emoji = '💪';
            message = "Keep learning - you'll get better!";
        }

        // Calculate gold earned (10 for correct without hint, 5 for correct with hint)
        const goldWithoutHint = (score - this.guidedTotalHintsUsed) * 10;
        const goldWithHint = this.guidedTotalHintsUsed * 5;
        const totalGold = Math.max(0, goldWithoutHint) + Math.min(score, this.guidedTotalHintsUsed) * 5;

        document.getElementById('oc-results-content').innerHTML = `
            <div class="oc-results-score">
                <span class="oc-results-emoji">${emoji}</span>
                <span class="oc-results-number">${score}/${total}</span>
                <span class="oc-results-percent">(${percentage}%)</span>
            </div>
            <p class="oc-results-message">${message}</p>
            <p class="oc-results-gold">💰 Gold earned this session: ${score * (this.guidedTotalHintsUsed > 0 ? 7 : 10)}</p>
            <div class="guided-results-tips">
                <h4>🎯 Remember These Key Skills:</h4>
                <ul>
                    <li><strong>AND conditions:</strong> ALL parts must be met, not just some</li>
                    <li><strong>Optional vs Required:</strong> "May" ≠ "Must not"</li>
                    <li><strong>Chance vs Certainty:</strong> Entering doesn't mean winning</li>
                    <li><strong>Match ALL characteristics:</strong> One mismatch = wrong conclusion</li>
                </ul>
            </div>
        `;

        // Update results buttons for guided mode
        const resultsButtons = document.querySelector('.oc-results-buttons');
        if (resultsButtons) {
            resultsButtons.innerHTML = `
                <button class="oc-btn" onclick="window.ocTest.showMenu()">Back to Menu</button>
                <button class="oc-btn oc-btn-primary" onclick="window.ocTest.startGuidedPractice()">Try Again</button>
            `;
        }

        // Save score to localStorage
        this.saveGuidedScore(score, total);

        // Reset guided mode flag
        this.guidedMode = false;
    }

    saveGuidedScore(correct, total) {
        const key = 'oc_guided_thinking_scores';
        let scores = JSON.parse(localStorage.getItem(key) || '[]');
        scores.push({
            date: new Date().toISOString(),
            correct,
            total,
            percentage: Math.round((correct / total) * 100)
        });
        // Keep last 20 attempts
        if (scores.length > 20) scores = scores.slice(-20);
        localStorage.setItem(key, JSON.stringify(scores));
    }

    // ===== HELPERS =====
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize when game is ready
function initOCTest() {
    if (window.game) {
        window.ocTest = new OCPracticeTest(window.game);
        console.log('OC Practice Test initialized');
    } else {
        setTimeout(initOCTest, 100);
    }
}

window.addEventListener('load', () => {
    setTimeout(initOCTest, 300);
});
