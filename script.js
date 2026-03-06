// Page Navigation

// ensure nav logo bounces when home shown
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = 'block';
        window.scrollTo(0, 0);
    }
    updateNavLogoBounce(pageId);
}

// State management
let currentState = {
    userType: null,
    selectedTopic: null,
    selectedLanguage: null,
    classCode: null
};

// navigation history stack
const pageHistory = [];

function showPageWithHistory(pageId) {
    const current = document.querySelector('.page[style*="display: block"]');
    if (current && current.id) pageHistory.push(current.id);
    showPage(pageId);
}

function goBack() {
    const prev = pageHistory.pop();
    if (prev) return showPage(prev);
    // fallback to browser history for multi-page flow
    if (window.history && window.history.length > 1) window.history.back();
}

// Ensure nav logo bounces on home, and keep a persistent bottom-left back button
function updateNavLogoBounce(pageId) {
    const navLogoImg = document.querySelector('.nav-logo img');
    if (!navLogoImg) return;
    if (pageId === 'home') {
        navLogoImg.classList.add('logo-bounce');
    } else {
        navLogoImg.classList.remove('logo-bounce');
    }
}

// Teacher functions
function selectTopic(topic) {
    currentState.selectedTopic = topic;
    console.log(`Selected topic: ${topic}`);
    // visual selection
    document.querySelectorAll('#teacher-dashboard .topic-card').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`#teacher-dashboard .topic-card[data-topic="${topic}"]`);
    if (btn) btn.classList.add('selected');
    updateTeacherStartButton();
}

function selectLanguage(language) {
    currentState.selectedLanguage = language;
    console.log(`Selected language: ${language}`);
    // visual selection
    document.querySelectorAll('#teacher-dashboard .lang-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`#teacher-dashboard .lang-btn[data-lang="${language}"]`);
    if (btn) btn.classList.add('selected');
    updateTeacherStartButton();
}

// Enable teacher start when both chosen
function updateTeacherStartButton() {
    const btn = document.getElementById('teacherStartBtn');
    if (!btn) return;
    if (currentState.selectedTopic && currentState.selectedLanguage) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// Student functions
function selectStudentTopic(topic) {
    currentState.selectedTopic = topic;
    console.log(`Student selected topic: ${topic}`);
    // visual selection for student learn page (works for both SPA and multi-page)
    document.querySelectorAll('.topic-card').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`.topic-card[data-topic="${topic}"]`);
    if (btn) btn.classList.add('selected');
}

function selectStudentLanguage(language) {
    currentState.selectedLanguage = language;
    console.log(`Student selected language: ${language}`);
    // visual selection (works for both SPA and multi-page)
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`.lang-btn[data-lang="${language}"]`);
    if (btn) btn.classList.add('selected');
    
    // Store selections in localStorage for multi-page flow
    if (currentState.selectedTopic && currentState.selectedLanguage) {
        localStorage.setItem('voca_self_study_topic', currentState.selectedTopic);
        localStorage.setItem('voca_self_study_language', currentState.selectedLanguage);
        
        // If in self-study mode, start lesson
        if (currentState.mode === 'self') {
            currentState.lessonIndex = 0;
            // Check if SPA or multi-page
            if (document.getElementById('student-lesson')) {
                showPageWithHistory('student-lesson');
                loadLesson();
            } else {
                // Multi-page flow - redirect to lesson.html
                window.location.href = 'lesson.html';
            }
        }
    }
}

function joinClass() {
    const classCode = document.getElementById('classCodeInput').value.trim();
    if (classCode.length === 4) {
        const key = 'voca_class_' + classCode;
        const existing = JSON.parse(localStorage.getItem(key) || 'null');
        if (existing === null) {
            alert('Class not found — check the code');
            return;
        }
        // add a simple entry for this student
        existing.push({ id: Date.now(), joinedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing));
        currentState.classCode = classCode;
        // persist selected class so redirected pages can initialize
        localStorage.setItem('voca_current_class', classCode);
        console.log(`Joined class: ${classCode}`);
        // show waiting UI or redirect to multi-page waiting room
        if (document.getElementById('student-wait')) showPageWithHistory('student-wait');
        else window.location.href = 'student-wait.html';
        // poll for start
        const poll = setInterval(() => {
            const started = localStorage.getItem(key + '_started');
            if (started === 'true') {
                clearInterval(poll);
                // initialize lesson view for this student
                currentState.lessonIndex = 0;
                currentState.mode = 'student';
                loadLesson();
                if (document.getElementById('student-lesson')) showPage('student-lesson');
                else window.location.href = 'lesson.html';
            }
        }, 1000);
    } else {
        alert('Please enter a valid 4-digit class code');
    }
}

// Flag SVG data for languages
const flagSvgs = {
    'HINDI': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 30'%3E%3Crect width='50' height='30' fill='%23FF9933'/%3E%3Crect x='0' y='10' width='50' height='10' fill='white'/%3E%3Crect x='0' y='20' width='50' height='10' fill='%23138808'/%3E%3C/svg%3E",
    'ARABIC': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 30'%3E%3Crect width='50' height='30' fill='%23CE1126'/%3E%3Crect x='0' y='0' width='10' height='30' fill='%23007A5E'/%3E%3Crect x='10' y='0' width='40' height='30' fill='white'/%3E%3Crect x='10' y='0' width='40' height='30' fill='%23000'/%3E%3C/svg%3E",
    'FRENCH': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 30'%3E%3Crect width='16.67' height='30' fill='%234085F4'/%3E%3Crect x='16.67' y='0' width='16.66' height='30' fill='white'/%3E%3Crect x='33.33' y='0' width='16.67' height='30' fill='%23EF4135'/%3E%3C/svg%3E"
};

// Audio toggle
// Speech synthesis playback for target language and English
const langMap = { 'HINDI': 'hi-IN', 'FRENCH': 'fr-FR', 'ARABIC': 'ar-SA' };

function speakText(text, lang) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    if (lang) utter.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

function playLessonAudio() {
    let topic = currentState.selectedTopic;
    let lang = currentState.selectedLanguage;
    
    // fallback to localStorage if in multi-page mode
    if (!topic || !lang) {
        // Try class-based first
        if (currentState.classCode) {
            topic = localStorage.getItem('voca_class_' + currentState.classCode + '_topic');
            lang = localStorage.getItem('voca_class_' + currentState.classCode + '_language');
        }
        // Try self-study if still not found
        if (!topic || !lang) {
            topic = topic || localStorage.getItem('voca_self_study_topic');
            lang = lang || localStorage.getItem('voca_self_study_language');
        }
    }
    
    if (!topic || !lang) return alert('Topic or language not set');
    const lessonsKey = `${topic}_${lang}`;
    const lessonList = LESSONS[topic] && LESSONS[topic][lang];
    if (!lessonList) return;
    const li = lessonList[currentState.lessonIndex || 0];
    if (!li) return;
    // speak target language only
    const targetLang = langMap[lang] || 'en-US';
    speakText(li.phrase, targetLang);
}

// Initialize - show home page on load
document.addEventListener('DOMContentLoaded', function() {
    // create a persistent bottom-left back button
    if (!document.getElementById('globalBackBtn')) {
        const back = document.createElement('button');
        back.id = 'globalBackBtn';
        back.className = 'back-btn';
        back.textContent = '← Back';
        back.onclick = goBack;
        document.body.appendChild(back);
    }

    // hook topic & language buttons to update teacher start
    document.querySelectorAll('.topic-card').forEach(btn => btn.addEventListener('click', () => setTimeout(updateTeacherStartButton, 50)));
    document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setTimeout(updateTeacherStartButton, 50)));

    // if this is the single-page app, show home; otherwise just set logo bounce according to file
    if (document.getElementById('home')) {
        // Only show home page if video overlay is not present or already hidden
        const videoOverlay = document.getElementById('introVideoOverlay');
        if (!videoOverlay || videoOverlay.style.display === 'none') {
            showPage('home');
            updateNavLogoBounce('home');
        }
    } else {
        const path = window.location.pathname.split('/').pop();
        if (path === '' || path === 'homepage.html' || path === 'index.html') updateNavLogoBounce('home');
        else updateNavLogoBounce('');
    }

    // if on a lesson page (multi-page flow), initialize lesson
    if (document.getElementById('lessonPhrase_student') || document.getElementById('lessonPhrase')) {
        const currentClass = localStorage.getItem('voca_current_class');
        
        // Check if this is a class-based lesson or self-study
        if (currentClass && localStorage.getItem('voca_class_' + currentClass + '_started') === 'true') {
            // Class-based lesson
            currentState.classCode = currentClass;
            const topic = localStorage.getItem('voca_class_' + currentClass + '_topic');
            const lang = localStorage.getItem('voca_class_' + currentClass + '_language');
            if (topic) currentState.selectedTopic = topic;
            if (lang) currentState.selectedLanguage = lang;
            currentState.lessonIndex = currentState.lessonIndex || 0;
            currentState.mode = currentState.mode || 'student';
            loadLesson();
        } else {
            // Self-study lesson
            const topic = localStorage.getItem('voca_self_study_topic');
            const lang = localStorage.getItem('voca_self_study_language');
            if (topic && lang) {
                currentState.selectedTopic = topic;
                currentState.selectedLanguage = lang;
                currentState.lessonIndex = 0;
                currentState.mode = 'self';
                loadLesson();
            }
        }
    }
});

// --- Class and lesson engine ---
function generateClassCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function prepareClass() {
    if (!currentState.selectedTopic || !currentState.selectedLanguage) {
        return alert('Choose a topic and the language you want to teach before starting');
    }
    const code = generateClassCode();
    currentState.classCode = code;
    const key = 'voca_class_' + code;
    localStorage.setItem(key, JSON.stringify([]));
    localStorage.setItem(key + '_topic', currentState.selectedTopic);
    localStorage.setItem(key + '_language', currentState.selectedLanguage);
    // persist current active class so other pages can read it
    localStorage.setItem('voca_current_class', code);
    const codeEl = document.getElementById('codeDisplay');
    if (codeEl) codeEl.textContent = code;
    // if we are on a single-page app, navigate there; otherwise redirect to teacher-class-code.html
    if (document.getElementById('teacher-class-code')) {
        showPageWithHistory('teacher-class-code');
    } else {
        window.location.href = 'teacher-class-code.html';
    }
    // poll for joined students
    const joinedEl = document.getElementById('joinedCount');
    const startBtn = document.getElementById('startActivityBtn');
    const poll = setInterval(() => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const n = arr.length;
        if (joinedEl) joinedEl.textContent = `Students joined: ${n}`;
        if (startBtn) startBtn.disabled = n === 0;
        // keep polling until teacher navigates away
    }, 1000);
}

function startClassActivity() {
    const code = currentState.classCode;
    if (!code) return alert('No active class code');
    const key = 'voca_class_' + code;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    if (!arr || arr.length === 0) return alert('No students have joined yet');
    // mark started so students can detect
    localStorage.setItem(key + '_started', 'true');
    // initialize lesson state
    currentState.lessonIndex = 0;
    currentState.mode = 'teacher';
    loadLesson();
    // in multi-page flow redirect teacher to lesson page (re-using student-lesson page)
    if (document.getElementById('student-lesson')) {
        showPage('student-lesson');
    } else {
        window.location.href = 'lesson.html';
    }
}

// student waiting page placeholder: created in HTML? handle missing page gracefully

// Lessons data structure (minimal set of 5 lessons per topic per language)
const LESSONS = {
    'FOOD': {
        'HINDI': [
            { phrase: 'घर का खाना सबसे अच्छा है।', english: 'Home food is the best.', literal: 'Home food is the best.', context: 'In Indian culture, homemade meals prepared by mother symbolize love and care. They are considered superior to restaurant food because they are made with family devotion.' },
            { phrase: 'दाल-भात ही मूल भोजन है।', english: 'Lentils and rice are the staple meal.', literal: 'Lentils and rice are the foundation food.', context: 'Across India, dal and rice represent the most fundamental, humble, and nutritious meal shared by families across all regions and social classes.' },
            { phrase: 'मसाले के बिना खाना अधूरा है।', english: 'Food without spices is incomplete.', literal: 'Food without spices is incomplete.', context: 'Spices are central to Indian cuisine and culture. The masala blend in each dish tells the story of region, family tradition, and generations of cooking wisdom.' },
            { phrase: 'दावत देना हमारी परंपरा है।', english: 'Feasting is our tradition.', literal: 'Giving feasts is our tradition.', context: 'Hospitality and feeding guests generously is a core value in Indian culture. The act of serving food to guests is considered a sacred duty.' },
            { phrase: 'मीठा खा कर दिन शुरू करो।', english: 'Start the day with something sweet.', literal: 'Start the day by eating something sweet.', context: 'In Indian culture, starting the day with sweets brings good luck and auspiciousness. This practice is especially followed during festivals and celebrations.' }
        ],
        'FRENCH': [
            { phrase: "L'apéro est un moment sacré.", english: 'The aperitif is a sacred moment.', literal: 'The aperitif is a sacred moment.', context: 'In French culture, the aperitif (apéro) is not just about drinks but a social ritual where friends and family gather before dinner. It represents taking time to connect.' },
            { phrase: "Bonne appétit, c'est du respect.", english: 'Saying bon appétit shows respect.', literal: 'Good appetite is respect.', context: 'The French greeting "Bon appétit" before meals is deeply cultural. It acknowledges the importance of the meal and shows respect to those eating.' },
            { phrase: "Le pain est l'âme de la table.", english: 'Bread is the soul of the table.', literal: 'Bread is the soul of the table.', context: 'Bread holds sacred importance in French meals. A proper French meal always begins with fresh bread, and wasting bread is considered disrespectful.' },
            { phrase: "On mange pour vivre, on ne vit pas pour manger.", english: 'We eat to live, we do not live to eat.', literal: 'One eats to live, one does not live to eat.', context: 'French philosophy emphasizes that eating is about nourishment and natural pleasure found in simple quality food, not excess or addiction.' },
            { phrase: "La cuisine française est un art.", english: 'French cooking is an art.', literal: 'French cuisine is an art.', context: 'French culinary culture is considered one of the world\'s greatest art forms. Each dish is carefully prepared with techniques passed down through generations.' }
        ],
        'ARABIC': [
            { phrase: 'الضيف ضيف الله.', english: 'The guest is God\'s guest.', literal: 'The guest is Allah\'s guest.', context: 'This fundamental Arab teaching means guests must be treated with utmost honor and generosity. Hospitality and feeding guests well is a sacred Islamic and cultural value.' },
            { phrase: 'التمر والماء غذاء النبي.', english: 'Dates and water were the Prophet\'s food.', literal: 'Dates and water are the Prophet\'s nourishment.', context: 'This reflects Islamic tradition where dates and water hold special spiritual significance. Dates are consumed during Ramadan and important Islamic occasions.' },
            { phrase: 'الطعام المشترك أقوى الحب.', english: 'Shared food strengthens love.', literal: 'Food eaten together strengthens bonds.', context: 'In Arab culture, eating together from one shared plate or dish symbolizes family unity, trust, and deep relationships. It creates emotional bonds.' },
            { phrase: 'بسم الله الرحمن الرحيم قبل الطعام.', english: 'Say "In the name of God" before eating.', literal: 'In the name of God, the Merciful.', context: 'Beginning meals with this Islamic invocation is a spiritual practice that transforms eating into a conscious, grateful act connected to faith.' },
            { phrase: 'القهوة العربية رمز الكرم.', english: 'Arabic coffee symbolizes generosity.', literal: 'Arabic coffee is a symbol of generosity.', context: 'Serving traditional Arabic coffee to guests is a time-honored custom representing hospitality, respect, and welcome in Arab society.' }
        ]
    },
    'FAMILY': {
        'HINDI': [
            { phrase: 'परिवार ही सब कुछ है।', english: 'Family is everything.', literal: 'Family is all things.', context: 'In Indian culture, family bonds are the foundation of life. Individual identity is deeply tied to family honor and support. Multi-generational living is the norm.' },
            { phrase: 'माता-पिता देव समान हैं।', english: 'Parents are like gods.', literal: 'Parents are equal to gods.', context: 'In Hindu philosophy and Indian tradition, honoring and obeying parents is a sacred duty. Parents\' blessings are considered essential for children\'s success.' },
            { phrase: 'बड़ों को सम्मान दो।', english: 'Respect the elders.', literal: 'Give respect to the elders.', context: 'Respecting elders through touching their feet (pranaam) and seeking their blessings is a core Indian value. Elders are keepers of wisdom and tradition.' },
            { phrase: 'शादी परिवारों को जोड़ती है।', english: 'Marriage unites families.', literal: 'Marriage joins families together.', context: 'In Indian culture, marriage is not just a union of two people but of two families. Family approval is essential, and the couple\'s relationship extends to both families.' },
            { phrase: 'घर में रिश्ते ही दौलत हैं।', english: 'Family relationships are true wealth.', literal: 'In home, relationships are wealth.', context: 'Indian philosophy values relationships over material possessions. Strong family bonds are considered the greatest treasure a person can possess.' }
        ],
        'FRENCH': [
            { phrase: 'La famille est le cœur de la vie.', english: 'Family is the heart of life.', literal: 'The family is the heart of life.', context: 'Despite valuing individual freedom, French culture deeply respects family structure. Family meals are sacred time spent together, uninterrupted by phones.' },
            { phrase: 'Dimanche en famille est obligatoire.', english: 'Sunday with family is essential.', literal: 'Sunday with family is mandatory.', context: 'In French tradition, Sunday lunch with extended family is a cultural institution. These meals strengthen bonds and transmit values across generations.' },
            { phrase: 'Les enfants héritent du nom de famille.', english: 'Children inherit the family name.', literal: 'Children inherit the family name.', context: 'Family name and legacy hold great importance in French culture. The family name represents identity, honor, and continuity across generations.' },
            { phrase: 'L\'éducation des enfants est l\'investissement.', english: 'Educating children is the investment.', literal: 'Education of children is the investment.', context: 'French culture places enormous emphasis on education as the most important gift parents can give. Quality education is seen as a right and responsibility.' },
            { phrase: 'On reste lié à sa mère toujours.', english: 'We remain tied to our mothers forever.', literal: 'One remains connected to mother always.', context: 'The mother-child bond is considered unbreakable in French culture. Even adult children maintain close relationships with their mothers.' }
        ],
        'ARABIC': [
            { phrase: 'الأب رأس الأسرة والمسؤول الأول.', english: 'The father is the family head and first responsible.', literal: 'The father is the family head and primary responsibility holder.', context: 'In traditional Arab culture, the father is the patriarch who provides and protects. His honor reflects the family\'s honor, and he makes major decisions.' },
            { phrase: 'الوالدة مدرسة الأمة الأولى.', english: 'The mother is the nation\'s first school.', literal: 'Mother is the first school of the nation.', context: 'This Arabic proverb reflects that mothers shape society through raising good children. A mother\'s role is considered foundational to building moral society.' },
            { phrase: 'الأخوة والأخوات وحدة واحدة.', english: 'Brothers and sisters are one unit.', literal: 'Brothers and sisters form one bond.', context: 'In Arab culture, sibling relationships are sacred and lifelong. Siblings protect each other\'s honor and maintain strong solidarity throughout life.' },
            { phrase: 'الابن هو فخر الأب.', english: 'The son is the father\'s pride.', literal: 'The son is the father\'s pride.', context: 'Sons hold special significance in traditional Arab culture as carriers of family name and honor. A father\'s identity is closely tied to his sons\' achievements.' },
            { phrase: 'العائلة الممتدة هي الملجأ الآمن.', english: 'The extended family is the safe refuge.', literal: 'The extended family is the secure shelter.', context: 'Extended families living close together provide economic, emotional, and social support. This network is crucial for security and identity in Arab culture.' }
        ]
    },
    'TRADITIONS': {
        'HINDI': [
            { phrase: 'दिवाली प्रकाश का पर्व है।', english: 'Diwali is the festival of lights.', literal: 'Diwali is a celebration of light.', context: 'Diwali celebrates the victory of good over evil. Lighting lamps symbolizes removing darkness and ignorance. Families gather, exchange gifts, and ignite fireworks in jubilation.' },
            { phrase: 'होली रंगों का त्योहार है।', english: 'Holi is the festival of colors.', literal: 'Holi is a celebration of colors.', context: 'Holi marks the arrival of spring and celebrates love and new beginnings. People play with colored powder, signifying releasing past grievances and renewing relationships.' },
            { phrase: 'नवरात्रि नौ दिन का महत्वपूर्ण पर्व है।', english: 'Navratri is a nine-day important festival.', literal: 'Navratri is a nine-day significant celebration.', context: 'Navratri honors the goddess Durga and celebrates feminine power. Each day has spiritual significance, with fasting, dancing (Garba), and prayers observed.' },
            { phrase: 'प्रणाम करना सम्मान की निशानी है।', english: 'Bowing with joined hands is a sign of respect.', literal: 'Pranaam (bowing) is a mark of honor.', context: 'The gesture of pressing palms together and bowing (pranaam) is a Hindu greeting showing respect, humility, and recognition of the divine in others.' },
            { phrase: 'पूजा में तुलसी का पेड़ पवित्र है।', english: 'The tulsi plant is sacred in worship.', literal: 'In worship, the tulsi tree is holy.', context: 'Tulsi (holy basil) is considered sacred in Hinduism. Growing and worshipping a tulsi plant in homes is a spiritual practice believed to bring prosperity and health.' }
        ],
        'FRENCH': [
            { phrase: 'Noël réunit la famille française.', english: 'Christmas unites French families.', literal: 'Christmas brings together the French family.', context: 'Despite France\'s secular nature (laïcité), Christmas dinner (réveillon) is the most important family gathering. Families gather to share traditional meals and strengthen bonds.' },
            { phrase: 'Liberté, égalité, fraternité sont nos valeurs.', english: 'Liberty, equality, brotherhood are our values.', literal: 'Freedom, equality, brotherhood are our values.', context: 'These three values from the French Revolution define French national identity and are inscribed on government buildings, representing the foundation of French society.' },
            { phrase: "Le 14 juillet célèbre la Révolution.", english: 'July 14th celebrates the Revolution.', literal: 'July 14th commemorates the Revolution.', context: 'Bastille Day marks the storming of the Bastille and the beginning of the French Revolution in 1789. It represents France\'s commitment to freedom and democracy.' },
            { phrase: 'Laïcité signifie séparation de l\'État et religion.', english: 'Laïcité means separation of state and religion.', literal: 'Secularism means state separation from religion.', context: 'Laïcité is a core French principle ensuring religious freedom while keeping religion out of government and public life. It protects both believers and non-believers.' },
            { phrase: 'Bastille Day a des feux d\'artifice partout.', english: 'Bastille Day features fireworks everywhere.', literal: 'Bastille Day has fireworks everywhere.', context: 'On July 14th, France celebrates with street parties, parades, and spectacular fireworks displays in cities and towns, reflecting national pride and unity.' }
        ],
        'ARABIC': [
            { phrase: 'رمضان شهر الصيام والعبادة والتراحم.', english: 'Ramadan is the month of fasting, worship, and mercy.', literal: 'Ramadan is a month of fasting, worship, and compassion.', context: 'During Ramadan, Muslims fast from dawn to sunset to develop self-discipline and empathy for the poor. Evening prayers and family meals (Iftar) strengthen spiritual and familial bonds.' },
            { phrase: 'عيد الفطر احتفال نهاية الصيام بالفرح.', english: 'Eid al-Fitr celebrates the end of fasting with joy.', literal: 'Eid al-Fitr is celebration marking end of fasting with happiness.', context: 'Eid al-Fitr is a joyous three-day celebration after Ramadan where families gather, new clothes are worn, special meals are prepared, and gifts are exchanged.' },
            { phrase: 'الحج إلى مكة فريضة على كل مسلم.', english: 'The pilgrimage to Mecca is a duty for every Muslim.', literal: 'The Hajj to Mecca is a religious obligation on every Muslim.', context: 'Hajj is one of Islam\'s five pillars. Millions gather annually in Mecca, creating spiritual unity regardless of ethnicity, language, or social class.' },
            { phrase: 'يوم الجمعة يوم عطلة وصلاة جماعية.', english: 'Friday is the day of rest and congregational prayer.', literal: 'Friday is a day of rest and group prayer.', context: 'Friday (Jumu\'ah) holds special significance in Islam. Muslims gather for noon prayers in mosques, creating community and spiritual connection.' },
            { phrase: 'العيد الميلادي النبي محمد في ربيع الأول.', english: 'The Prophet Muhammad\'s birthday is celebrated in Rabi\'al-awwal.', literal: 'The Prophet Muhammad\'s birth celebration is in Rabi\'al-awwal month.', context: 'Mawlid al-Nabi celebrates the birth of Prophet Muhammad. Muslims gather for prayers, recitations of the Quran, and sharing meals to honor this significant occasion.' }
        ]
    }
};

function loadLesson() {
    let topic = currentState.selectedTopic;
    let lang = currentState.selectedLanguage;
    
    // fallback to localStorage if in multi-page mode
    if (!topic || !lang) {
        // Try class-based first
        if (currentState.classCode) {
            topic = localStorage.getItem('voca_class_' + currentState.classCode + '_topic');
            lang = localStorage.getItem('voca_class_' + currentState.classCode + '_language');
        }
        // Try self-study if still not found
        if (!topic || !lang) {
            topic = topic || localStorage.getItem('voca_self_study_topic');
            lang = lang || localStorage.getItem('voca_self_study_language');
        }
    }
    
    if (!topic || !lang) return;
    const list = LESSONS[topic] && LESSONS[topic][lang];
    if (!list || list.length === 0) return;
    const idx = currentState.lessonIndex || 0;
    const lesson = list[idx];
    const setIf = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    setIf('lessonPhrase', lesson.phrase);
    setIf('lessonLiteral', lesson.literal || lesson.english);
    setIf('lessonContext', lesson.context || '');
    setIf('lessonPhrase_student', lesson.phrase);
    setIf('lessonLiteral_student', lesson.literal || lesson.english);
    setIf('lessonContext_student', lesson.context || '');
    setIf('progressDisplay', `${idx+1}/${list.length} lessons completed — keep going!`);
    setIf('progressDisplay_student', `${idx+1}/${list.length} lessons completed — keep going!`);
    
    // Set flag for teacher lesson
    const flagEl = document.getElementById('lessonFlag');
    if (flagEl && flagSvgs[lang]) {
        flagEl.src = flagSvgs[lang];
    }
    // Set flag for student lesson
    const flagElStudent = document.getElementById('lessonFlag_student');
    if (flagElStudent && flagSvgs[lang]) {
        flagElStudent.src = flagSvgs[lang];
    }
}

function triggerRainingStars() {
    // Create a container for falling stars
    const starsContainer = document.createElement('div');
    starsContainer.className = 'raining-stars-container';
    document.body.appendChild(starsContainer);
    
    // Create 50 stars falling down
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'falling-star';
        star.textContent = '⭐';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 0.5 + 's';
        star.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        starsContainer.appendChild(star);
    }
    
    // Remove container after animation completes
    setTimeout(() => {
        starsContainer.remove();
    }, 3000);
}

function nextLesson() {
    let topic = currentState.selectedTopic;
    let lang = currentState.selectedLanguage;
    
    // fallback to localStorage if in multi-page mode
    if (!topic || !lang) {
        // Try class-based first
        if (currentState.classCode) {
            topic = localStorage.getItem('voca_class_' + currentState.classCode + '_topic');
            lang = localStorage.getItem('voca_class_' + currentState.classCode + '_language');
        }
        // Try self-study if still not found
        if (!topic || !lang) {
            topic = topic || localStorage.getItem('voca_self_study_topic');
            lang = lang || localStorage.getItem('voca_self_study_language');
        }
    }
    
    console.log('nextLesson called - topic:', topic, 'lang:', lang, 'lessonIndex:', currentState.lessonIndex);
    
    const list = LESSONS[topic] && LESSONS[topic][lang];
    if (!list) {
        console.error('No lessons found for topic:', topic, 'lang:', lang);
        return;
    }
    
    currentState.lessonIndex = (currentState.lessonIndex || 0) + 1;
    console.log('After increment, lessonIndex:', currentState.lessonIndex, 'list.length:', list.length);
    
    if (currentState.lessonIndex >= list.length) {
        console.log('All lessons complete! Showing completion page...');
        // Trigger raining stars animation
        triggerRainingStars();
        
        // completed - redirect to completion page or show completion
        setTimeout(() => {
            if (document.getElementById('student-completion')) {
                showPage('student-completion');
            } else if (document.getElementById('completion')) {
                showPage('completion');
            } else {
                // multi-page flow - redirect to completion.html
                console.log('Redirecting to completion.html');
                window.location.href = 'completion.html';
            }
        }, 800);
        return;
    }
    console.log('Loading next lesson...');
    loadLesson();
}

function repeatSlow() {
    // speak slower by setting rate
    let topic = currentState.selectedTopic;
    let lang = currentState.selectedLanguage;
    
    // fallback to localStorage
    if (!topic || !lang) {
        if (currentState.classCode) {
            topic = topic || localStorage.getItem('voca_class_' + currentState.classCode + '_topic');
            lang = lang || localStorage.getItem('voca_class_' + currentState.classCode + '_language');
        }
        topic = topic || localStorage.getItem('voca_self_study_topic');
        lang = lang || localStorage.getItem('voca_self_study_language');
    }
    if (!topic || !lang) return alert('Topic or language not set');
    const list = LESSONS[topic] && LESSONS[topic][lang];
    if (!list) return;
    const li = list[currentState.lessonIndex || 0];
    if (!li) return;
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(li.phrase);
    // Use correct language code for speech
    utter.lang = langMap[lang] || 'en-US';
    utter.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}
