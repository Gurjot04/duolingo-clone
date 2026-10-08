"""Raw course content (Spanish for English speakers). seed.py turns this into rows.

Each skill has:
  words    (es, en) pairs                     -> multiple choice / match / type answer
  phrases  (es, en, extra_es, extra_en)       -> translate word-bank exercises (extras = distractor tokens)
  blanks   (sentence_with___, answer, options)-> fill in the blank
"""

COURSE = {"language_code": "es", "name": "Spanish", "from_language": "English"}

UNITS = [
    {
        "title": "Unit 1", "description": "Greet people and talk about who you are", "color": "#58cc02",
        "skills": [
            {
                "title": "Basics", "icon": "star",
                "words": [("hola", "hello"), ("adiós", "goodbye"), ("sí", "yes"), ("no", "no"),
                          ("gracias", "thank you"), ("por favor", "please")],
                "phrases": [("Hola, buenos días", "Hello, good morning", ["noche", "tarde"], ["night", "evening"]),
                            ("Gracias, adiós", "Thank you, goodbye", ["hola", "sí"], ["hello", "yes"]),
                            ("Sí, por favor", "Yes, please", ["no", "gracias"], ["no", "thanks"])],
                "blanks": [("¡___! Me llamo Ana.", "Hola", ["Hola", "Adiós", "Gracias"]),
                           ("Sí, por ___", "favor", ["favor", "hola", "adiós"])],
            },
            {
                "title": "Introductions", "icon": "chat",
                "words": [("yo", "I"), ("tú", "you"), ("él", "he"), ("ella", "she"),
                          ("soy", "I am"), ("eres", "you are")],
                "phrases": [("Yo soy Ana", "I am Ana", ["tú", "es"], ["you", "is"]),
                            ("Ella es Marta", "She is Marta", ["él", "soy"], ["he", "am"]),
                            ("Él es Pedro", "He is Pedro", ["ella", "eres"], ["she", "are"])],
                "blanks": [("Yo ___ Ana", "soy", ["soy", "es", "eres"]),
                           ("Tú ___ Pedro", "eres", ["eres", "soy", "yo"])],
            },
            {
                "title": "People", "icon": "people",
                "words": [("niño", "boy"), ("niña", "girl"), ("hombre", "man"), ("mujer", "woman"),
                          ("amigo", "friend"), ("familia", "family")],
                "phrases": [("Un niño y una niña", "A boy and a girl", ["hombre", "mujer"], ["man", "woman"]),
                            ("El hombre y la mujer", "The man and the woman", ["niño", "amigo"], ["boy", "friend"]),
                            ("Él es mi amigo", "He is my friend", ["ella", "familia"], ["she", "family"])],
                "blanks": [("Un ___ y una niña", "niño", ["niño", "mujer", "familia"]),
                           ("El ___ y la mujer", "hombre", ["hombre", "niña", "familia"])],
            },
        ],
    },
    {
        "title": "Unit 2", "description": "Order food and drinks", "color": "#ce82ff",
        "skills": [
            {
                "title": "Food", "icon": "apple",
                "words": [("manzana", "apple"), ("pan", "bread"), ("queso", "cheese"),
                          ("arroz", "rice"), ("pollo", "chicken"), ("ensalada", "salad")],
                "phrases": [("Yo como pan", "I eat bread", ["bebo", "agua"], ["drink", "water"]),
                            ("Ella come una manzana", "She eats an apple", ["queso", "bebe"], ["cheese", "drinks"]),
                            ("Él come queso y arroz", "He eats cheese and rice", ["pollo", "pan"], ["chicken", "bread"])],
                "blanks": [("Yo ___ pan", "como", ["como", "bebo", "soy"]),
                           ("Ella come una ___", "manzana", ["manzana", "pan", "queso"])],
            },
            {
                "title": "Drinks", "icon": "cup",
                "words": [("agua", "water"), ("leche", "milk"), ("café", "coffee"), ("té", "tea"),
                          ("jugo", "juice"), ("bebo", "I drink")],
                "phrases": [("Yo bebo agua", "I drink water", ["como", "leche"], ["eat", "milk"]),
                            ("Ella bebe leche", "She drinks milk", ["café", "come"], ["coffee", "eats"]),
                            ("Él bebe café", "He drinks coffee", ["té", "jugo"], ["tea", "juice"])],
                "blanks": [("Yo ___ té", "bebo", ["bebo", "como", "soy"]),
                           ("Ella bebe ___", "leche", ["leche", "pan", "arroz"])],
            },
            {
                "title": "At the café", "icon": "bell",
                "words": [("mesa", "table"), ("menú", "menu"), ("cuenta", "bill"),
                          ("quiero", "I want"), ("camarero", "waiter"), ("café", "coffee")],
                "phrases": [("Quiero un café", "I want a coffee", ["mesa", "menú"], ["table", "menu"]),
                            ("La cuenta, por favor", "The bill, please", ["gracias", "mesa"], ["thanks", "table"]),
                            ("Una mesa, por favor", "A table, please", ["cuenta", "hola"], ["bill", "hello"])],
                "blanks": [("Quiero un ___", "café", ["café", "mesa", "cuenta"]),
                           ("La ___, por favor", "cuenta", ["cuenta", "café", "camarero"])],
            },
        ],
    },
    {
        "title": "Unit 3", "description": "Get around town and describe things", "color": "#ff9600",
        "skills": [
            {
                "title": "Places", "icon": "house",
                "words": [("casa", "house"), ("escuela", "school"), ("ciudad", "city"),
                          ("tienda", "store"), ("parque", "park"), ("hotel", "hotel")],
                "phrases": [("Yo voy a la escuela", "I go to school", ["casa", "tienda"], ["house", "store"]),
                            ("Ella está en el parque", "She is at the park", ["ciudad", "hotel"], ["city", "hotel"]),
                            ("Él está en casa", "He is at home", ["escuela", "voy"], ["school", "go"])],
                "blanks": [("Yo voy a la ___", "escuela", ["escuela", "hotel", "parque"]),
                           ("Él está en ___", "casa", ["casa", "voy", "yo"])],
            },
            {
                "title": "Numbers", "icon": "numbers",
                "words": [("uno", "one"), ("dos", "two"), ("tres", "three"),
                          ("cuatro", "four"), ("cinco", "five"), ("diez", "ten")],
                "phrases": [("Tengo dos manzanas", "I have two apples", ["tres", "pan"], ["three", "bread"]),
                            ("Ella tiene tres amigos", "She has three friends", ["cinco", "tengo"], ["five", "have"]),
                            ("Hay cuatro niños", "There are four boys", ["diez", "niñas"], ["ten", "girls"])],
                "blanks": [("Uno y uno son ___", "dos", ["dos", "tres", "cuatro"]),
                           ("Dos y dos son ___", "cuatro", ["cuatro", "tres", "cinco"])],
            },
            {
                "title": "Describing things", "icon": "palette",
                "words": [("rojo", "red"), ("azul", "blue"), ("verde", "green"),
                          ("grande", "big"), ("pequeño", "small"), ("bueno", "good")],
                "phrases": [("La manzana es roja", "The apple is red", ["azul", "verde"], ["blue", "green"]),
                            ("La casa es grande", "The house is big", ["pequeña", "tienda"], ["small", "store"]),
                            ("El café es bueno", "The coffee is good", ["malo", "té"], ["bad", "tea"])],
                "blanks": [("La manzana es ___", "roja", ["roja", "rojo", "bueno"]),
                           ("El café es ___", "bueno", ["bueno", "buena", "roja"])],
            },
        ],
    },
]

ACHIEVEMENTS = [
    ("first_lesson", "First Steps", "Complete your first lesson", "footprints", "lessons", 1),
    ("lessons_10", "Dedicated", "Complete 10 lessons", "book", "lessons", 10),
    ("streak_3", "On Fire", "Reach a 3 day streak", "flame", "streak", 3),
    ("streak_7", "Week Warrior", "Reach a 7 day streak", "fire2", "streak", 7),
    ("xp_100", "Rising Star", "Earn 100 XP", "star", "xp", 100),
    ("xp_500", "XP Hunter", "Earn 500 XP", "bolt", "xp", 500),
    ("perfect_1", "Flawless", "Finish a lesson with no mistakes", "target", "perfect", 1),
    ("goal_1", "Goal Getter", "Hit your daily XP goal", "trophy", "goals", 1),
]

# (username, display name, avatar colour, weekly-ish xp, total xp)
BOT_LEARNERS = [
    ("sofia", "Sofia", "#ff4b4b", 410, 3200), ("mateo", "Mateo", "#ff9600", 355, 2750),
    ("luna", "Luna", "#ce82ff", 320, 2100), ("diego", "Diego", "#58cc02", 285, 1900),
    ("camila", "Camila", "#1cb0f6", 240, 1500), ("andres", "Andrés", "#ffc800", 205, 1320),
    ("valeria", "Valeria", "#ff86d0", 170, 980), ("pablo", "Pablo", "#2b70c9", 140, 760),
    ("isabel", "Isabel", "#a560e8", 95, 540), ("javier", "Javier", "#89e219", 60, 310),
    ("lucia", "Lucía", "#ff4b4b", 35, 180),
]
