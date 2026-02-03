// Beecroft Valley - Guided Thinking Skills Question Bank
// "Find the Flaw" logical reasoning questions with hints and teaching moments

const GUIDED_THINKING_QUESTIONS = [
    {
        id: "ftf_001",
        type: "find_the_flaw",
        flawType: "missing_condition",
        rule: "To get a gold sticker, you must have read at least 5 books AND done a report on one of them.",
        person: "Jack",
        personAvatar: "\u{1F466}",
        statement: "I've read 10 books this year. I will definitely be getting a gold sticker.",
        options: [
            "A. Jack read 10 books, when he was meant to read only 5.",
            "B. Jack has not done a report on a book.",
            "C. Jack is not in the class that gives out gold stickers.",
            "D. Jack has not read the right kind of books required for stickers."
        ],
        correctIndex: 1,
        explanation: "The rule says you need to read 5+ books AND do a report. Jack only mentions reading books - he hasn't confirmed he did a report. Without the report, he can't be sure he'll get the sticker!",
        teachingPoint: "\u{1F3AF} Key Skill: When you see 'AND' in a rule, ALL conditions must be met. Check each one!"
    },
    {
        id: "ftf_002",
        type: "find_the_flaw",
        flawType: "optional_vs_required",
        rule: "The next exam is optional for individuals who scored more than 90% in the last exam.",
        person: "Anna",
        personAvatar: "\u{1F467}",
        statement: "I scored more than 90% in the last exam. So, I will not be allowed to sit the next exam.",
        options: [
            "A. As Anna scored above 90%, she will not be able to sit the next exam.",
            "B. Just because Anna scored more than 90%, it does not mean she will be prohibited from sitting the next exam.",
            "C. Anna believes her exam score will decide if she sits her next exam.",
            "D. Anna does not care about exam scores."
        ],
        correctIndex: 1,
        explanation: "The rule says the exam is 'optional' - meaning Anna CAN skip it if she wants, but she's NOT forced to skip it! 'Optional' doesn't mean 'prohibited'.",
        teachingPoint: "\u{1F3AF} Key Skill: 'Optional' = you have a choice. 'Prohibited' = you're not allowed. These are very different!"
    },
    {
        id: "ftf_003",
        type: "find_the_flaw",
        flawType: "chance_vs_certainty",
        rule: "The local ice-cream shop is holding a raffle. In order to enter the raffle to win a Nintendo Switch, you must have bought at least $20 worth of ice-cream in the last two weeks.",
        person: "Caleb",
        personAvatar: "\u{1F466}",
        statement: "Well, in the last two weeks, I bought $5 worth of ice-cream on 5 separate days. I'm sure to win the Nintendo Switch.",
        options: [
            "A. Caleb didn't buy enough ice-cream.",
            "B. Buying ice-cream only gives Caleb a chance to win.",
            "C. Caleb does not have the appetite to eat $20 worth of ice-cream.",
            "D. Caleb should have bought $100 worth of ice-cream."
        ],
        correctIndex: 1,
        explanation: "Caleb spent $25 total ($5 \u00D7 5 days), so he CAN enter the raffle. But a raffle is a random draw - entering doesn't mean winning! He has a CHANCE, not a guarantee.",
        teachingPoint: "\u{1F3AF} Key Skill: A 'raffle' or 'competition' means there's a CHANCE to win, not a guaranteed win. Look for words like 'might', 'could', 'chance'."
    },
    {
        id: "ftf_004",
        type: "find_the_flaw",
        flawType: "certainty_ignored",
        rule: "The forecast says it will rain tomorrow, so Edward will not do his laundry tomorrow.",
        person: "Lily",
        personAvatar: "\u{1F467}",
        statement: "There is still a chance it won't rain tomorrow, so Edward should do his laundry.",
        options: [
            "A. Lily doesn't realise that Edward's laundry machine is also broken.",
            "B. Lily doesn't realise Edward doesn't have a lot of laundry to do.",
            "C. Lily has assumed that even if it rains, Edward should still do his laundry.",
            "D. Lily has disregarded the fact that it will certainly rain tomorrow."
        ],
        correctIndex: 3,
        explanation: "The rule states the forecast says 'it WILL rain' - this is presented as certain, not as a possibility. Lily is treating a certainty as if it were uncertain.",
        teachingPoint: "\u{1F3AF} Key Skill: Pay attention to certainty words! 'Will' = definite. 'Might/could' = possible. Don't change one into the other!"
    },
    {
        id: "ftf_005",
        type: "find_the_flaw",
        flawType: "partial_match",
        rule: "If water has a fizzy appearance with bubbles and has a slightly sour taste, it must be sparkling water.",
        person: "Denise",
        personAvatar: "\u{1F467}",
        statement: "My mum filled up my bottle for school today. The water looks very fizzy, it has bubbles and tastes like super sweet lemonade. It must be sparkling water.",
        options: [
            "A. Denise's mum did not actually pack her normal sparkling water.",
            "B. Super sweet lemonade does not have a sour taste, but sparkling water will have a slight sour taste.",
            "C. Sparkling water is only slightly fizzy, not very fizzy as Denise has described.",
            "D. Just because sparkling water has a set of characteristics, this does not mean that other drinks will also have the same set of characteristics."
        ],
        correctIndex: 1,
        explanation: "The rule says sparkling water has a 'slightly SOUR taste', but Denise says her drink tastes 'SWEET like lemonade'. It matches the fizzy/bubbles part but NOT the taste - so it's probably not sparkling water!",
        teachingPoint: "\u{1F3AF} Key Skill: To identify something, ALL characteristics must match. If even ONE doesn't fit, the conclusion might be wrong!"
    },
    {
        id: "ftf_006",
        type: "find_the_flaw",
        flawType: "single_factor",
        rule: "The New South Wales Rural Fire Service has installed a new network of loudspeaker sirens designed to give early warnings before bushfires reach towns.",
        person: "Ruby",
        personAvatar: "\u{1F467}",
        statement: "Because the sirens are in place, every town in New South Wales is now safe from bushfires.",
        options: [
            "A. During two recent thunderstorms, the sirens stopped working when the electricity failed.",
            "B. Some remote households sit in deep valleys where the siren sound cannot be heard.",
            "C. Last January, a town with the new sirens still lost several houses because residents had not cleared dry vegetation or made evacuation plans.",
            "D. So far, the siren network has been installed in only three-quarters of New South Wales towns."
        ],
        correctIndex: 2,
        explanation: "Ruby assumes sirens alone = complete safety. But Option C shows that even WITH sirens, houses were lost because other safety measures (clearing vegetation, evacuation plans) weren't done. Sirens help, but they're not the ONLY thing needed for safety.",
        teachingPoint: "\u{1F3AF} Key Skill: One safety measure doesn't guarantee complete safety. Look for what ELSE might be needed!"
    },
    {
        id: "ftf_007",
        type: "find_the_flaw",
        flawType: "overgeneralization",
        rule: "Tourism in Albury-Wodonga has been beneficial because it has increased awareness of the area's natural and historical attractions, leading to more preservation efforts and economic growth.",
        person: "Liam",
        personAvatar: "\u{1F466}",
        statement: "I disagree. Since tourism has increased, the natural habitats have been disturbed, and historical sites are at risk due to the higher foot traffic. Therefore, tourism is harmful and should be restricted.",
        options: [
            "A. Increased awareness of natural and historical attractions always leads to better preservation and economic benefits.",
            "B. All economic growth resulting from tourism is beneficial and should be encouraged without restrictions.",
            "C. Higher foot traffic, climate change, urbanisation and other activities at historical sites result in damage and degradation of these sites.",
            "D. A disturbance of natural habitats is an unavoidable consequence of any increase in tourism."
        ],
        correctIndex: 2,
        explanation: "Liam blames just 'higher foot traffic' from tourism for all the damage. But Option C shows that damage comes from MANY factors (climate change, urbanisation, other activities) - not just tourism. Liam is oversimplifying!",
        teachingPoint: "\u{1F3AF} Key Skill: Don't assume ONE thing causes ALL of a problem. Usually multiple factors are involved!"
    },
    {
        id: "ftf_008",
        type: "find_the_flaw",
        flawType: "missing_condition",
        rule: "Students can borrow up to 5 books from the library if they have returned all previously borrowed books and their library card is not expired.",
        person: "Maya",
        personAvatar: "\u{1F467}",
        statement: "I returned all my books yesterday, so I can definitely borrow 5 new books today.",
        options: [
            "A. Maya might want to borrow more than 5 books.",
            "B. Maya hasn't checked if her library card is still valid.",
            "C. The library might not have 5 books Maya wants to read.",
            "D. Maya should have returned her books earlier."
        ],
        correctIndex: 1,
        explanation: "The rule has TWO conditions: (1) return all books AND (2) library card not expired. Maya only confirmed the first one - she hasn't mentioned checking her card!",
        teachingPoint: "\u{1F3AF} Key Skill: Count ALL the conditions in a rule. Maya checked one but forgot the other!"
    },
    {
        id: "ftf_009",
        type: "find_the_flaw",
        flawType: "chance_vs_certainty",
        rule: "The school talent show winner will be chosen by audience vote. Anyone who performs gets a participation certificate.",
        person: "Oliver",
        personAvatar: "\u{1F466}",
        statement: "I'm going to play my guitar at the talent show. I'm definitely going to win because I've been practising every day for a month!",
        options: [
            "A. Oliver might make mistakes during his performance.",
            "B. Practising a lot doesn't guarantee winning when the audience chooses.",
            "C. Oliver should have practised for longer than a month.",
            "D. Guitar performances don't usually win talent shows."
        ],
        correctIndex: 1,
        explanation: "The winner is chosen by AUDIENCE VOTE - this means the audience decides based on their preferences. No matter how much Oliver practises, he can't guarantee he'll win because it depends on what the audience likes!",
        teachingPoint: "\u{1F3AF} Key Skill: When others choose the winner (vote, judge, random draw), hard work improves your CHANCES but doesn't GUARANTEE success."
    },
    {
        id: "ftf_010",
        type: "find_the_flaw",
        flawType: "optional_vs_required",
        rule: "Wearing a helmet is recommended for all bicycle riders in the park's beginner trail.",
        person: "Sophie",
        personAvatar: "\u{1F467}",
        statement: "The sign says helmets are recommended, which means I must wear one or I'll get in trouble.",
        options: [
            "A. Sophie should wear a helmet for safety regardless of the rule.",
            "B. 'Recommended' means it's a good idea, not that it's required or mandatory.",
            "C. The beginner trail is very safe so helmets aren't needed.",
            "D. Sophie might not own a helmet."
        ],
        correctIndex: 1,
        explanation: "'Recommended' means something is SUGGESTED as a good idea, but not REQUIRED. Sophie won't get in trouble for not wearing one - but wearing one is still smart for safety!",
        teachingPoint: "\u{1F3AF} Key Skill: Know the difference! 'Required/Must' = you have to. 'Recommended/Should' = it's a good idea but optional."
    },
    {
        id: "ftf_011",
        type: "find_the_flaw",
        flawType: "missing_condition",
        rule: "To receive a free pizza, customers must spend at least $30 on their order AND show the printed coupon at the counter.",
        person: "Tom",
        personAvatar: "\u{1F466}",
        statement: "I spent $45 on my order today. I'm definitely getting a free pizza!",
        options: [
            "A. Tom spent too much money on his order.",
            "B. Tom has not shown the required coupon.",
            "C. The pizza shop has run out of free pizzas.",
            "D. Tom should have ordered different items."
        ],
        correctIndex: 1,
        explanation: "The rule requires TWO things: spending $30+ AND showing the coupon. Tom only mentions his spending - he hasn't said he has the coupon. Without it, no free pizza!",
        teachingPoint: "\u{1F3AF} Key Skill: 'AND' means BOTH conditions must be met. Don't assume you qualify until you've checked every requirement!"
    },
    {
        id: "ftf_012",
        type: "find_the_flaw",
        flawType: "chance_vs_certainty",
        rule: "The science fair judges will select the top 3 projects based on creativity, scientific method, and presentation. All participants will receive feedback on their work.",
        person: "Emma",
        personAvatar: "\u{1F467}",
        statement: "My project on volcanoes uses perfect scientific method. I will definitely win first place!",
        options: [
            "A. Volcano projects are overdone at science fairs.",
            "B. Having a good scientific method is only one of three criteria the judges consider.",
            "C. Emma's presentation might be boring.",
            "D. There are too many participants this year."
        ],
        correctIndex: 1,
        explanation: "Judges look at THREE things: creativity, scientific method, AND presentation. Even if Emma's scientific method is perfect, she needs to excel in ALL three areas to guarantee a win - and other students might score higher overall!",
        teachingPoint: "\u{1F3AF} Key Skill: When there are multiple criteria, meeting ONE really well doesn't guarantee success. Check ALL the requirements!"
    },
    {
        id: "ftf_013",
        type: "find_the_flaw",
        flawType: "partial_match",
        rule: "A mammal is a warm-blooded animal that has hair or fur, gives birth to live young, and feeds its babies with milk.",
        person: "Ben",
        personAvatar: "\u{1F466}",
        statement: "Platypuses are not mammals because they lay eggs instead of giving birth to live young.",
        options: [
            "A. Ben is correct that platypuses cannot be mammals.",
            "B. Platypuses are actually a special type of mammal called a monotreme that does lay eggs but still feeds babies with milk and has fur.",
            "C. Platypuses don't have fur.",
            "D. Platypuses are actually birds."
        ],
        correctIndex: 1,
        explanation: "Ben assumed the rule is absolute, but there are exceptions in nature! Platypuses ARE mammals - they have fur and produce milk. They're just a special exception (monotremes) that lay eggs. Rules in nature often have exceptions!",
        teachingPoint: "\u{1F3AF} Key Skill: General rules often have exceptions! Be careful about applying rules too strictly without considering special cases."
    },
    {
        id: "ftf_014",
        type: "find_the_flaw",
        flawType: "single_factor",
        rule: "Research shows that students who eat breakfast tend to perform better on tests than students who skip breakfast.",
        person: "Mia",
        personAvatar: "\u{1F467}",
        statement: "I always eat a big breakfast before tests, so I will definitely get the highest score in my class.",
        options: [
            "A. Mia might be eating the wrong foods for breakfast.",
            "B. Eating breakfast helps performance but other factors like studying, sleep, and natural ability also affect test scores.",
            "C. Mia should eat an even bigger breakfast.",
            "D. Research about breakfast is not reliable."
        ],
        correctIndex: 1,
        explanation: "Breakfast HELPS test performance, but it's not the ONLY factor! Studying, getting enough sleep, understanding the material, and natural ability all matter too. Mia can't guarantee the highest score just by eating breakfast.",
        teachingPoint: "\u{1F3AF} Key Skill: Correlation doesn't mean causation! Just because two things are related doesn't mean one GUARANTEES the other."
    },
    {
        id: "ftf_015",
        type: "find_the_flaw",
        flawType: "overgeneralization",
        rule: "The local council has built new cycling paths to encourage more people to ride bikes instead of driving cars.",
        person: "Noah",
        personAvatar: "\u{1F466}",
        statement: "The new cycling paths won't reduce car traffic at all because most people prefer driving and will never change.",
        options: [
            "A. Noah is right that people never change their habits.",
            "B. Noah is making an assumption that 'most people will never change' without evidence - some people might switch to cycling.",
            "C. Cycling is too dangerous for everyone.",
            "D. The cycling paths are in the wrong locations."
        ],
        correctIndex: 1,
        explanation: "Noah says 'most people... will never change' but he has no evidence for this! Some people might try cycling once there are safe paths. Using absolute words like 'never' and 'all' is often an overgeneralization.",
        teachingPoint: "\u{1F3AF} Key Skill: Watch out for absolute words like 'never', 'always', 'all', 'none'. They're often overgeneralizations without evidence!"
    }
];

// Hint templates based on flaw type
const GUIDED_HINT_TEMPLATES = {
    missing_condition: "\u{1F4A1} Hint: Read the rule again carefully. Does it say ONE thing is needed, or MORE than one thing? Check if all conditions are met!",
    optional_vs_required: "\u{1F4A1} Hint: Does 'optional' or 'recommended' mean you CAN'T do something, or just that you don't HAVE to? Think about what these words really mean.",
    chance_vs_certainty: "\u{1F4A1} Hint: Think about the difference between 'might win' and 'will definitely win'. Does meeting the requirements GUARANTEE the outcome?",
    certainty_ignored: "\u{1F4A1} Hint: Look at the rule. Is it saying something WILL happen, or MIGHT happen? Is the person treating a certainty as uncertain?",
    partial_match: "\u{1F4A1} Hint: Check ALL the characteristics mentioned in the rule. Does the person's example match EVERY single one?",
    single_factor: "\u{1F4A1} Hint: Does having ONE thing mean you're guaranteed to succeed? What ELSE might matter?",
    overgeneralization: "\u{1F4A1} Hint: Watch out for assuming ONE thing causes EVERYTHING, or words like 'always', 'never', 'all'. Are there other factors involved?"
};

// Make available globally
window.GUIDED_THINKING_QUESTIONS = GUIDED_THINKING_QUESTIONS;
window.GUIDED_HINT_TEMPLATES = GUIDED_HINT_TEMPLATES;
