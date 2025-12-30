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
            // LOGICAL DEDUCTION
            { q: "All Bloops are Razzles. All Razzles are Lazzles. What must be true?", options: ["All Lazzles are Bloops", "All Bloops are Lazzles", "All Lazzles are Razzles", "No Bloops are Lazzles"], correct: 1, explanation: "If all Bloops are Razzles, and all Razzles are Lazzles, then all Bloops must also be Lazzles", category: "logic" },
            { q: "All dogs bark. Spot is a dog. What can we conclude?", options: ["Spot doesn't bark", "Spot can fly", "Spot barks", "All barking things are dogs"], correct: 2, explanation: "If all dogs bark and Spot is a dog, then Spot barks", category: "logic" },
            { q: "No fish can climb trees. Goldie is a fish. What is true?", options: ["Goldie can climb trees", "Goldie cannot climb trees", "Goldie might climb trees", "All fish climb trees"], correct: 1, explanation: "If no fish can climb trees, and Goldie is a fish, Goldie cannot climb trees", category: "logic" },
            { q: "Some birds can swim. Penguins are birds. What MIGHT be true?", options: ["All penguins can swim", "No penguins can swim", "Penguins might be able to swim", "All birds swim"], correct: 2, explanation: "Since only SOME birds can swim, penguins might or might not be among them", category: "logic" },
            { q: "If it rains, the ground gets wet. The ground is wet. What can we conclude?", options: ["It definitely rained", "It might have rained", "It didn't rain", "Rain is impossible"], correct: 1, explanation: "We can't be certain it rained—the ground could be wet for other reasons (sprinkler, etc.)", category: "logic" },
            { q: "All squares are rectangles. All rectangles have 4 sides. What must be true?", options: ["All squares have 3 sides", "All squares have 4 sides", "Some squares have 5 sides", "Rectangles are squares"], correct: 1, explanation: "If all squares are rectangles and all rectangles have 4 sides, all squares have 4 sides", category: "logic" },
            
            // ANALOGIES
            { q: "CAT is to KITTEN as DOG is to ___", options: ["PUPPY", "BARK", "PET", "TAIL"], correct: 0, explanation: "A kitten is a baby cat, a puppy is a baby dog", category: "analogies" },
            { q: "HOT is to COLD as UP is to ___", options: ["HIGH", "DOWN", "WARM", "SKY"], correct: 1, explanation: "Hot and cold are opposites, as are up and down", category: "analogies" },
            { q: "BIRD is to FLY as FISH is to ___", options: ["WATER", "SWIM", "SCALES", "FIN"], correct: 1, explanation: "Birds fly through air, fish swim through water", category: "analogies" },
            { q: "BOOK is to READ as SONG is to ___", options: ["MUSIC", "SING", "DANCE", "LISTEN"], correct: 3, explanation: "You read a book, you listen to a song", category: "analogies" },
            { q: "HAND is to GLOVE as FOOT is to ___", options: ["LEG", "SOCK", "TOE", "SHOE"], correct: 1, explanation: "A glove covers a hand, a sock covers a foot", category: "analogies" },
            { q: "HAPPY is to SAD as FAST is to ___", options: ["QUICK", "SLOW", "RUN", "SPEED"], correct: 1, explanation: "Happy and sad are opposites, fast and slow are opposites", category: "analogies" },
            { q: "PAINTER is to BRUSH as WRITER is to ___", options: ["BOOK", "PEN", "PAPER", "STORY"], correct: 1, explanation: "A painter uses a brush, a writer uses a pen", category: "analogies" },
            { q: "EYE is to SEE as EAR is to ___", options: ["SOUND", "HEAR", "MUSIC", "LOUD"], correct: 1, explanation: "Eyes see, ears hear", category: "analogies" },
            { q: "BEE is to HIVE as ANT is to ___", options: ["COLONY", "HILL", "BUG", "SMALL"], correct: 0, explanation: "Bees live in a hive, ants live in a colony", category: "analogies" },
            { q: "MORNING is to SUNRISE as EVENING is to ___", options: ["SUNSET", "DARK", "NIGHT", "MOON"], correct: 0, explanation: "Morning has sunrise, evening has sunset", category: "analogies" },
            
            // CODES AND CIPHERS
            { q: "If A=1, B=2, C=3... what does CAT equal?", options: ["24", "6", "7", "21"], correct: 0, explanation: "C=3, A=1, T=20. Total: 3+1+20=24", category: "codes" },
            { q: "If A=1, B=2... what does DOG equal?", options: ["26", "27", "25", "24"], correct: 0, explanation: "D=4, O=15, G=7. Total: 4+15+7=26", category: "codes" },
            { q: "Using the code A=Z, B=Y, C=X... what is BAD in code?", options: ["YZW", "ABC", "ZYX", "BAD"], correct: 0, explanation: "B→Y, A→Z, D→W. So BAD = YZW", category: "codes" },
            { q: "If CODE = DPHF (each letter +1), what is HELP?", options: ["IFMQ", "GDKO", "JFNR", "HELP"], correct: 0, explanation: "Each letter moves forward by 1: H→I, E→F, L→M, P→Q = IFMQ", category: "codes" },
            { q: "In a code, CAT = 312. What is BAT?", options: ["211", "213", "113", "212"], correct: 3, explanation: "If C=3, A=1, T=2, then B (one before C) = 2. So BAT = 212", category: "codes" },
            { q: "If 🌟 = 5 and 🌙 = 3, what is 🌟 + 🌟 + 🌙?", options: ["11", "13", "15", "8"], correct: 1, explanation: "5 + 5 + 3 = 13", category: "codes" },
            { q: "If □ = 4 and △ = 6, what is □ × △?", options: ["10", "24", "20", "12"], correct: 1, explanation: "4 × 6 = 24", category: "codes" },
            
            // SPATIAL REASONING - PATTERNS
            { q: "🔴🔵🔴🔵🔵🔴🔵🔵🔵🔴 — What comes next?", options: ["🔴", "🔵🔵🔵🔵", "🔵🔵", "🔵"], correct: 1, explanation: "Pattern: 🔴, then 1 blue, then 🔴, then 2 blues, then 🔴, then 3 blues, 🔴, then 4 blues", category: "spatial" },
            { q: "⬛⬜⬛⬛⬜⬛⬛⬛⬜ — What comes next?", options: ["⬛⬛⬛⬛", "⬜", "⬛⬜", "⬛"], correct: 0, explanation: "Pattern: 1 black, white, 2 black, white, 3 black, white, so next is 4 black", category: "spatial" },
            { q: "🔺🔻🔺🔺🔻🔻🔺🔺🔺 — What comes next?", options: ["🔻", "🔺", "🔻🔻🔻", "🔺🔺🔺🔺"], correct: 2, explanation: "Pattern: 1 up, 1 down, 2 up, 2 down, 3 up, then 3 down", category: "spatial" },
            { q: "If you fold a square piece of paper in half, what shape do you get?", options: ["Square", "Rectangle", "Triangle", "Circle"], correct: 1, explanation: "Folding a square in half creates a rectangle", category: "spatial" },
            { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1, explanation: "A hexagon has 6 sides (hexa = 6)", category: "spatial" },
            
            // SEQUENCE AND ARRANGEMENT
            { q: "5 children in a row. Ana is next to Ben. Ben is in the middle. Where could Ana be?", options: ["1st or 3rd position", "2nd or 4th position", "Only 2nd position", "Only 4th position"], correct: 1, explanation: "Ben is in position 3 (middle). Ana is next to him, so position 2 or 4", category: "sequences" },
            { q: "Tom is taller than Sam. Sam is taller than Jim. Who is shortest?", options: ["Tom", "Sam", "Jim", "Cannot tell"], correct: 2, explanation: "Tom > Sam > Jim, so Jim is shortest", category: "sequences" },
            { q: "Monday is 2 days before which day?", options: ["Sunday", "Wednesday", "Saturday", "Tuesday"], correct: 1, explanation: "Monday + 2 days = Wednesday", category: "sequences" },
            { q: "In a race: Amy finished before Bob. Charlie finished after Bob. Order?", options: ["Amy, Charlie, Bob", "Bob, Amy, Charlie", "Amy, Bob, Charlie", "Charlie, Bob, Amy"], correct: 2, explanation: "Amy before Bob, Charlie after Bob: Amy, Bob, Charlie", category: "sequences" },
            { q: "5 books on a shelf. Maths is between English and Science. English is first. What's 2nd?", options: ["Maths", "Science", "English", "Cannot tell"], correct: 0, explanation: "English is 1st, Maths is between English and Science, so Maths is 2nd", category: "sequences" },
            
            // VENN DIAGRAM LOGIC
            { q: "In a class, 15 like apples, 12 like bananas, 5 like both. How many like ONLY apples?", options: ["15", "10", "20", "5"], correct: 1, explanation: "Like only apples = 15 - 5 (who like both) = 10", category: "venn" },
            { q: "20 students play sport. 8 play soccer, 10 play basketball, 3 play both. How many play only basketball?", options: ["7", "10", "5", "3"], correct: 0, explanation: "Only basketball = 10 - 3 (who play both) = 7", category: "venn" },
            { q: "30 students: 18 have pets, 20 walk to school. If 10 have pets AND walk, how many do neither?", options: ["2", "10", "8", "12"], correct: 0, explanation: "Pet only:8, Walk only:10, Both:10. Total with either: 28. Neither: 30-28=2", category: "venn" },
            
            // ODD ONE OUT
            { q: "Which doesn't belong: apple, banana, carrot, orange?", options: ["Apple", "Banana", "Carrot", "Orange"], correct: 2, explanation: "Carrot is a vegetable; the others are fruits", category: "oddoneout" },
            { q: "Which doesn't belong: triangle, square, circle, rectangle?", options: ["Triangle", "Square", "Circle", "Rectangle"], correct: 2, explanation: "Circle has no straight sides; the others have straight sides", category: "oddoneout" },
            { q: "Which doesn't belong: 2, 5, 8, 11, 15?", options: ["2", "5", "15", "11"], correct: 2, explanation: "Pattern is +3: 2, 5, 8, 11, 14. 15 doesn't fit", category: "oddoneout" },
            { q: "Which doesn't belong: run, jump, swim, book?", options: ["Run", "Jump", "Swim", "Book"], correct: 3, explanation: "Run, jump, swim are actions; book is an object", category: "oddoneout" },
            { q: "Which doesn't belong: 36, 49, 64, 75, 81?", options: ["36", "49", "75", "81"], correct: 2, explanation: "36, 49, 64, 81 are perfect squares (6², 7², 8², 9²). 75 is not", category: "oddoneout" },
            
            // PUZZLES
            { q: "I have 6 faces but never frown. I have 12 edges but never cut. What am I?", options: ["Dice", "Cube", "Ball", "Pyramid"], correct: 1, explanation: "A cube has 6 faces and 12 edges", category: "puzzles" },
            { q: "What has hands but cannot clap?", options: ["A person", "A clock", "A glove", "A monkey"], correct: 1, explanation: "A clock has hands (hour and minute hands) but cannot clap", category: "puzzles" },
            { q: "The more you take, the more you leave behind. What are they?", options: ["Cookies", "Footsteps", "Books", "Clouds"], correct: 1, explanation: "The more steps you take, the more footsteps you leave behind", category: "puzzles" },
            { q: "What gets wetter the more it dries?", options: ["A sponge", "A towel", "Paper", "Sand"], correct: 1, explanation: "A towel gets wetter as it dries things", category: "puzzles" },
            
            // NUMBER LOGIC
            { q: "If 3 cats catch 3 mice in 3 minutes, how many cats needed to catch 100 mice in 100 minutes?", options: ["100", "33", "3", "9"], correct: 2, explanation: "Each cat catches 1 mouse in 3 minutes. In 100 minutes, each cat catches ~33 mice. Still need only 3 cats!", category: "number_logic" },
            { q: "A bat and ball cost $1.10 together. Bat costs $1 more than ball. How much is the ball?", options: ["$0.10", "$0.05", "$1.00", "$0.15"], correct: 1, explanation: "If ball = $0.05, bat = $1.05. Together = $1.10. ✓ If ball = $0.10, bat = $1.10, total = $1.20 ✗", category: "number_logic" },
            { q: "There are 12 months with 30 days. How many months have 28 days?", options: ["1 (February)", "All 12", "None", "11"], correct: 1, explanation: "Trick question! ALL months have at least 28 days", category: "number_logic" },
            { q: "A farmer has 17 sheep. All but 9 run away. How many does he have left?", options: ["8", "9", "17", "0"], correct: 1, explanation: "'All but 9' means 9 remain", category: "number_logic" }
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
        this.updateScoreDisplays();
        this.stopTimer();
    }

    // ===== TEST SESSION =====
    startSection(section) {
        this.currentSection = section;
        this.currentQuestionIndex = 0;
        this.sessionQuestions = [];
        this.sessionAnswers = [];
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
                // Mix: 3 procedural + 2 from bank for variety
                const proceduralQs = window.proceduralOC.generateBatch(3, 'thinking');
                const staticQs = this.shuffleArray([...this.thinkingQuestions]).slice(0, 2);
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
    }

    selectAnswer(index) {
        this.stopTimer();

        const question = this.sessionQuestions[this.currentQuestionIndex];
        const isCorrect = index === question.correct;

        // Update stats
        this.totalAttempted[this.currentSection]++;
        if (isCorrect) {
            this.score[this.currentSection]++;
        }
        this.saveProgress();

        // Store answer
        this.sessionAnswers.push({ questionIndex: this.currentQuestionIndex, selected: index, correct: question.correct, isCorrect });

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
                        <span>Q${i + 1}:</span>
                        <span>${a.isCorrect ? '✅' : '❌'}</span>
                    </div>
                `).join('')}
            </div>
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
