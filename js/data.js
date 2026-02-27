// ============================================================
// data.js — Game data: paintings, quality table, phrases, tiers
// ============================================================

/** 19 paintings with id, name, inspiration, and image path */
const PAINTINGS_DATA = [
    { id: 1, name: "A Queda do Arranha-Céu", inspiration: "Você ainda sente o gosto do ar filtrado e do luxo que perdeu. Tudo ruiu rápido demais. Às vezes parece que você ainda está suspenso entre dois mundos — o topo dourado e as ruas sujas. Você escolheu cair. E ainda se pergunta se foi coragem ou orgulho.", image: "images/Quadro_1.png" },
    { id: 2, name: "Esgoto do Renascimento", inspiration: "A sujeira não era apenas decadência — era abandono. Você não nasceu ali, mas decidiu pertencer. No meio do lixo, encontrou propósito. Mesmo agora, acredita que algo pode crescer onde todos só veem podridão.", image: "images/Quadro_2.jpeg" },
    { id: 3, name: "Sinfonia Guerrilha", inspiration: "Você sente falta do som vibrando nos ossos, do grito ecoando entre prédios. Por alguns minutos, vocês eram invencíveis. Não era sobre fama — era sobre verdade.", image: "images/Quadro_3.jpeg" },
    { id: 4, name: "O Palco Vazio", inspiration: "O silêncio depois da violência é ensurdecedor. O palco ainda existe na sua memória, mas nunca mais teve luz de verdade. Algo morreu ali — e não foi só gente.", image: "images/Quadro_4.png" },
    { id: 5, name: "Suspeita em Azul", inspiration: "A pior dor não veio dos inimigos declarados. Veio do olhar desconfiado de quem já esteve ao seu lado. Você foi poupado. E isso pesa mais do que qualquer acusação.", image: "images/Quadro_5.png" },
    { id: 6, name: "O Olho Roubado", inspiration: "Naquela noite você cruzou uma linha invisível. Desde então, sente que está sendo observado não por câmeras, mas pelas consequências. Algumas escolhas não podem ser desfeitas.", image: "images/Quadro_6.jpeg" },
    { id: 7, name: "Silêncio na Banheira", inspiration: "Você chegou tarde demais. A água parada, o ar pesado. O mundo parecia distante, como se estivesse debaixo d'água. A culpa se espalha dentro de você do mesmo jeito.", image: "images/Quadro_7.png" },
    { id: 8, name: "Inferno no Lobby", inspiration: "Você perdeu o controle. Os disparos não eram só contra máquinas — eram contra o vazio que se abriu dentro de você. Parte de você se arrepende. Parte sente que precisava explodir.", image: "images/Quadro_8.png" },
    { id: 9, name: "Marionetista Corporativa", inspiration: "Você odeia perceber que está sendo puxado por fios invisíveis. Mas também sabe que está usando essa mesma situação para seus próprios objetivos. Ninguém ali é totalmente inocente.", image: "images/Quadro_9.jpeg" },
    { id: 10, name: "Fragmentos na Água", inspiration: "Tudo começou com pedaços espalhados. Segredos, medos, interesses cruzados. Vocês não escolheram se unir — foram empurrados para isso. Ainda assim, existe uma estranha conexão ali.", image: "images/Quadro_10.jpeg" },
    { id: 11, name: "Paranoia Neon", inspiration: "A cidade parece viva. Cada luz piscando parece um olho. Você anda pelas ruas sentindo que qualquer esquina pode revelar um inimigo.", image: "images/Quadro_11.png" },
    { id: 12, name: "O Peso da Culpa", inspiration: "Você carrega algo invisível, mas pesado demais. Mesmo quando ninguém fala sobre isso, sua mente repete a pergunta: poderia ter sido diferente?", image: "images/Quadro_12.png" },
    { id: 13, name: "Fantasma na Área VIP", inspiration: "Tudo parecia elegante e sob controle. Uma noite perfeita, um plano calculado. Mas por trás das luzes havia rachaduras que você não quis enxergar.", image: "images/Quadro_13.png" },
    { id: 14, name: "Transmissão de Fúria", inspiration: "Se não pode gritar nas ruas, você grita pela rede. Sua voz ainda é sua. E enquanto puder falar, você não será silenciado.", image: "images/Quadro_14.jpeg" },
    { id: 15, name: "Halo Quebrado", inspiration: "Você já acreditou que talento e mérito eram suficientes. Hoje sabe que aquela visão era confortável demais. O brilho que te cercava era frágil.", image: "images/Quadro_15.png" },
    { id: 16, name: "Seis Sombras", inspiration: "Vocês não confiam totalmente uns nos outros. Mas juntos são mais fortes. Pela primeira vez desde a tragédia, você não enfrenta tudo sozinho.", image: "images/Quadro_16.png" },
    { id: 17, name: "O Caçador", inspiration: "Isso deixou de ser apenas uma missão. É pessoal. Existe alguém lá fora que conhece seu rosto e quer sangue. E você sabe que esse encontro é inevitável.", image: "images/Quadro_17.png" },
    { id: 18, name: "Óleo e Sangue", inspiration: "Lucro e violência andam lado a lado. Você começou a enxergar padrões que antes ignorava. Tudo está conectado — contratos, corpos e poder.", image: "images/Quadro_18.png" },
    { id: 19, name: "Olho do Furacão", inspiration: "Tudo gira ao seu redor: culpa, vingança, revolução, destino. É caótico e assustador. Mas há uma certeza dentro de você — desta vez, você não vai fugir.", image: "images/Quadro_19.png" }
];

/** Quality tiers based on roll result */
const QUALITY_TABLE = [
    { min: 0, max: 7, category: "Banal", maxValue: 100, sealClass: "seal-banal", emoji: "🩶" },
    { min: 8, max: 13, category: "Amador", maxValue: 300, sealClass: "seal-amador", emoji: "🥉" },
    { min: 14, max: 18, category: "Promissor", maxValue: 800, sealClass: "seal-promissor", emoji: "🥈" },
    { min: 19, max: 23, category: "Notável", maxValue: 1200, sealClass: "seal-notavel", emoji: "🔵" },
    { min: 24, max: 29, category: "Excepcional", maxValue: 1600, sealClass: "seal-excepcional", emoji: "🟣" },
    { min: 30, max: 33, category: "Magistral", maxValue: 2000, sealClass: "seal-magistral", emoji: "🔴" },
    { min: 34, max: 999, category: "Obra-Prima", maxValue: 3000, sealClass: "seal-obraprima", emoji: "🏆" }
];

/** Phrases per quality category — 3 each, never reused */
const PHRASES = {
    "Banal": [
        "Interessante… tem algo curioso aqui.",
        "Vejo potencial, ainda que simples.",
        "Uma peça modesta, mas honesta."
    ],
    "Amador": [
        "Há emoção aqui. Eu gosto disso.",
        "Consigo ver crescimento nessa obra.",
        "Tem personalidade, isso é raro."
    ],
    "Promissor": [
        "Você está encontrando sua voz artística.",
        "Essa peça merece reconhecimento.",
        "Há técnica e sentimento equilibrados."
    ],
    "Notável": [
        "Agora estamos falando de arte de verdade.",
        "Isso chamaria atenção em qualquer galeria.",
        "Essa obra tem presença."
    ],
    "Excepcional": [
        "Eu preciso ter isso na minha coleção.",
        "Isso é impressionante.",
        "Você está em outro nível."
    ],
    "Magistral": [
        "Isso é digno de museu.",
        "Uma peça extraordinária.",
        "Eu pagaria bem por isso."
    ],
    "Obra-Prima": [
        "Isso é imortal.",
        "Estou diante de algo histórico.",
        "Essa obra transcende o tempo."
    ]
};

/** Visitor tier configuration */
const TIER_CONFIG = [
    { tier: "A", percentPublic: 0.10, bidChance: 0.05, bidMin: 0.70, bidMax: 1.10, color: "#FFD700" },
    { tier: "B", percentPublic: 0.25, bidChance: 0.04, bidMin: 0.60, bidMax: 0.90, color: "#C0C0C0" },
    { tier: "C", percentPublic: 0.25, bidChance: 0.03, bidMin: 0.50, bidMax: 0.70, color: "#CD7F32" },
    { tier: "D", percentPublic: 0.25, bidChance: 0.02, bidMin: 0.40, bidMax: 0.60, color: "#8B7355" },
    { tier: "E", percentPublic: 0.15, bidChance: 0.02, bidMin: 0.30, bidMax: 0.50, color: "#696969" }
];

/** Divulgation level → percentage of max capacity per day */
const DIVULGATION_LEVELS = {
    1: 0.30,
    2: 0.40,
    3: 0.70,
    4: 0.80,
    5: 1.00
};

/** Day narratives for painting phase (ambience text) */
const DAY_NARRATIVES = [
    "A luz da manhã atravessa a janela do estúdio. O silêncio é perfeito para criar.",
    "O cheiro de tinta fresca preenche o ar. Hoje pode ser o dia de uma obra-prima.",
    "Chuva fina marca o vidro da janela. A inspiração vem do contraste entre luz e sombra.",
    "O sol forte aquece a tela. Cada pincelada parece carregar a energia do dia.",
    "A noite cai, mas você acende as luzes do ateliê. A criação não espera o amanhecer.",
    "Um café forte, o pincel na mão. O mundo lá fora desaparece.",
    "O ateliê cheira a terebintina e possibilidades. Hoje o destino guia suas mãos.",
    "Você olha para a tela em branco. Ela te olha de volta, esperando.",
    "Sons distantes da cidade entram pela janela. Cada ruído vira forma e cor.",
    "É o último dia. Tudo o que você sente precisa caber nesta tela."
];
