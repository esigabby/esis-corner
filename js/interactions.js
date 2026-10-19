// =========================================================
// ESI'S CORNER - INTERACTION ENGINE (Likes, Comments, Shares, Easter Eggs)
// =========================================================

// Real Visitor Comments & Real Likes (No fake comments or inflated counts)
const DEFAULT_COMMENTS = {};

const BASE_LIKES = {};

// --- LIKE SYSTEM ---
function getPostLikes(postId) {
    const userLikes = JSON.parse(localStorage.getItem('esis_likes') || '{}');
    const base = BASE_LIKES[postId] || 0;
    const added = userLikes[postId]?.count || 0;
    const isLiked = userLikes[postId]?.liked || false;
    return { count: base + added, isLiked };
}

function toggleLike(postId) {
    const userLikes = JSON.parse(localStorage.getItem('esis_likes') || '{}');
    const current = userLikes[postId] || { count: 0, liked: false };
    
    if (current.liked) {
        current.count = Math.max(0, current.count - 1);
        current.liked = false;
    } else {
        current.count += 1;
        current.liked = true;
    }
    
    userLikes[postId] = current;
    localStorage.setItem('esis_likes', JSON.stringify(userLikes));
    return getPostLikes(postId);
}

// --- COMMENT SYSTEM ---
function getPostComments(postId) {
    const stored = JSON.parse(localStorage.getItem('esis_comments') || '{}');
    const defaultList = DEFAULT_COMMENTS[postId] || [];
    const userList = stored[postId] || [];
    return [...defaultList, ...userList];
}

function addPostComment(postId, name, text) {
    const stored = JSON.parse(localStorage.getItem('esis_comments') || '{}');
    if (!stored[postId]) stored[postId] = [];
    
    const newComment = {
        name: name.trim() || 'Sanctuary Visitor',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        text: text.trim()
    };
    
    stored[postId].unshift(newComment);
    localStorage.setItem('esis_comments', JSON.stringify(stored));
    return getPostComments(postId);
}

// --- SHARE SYSTEM ---
function sharePost(title, url) {
    const fullUrl = url || window.location.href;
    const shareTitle = title || document.title;
    
    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: `Read "${shareTitle}" on Esi's Corner:`,
            url: fullUrl
        }).catch(() => {});
    } else {
        copyToClipboard(fullUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✨ Link copied to sanctuary clipboard!');
    }).catch(() => {
        showToast('🔮 Copied link: ' + text);
    });
}

function showToast(message) {
    let toast = document.getElementById('magic-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'magic-toast';
        toast.className = 'fixed bottom-8 right-8 z-50 bg-[#10150a] border border-yellow-500/50 text-yellow-300 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] text-sm font-semibold flex items-center space-x-2 transition-all duration-300 transform translate-y-20 opacity-0';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
}

// --- INITIALIZE UI WIDGETS ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise Post Interactive Section if on a post page
    const postContainer = document.querySelector('[data-post-id]');
    if (postContainer) {
        const postId = postContainer.getAttribute('data-post-id');
        const postTitle = document.querySelector('h1')?.innerText || "Esi's Journal";
        
        // Setup Like Button
        const likeBtn = document.getElementById('like-btn');
        const likeCountEl = document.getElementById('like-count');
        const likeHeart = document.getElementById('like-heart');
        
        if (likeBtn && likeCountEl) {
            const { count, isLiked } = getPostLikes(postId);
            likeCountEl.innerText = count;
            if (isLiked) {
                likeBtn.classList.add('text-red-400', 'border-red-500/50', 'bg-red-500/10');
                if (likeHeart) likeHeart.innerText = '❤️';
            }
            
            likeBtn.addEventListener('click', (e) => {
                const res = toggleLike(postId);
                likeCountEl.innerText = res.count;
                if (res.isLiked) {
                    likeBtn.classList.add('text-red-400', 'border-red-500/50', 'bg-red-500/10');
                    if (likeHeart) likeHeart.innerText = '❤️';
                    
                    // Spawn mini floating heart burst
                    const rect = likeBtn.getBoundingClientRect();
                    for (let i = 0; i < 8; i++) {
                        const h = document.createElement('div');
                        h.className = 'magic-sparkle';
                        h.innerText = ['❤️', '💖', '✨', '🌻'][Math.floor(Math.random() * 4)];
                        h.style.left = `${rect.left + rect.width / 2}px`;
                        h.style.top = `${rect.top}px`;
                        h.style.setProperty('--tx', `${(Math.random() - 0.5) * 140}px`);
                        document.body.appendChild(h);
                        setTimeout(() => h.remove(), 1600);
                    }
                } else {
                    likeBtn.classList.remove('text-red-400', 'border-red-500/50', 'bg-red-500/10');
                    if (likeHeart) likeHeart.innerText = '🤍';
                }
            });
        }
        
        // Setup Share Buttons
        const copyBtn = document.getElementById('share-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => copyToClipboard(window.location.href));
        }
        
        const twitterBtn = document.getElementById('share-twitter-btn');
        if (twitterBtn) {
            twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Reading "' + postTitle + '" on Esi\'s Corner 🌻🔮')}&url=${encodeURIComponent(window.location.href)}`;
        }
        
        const fbBtn = document.getElementById('share-fb-btn');
        if (fbBtn) {
            fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        }
        
        // Setup Comments Section
        const commentsList = document.getElementById('comments-list');
        const commentForm = document.getElementById('comment-form');
        const commentNameInput = document.getElementById('comment-name');
        const commentTextInput = document.getElementById('comment-text');
        
        function renderComments() {
            if (!commentsList) return;
            const comments = getPostComments(postId);
            const countBadge = document.getElementById('comments-count-badge');
            if (countBadge) countBadge.innerText = `(${comments.length})`;
            
            if (comments.length === 0) {
                commentsList.innerHTML = `<p class="text-gray-400 italic text-sm py-4">No comments yet. Be the first to leave a blessing!</p>`;
                return;
            }
            
            commentsList.innerHTML = comments.map(c => `
                <div class="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-yellow-500/30 transition-all space-y-2">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-yellow-400 magical-font flex items-center">
                            <span class="mr-1.5">🕯️</span> ${escapeHtml(c.name)}
                        </span>
                        <span class="text-gray-400">${escapeHtml(c.date)}</span>
                    </div>
                    <p class="text-gray-200 text-sm font-light leading-relaxed">${escapeHtml(c.text)}</p>
                </div>
            `).join('');
        }
        
        renderComments();
        
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = commentNameInput?.value || 'Sanctuary Visitor';
                const text = commentTextInput?.value || '';
                
                if (!text.trim()) {
                    showToast('⚠️ Please write a message before sending.');
                    return;
                }
                
                addPostComment(postId, name, text);
                if (commentTextInput) commentTextInput.value = '';
                renderComments();
                showToast('✨ Blessing added to this journal entry!');
            });
        }

            // Inject Reader Controls (Font Size Adjuster & Chime)
            const articleEl = postContainer.querySelector('article');
            if (articleEl) {
                const titleEl = articleEl.querySelector('h1');
                if (titleEl) {
                    const readerBar = document.createElement('div');
                    readerBar.className = 'flex items-center justify-between text-xs text-gray-400 mb-8 pb-3 border-b border-white/10';
                    readerBar.innerHTML = `
                        <div class="flex items-center space-x-2">
                            <span class="text-[11px] uppercase tracking-wider font-semibold">Reading Text:</span>
                            <button id="post-font-dec" class="px-2 py-0.5 rounded bg-white/5 border border-white/15 hover:border-yellow-400 text-xs">A-</button>
                            <button id="post-font-inc" class="px-2 py-0.5 rounded bg-white/5 border border-white/15 hover:border-yellow-400 text-xs">A+</button>
                        </div>
                        <button onclick="window.sacredSoundscape?.playSingingBowl()" class="text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 text-xs font-semibold">
                            <span>🔔</span> <span>Focus Chime</span>
                        </button>
                    `;
                    titleEl.parentNode.insertBefore(readerBar, titleEl.nextSibling);

                    const verseContainer = articleEl.querySelector('.space-y-4, .space-y-3, .space-y-6');
                    let currentPostFontSize = 18;
                    const decBtn = readerBar.querySelector('#post-font-dec');
                    const incBtn = readerBar.querySelector('#post-font-inc');

                    if (decBtn && verseContainer) {
                        decBtn.addEventListener('click', () => {
                            currentPostFontSize = Math.max(14, currentPostFontSize - 2);
                            verseContainer.style.fontSize = `${currentPostFontSize}px`;
                        });
                    }
                    if (incBtn && verseContainer) {
                        incBtn.addEventListener('click', () => {
                            currentPostFontSize = Math.min(26, currentPostFontSize + 2);
                            verseContainer.style.fontSize = `${currentPostFontSize}px`;
                        });
                    }
                }
            }

            // Inject Previous / Next Sequential Navigation Banner
            const currentIdx = SANCTUARY_POEMS.findIndex(p => p.id === postId);
            if (currentIdx !== -1 && articleEl) {
                const prevPoem = SANCTUARY_POEMS[(currentIdx - 1 + SANCTUARY_POEMS.length) % SANCTUARY_POEMS.length];
                const nextPoem = SANCTUARY_POEMS[(currentIdx + 1) % SANCTUARY_POEMS.length];

                const navBox = document.createElement('div');
                navBox.className = 'my-10 p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs';
                navBox.innerHTML = `
                    <a href="${prevPoem.pageUrl}" class="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors">
                        <span>&larr;</span>
                        <div class="text-left">
                            <span class="text-[10px] text-gray-500 block uppercase">Previous Entry</span>
                            <span class="font-bold magical-font">${escapeHtml(prevPoem.title)}</span>
                        </div>
                    </a>

                    <a href="journal.html" class="text-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                        Archive (${currentIdx + 1}/${SANCTUARY_POEMS.length})
                    </a>

                    <a href="${nextPoem.pageUrl}" class="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors text-right">
                        <div>
                            <span class="text-[10px] text-gray-500 block uppercase">Next Entry</span>
                            <span class="font-bold magical-font">${escapeHtml(nextPoem.title)}</span>
                        </div>
                        <span>&rarr;</span>
                    </a>
                `;
                const commentsSection = articleEl.querySelector('section');
                if (commentsSection) {
                    articleEl.insertBefore(navBox, commentsSection);
                } else {
                    articleEl.appendChild(navBox);
                }
            }
    }
    
    // 2. Sunflower Blooming Easter Egg
    const sunflowers = document.querySelectorAll('.sunflower-interactive, .sunflower-emoji');
    sunflowers.forEach(sf => {
        sf.style.cursor = 'pointer';
        sf.addEventListener('click', (e) => {
            const rect = sf.getBoundingClientRect();
            for (let i = 0; i < 14; i++) {
                const sp = document.createElement('div');
                sp.className = 'magic-sparkle';
                sp.innerText = ['🌻', '✨', '💛', '☀️', '🌿'][Math.floor(Math.random() * 5)];
                sp.style.left = `${rect.left + rect.width / 2}px`;
                sp.style.top = `${rect.top}px`;
                sp.style.setProperty('--tx', `${(Math.random() - 0.5) * 220}px`);
                document.body.appendChild(sp);
                setTimeout(() => sp.remove(), 1800);
            }
            showToast('🌻 May the sunflowers guide and protect your path!');
        });
    });

    // 3. Oracle Card Easter Egg Widget Drawer
    createDailyOracleCardWidget();

    // 4. Keyboard Spell Easter Egg ("magic" / "conjure")
    let keySequence = '';
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        keySequence += e.key.toLowerCase();
        if (keySequence.length > 10) keySequence = keySequence.slice(-10);
        
        if (keySequence.includes('magic') || keySequence.includes('conjure')) {
            keySequence = '';
            triggerStardustShower();
            showToast('🔮 Sacred Conjure spell unlocked! Ancestral protection active.');
        }
    });
});

function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

// Daily Oracle Card Drawer
function createDailyOracleCardWidget() {
    const cards = [
        {
            title: "The Sunflower (Gede's Light)",
            symbol: "🌻",
            archetype: "Joy & Rebirth",
            meaning: "Even in the darkest soil, your spirit is wired to stretch toward the light. Release all self-judgment today and let your brilliance shine without apology."
        },
        {
            title: "The Ancestral Altar",
            symbol: "🕯️",
            archetype: "Root & Lineage",
            meaning: "Your grandmothers and ancestors stand twelve deep behind you at every crossroads. Pour water, light a white candle, and listen to the whisper of your inner knowing."
        },
        {
            title: "The Baron's Crossroads",
            symbol: "💀",
            archetype: "Transformation & Truth",
            meaning: "Endings are just portals dressed in shadow. Cut the chords to people, habits, and doubts that no longer serve your sovereign highest good."
        },
        {
            title: "The Willow Branch",
            symbol: "🌿",
            archetype: "Flexibility & Healing",
            meaning: "Bend with the storm rather than snapping against it. Allow yourself the grace to rest, to grieve, and to bloom on your own divine schedule."
        },
        {
            title: "The Cartomancer's Ace",
            symbol: "🎴",
            archetype: "Clarity & New Beginnings",
            meaning: "A clear breakthrough is approaching your career and creative life. Stand firmly in your boundaries and trust the wisdom of your cards."
        }
    ];

    // Create Floating Oracle Trigger Button in bottom left
    const oracleBtn = document.createElement('button');
    oracleBtn.id = 'oracle-widget-btn';
    oracleBtn.className = 'fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-[#10150a]/90 border border-yellow-500/40 text-yellow-400 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all flex items-center space-x-2 group backdrop-blur-md cursor-pointer';
    oracleBtn.innerHTML = `
        <span class="text-xl group-hover:rotate-12 transition-transform">🔮</span>
        <span class="text-xs uppercase tracking-widest font-bold magical-font hidden sm:inline text-white group-hover:text-yellow-400">Daily Card</span>
    `;
    document.body.appendChild(oracleBtn);

    // Modal
    const modal = document.createElement('div');
    modal.id = 'oracle-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4 transition-all';
    modal.innerHTML = `
        <div class="max-w-md w-full bg-[#0c1208] border border-yellow-500/40 rounded-3xl p-8 text-center relative shadow-[0_0_40px_rgba(251,191,36,0.25)]">
            <button id="close-oracle-modal" class="absolute top-5 right-5 text-gray-400 hover:text-white text-xl">✕</button>
            <span class="text-xs uppercase tracking-widest text-yellow-400 font-bold block mb-2">Esi's Ancestral Oracle</span>
            <h3 class="text-2xl magical-font font-bold text-white mb-6">Draw Your Card of the Day</h3>
            
            <div id="oracle-card-display" class="p-6 rounded-2xl bg-black/60 border border-white/10 mb-6 cursor-pointer hover:border-yellow-400 transition-all group">
                <div class="text-5xl mb-3 group-hover:scale-110 transition-transform">🎴</div>
                <p class="text-yellow-400 font-bold magical-font text-lg">Click to Reveal Your Card</p>
                <p class="text-xs text-gray-400 font-light mt-1">Channeling intuitive ancestral guidance...</p>
            </div>
            
            <button id="draw-new-card-btn" class="px-6 py-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-green-600 text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">Draw Another Card</button>
        </div>
    `;
    document.body.appendChild(modal);

    oracleBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    modal.querySelector('#close-oracle-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    const cardDisplay = modal.querySelector('#oracle-card-display');
    const drawBtn = modal.querySelector('#draw-new-card-btn');

    function drawCard() {
        const card = cards[Math.floor(Math.random() * cards.length)];
        cardDisplay.innerHTML = `
            <div class="text-6xl mb-3 animate-bounce">${card.symbol}</div>
            <span class="text-xs uppercase tracking-widest text-green-400 font-bold block mb-1">${card.archetype}</span>
            <h4 class="text-2xl magical-font font-bold text-white mb-3 text-yellow-300">${card.title}</h4>
            <p class="text-gray-300 text-sm font-light leading-relaxed italic">"${card.meaning}"</p>
        `;
    }

    cardDisplay.addEventListener('click', drawCard);
    drawBtn.addEventListener('click', drawCard);
}

// Stardust Shower Spell
function triggerStardustShower() {
    const emojis = ['✨', '⭐', '🌻', '🔮', '💛', '💜', '🕯️'];
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'magic-sparkle';
            sparkle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            sparkle.style.left = `${Math.random() * window.innerWidth}px`;
            sparkle.style.top = `${Math.random() * window.innerHeight}px`;
            sparkle.style.setProperty('--tx', `${(Math.random() - 0.5) * 300}px`);
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 2200);
        }, i * 40);
    }
}

// =========================================================
// 5. SACRED SOLFEGGIO & AMBIENT FREQUENCY GENERATOR (Web Audio API)
// =========================================================
class SacredSoundscape {
    constructor() {
        this.ctx = null;
        this.activeOsc = null;
        this.activeGain = null;
        this.noiseNode = null;
        this.isPlaying = false;
        this.currentFreq = 432;
        this.timerId = null;
        this.initUI();
    }

    initAudio() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq = 432) {
        this.initAudio();
        this.stop();

        this.currentFreq = freq;
        this.activeGain = this.ctx.createGain();
        this.activeGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.activeGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

        // Main carrier oscillator
        this.activeOsc = this.ctx.createOscillator();
        this.activeOsc.type = 'sine';
        this.activeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Subtle sub-harmonic warmth
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq / 2, this.ctx.currentTime);
        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        subOsc.connect(subGain);
        subGain.connect(this.activeGain);

        this.activeOsc.connect(this.activeGain);
        this.activeGain.connect(this.ctx.destination);

        this.activeOsc.start();
        subOsc.start();
        this.isPlaying = true;
        this.updateUIState();
    }

    playSingingBowl() {
        this.initAudio();
        this.stop();

        const baseFreq = 432;
        const harmonics = [1, 2.76, 5.4, 8.1];
        const gains = [0.25, 0.12, 0.06, 0.02];

        harmonics.forEach((h, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * h, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(gains[idx], this.ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 6.0);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 6.0);
        });

        showToast('🔔 Chime resonated: 432Hz Ancestral Bowl');
    }

    stop() {
        if (this.activeGain && this.ctx) {
            this.activeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
            setTimeout(() => {
                if (this.activeOsc) {
                    try { this.activeOsc.stop(); } catch(e){}
                    this.activeOsc.disconnect();
                    this.activeOsc = null;
                }
            }, 800);
        }
        this.isPlaying = false;
        if (this.timerId) clearTimeout(this.timerId);
        this.updateUIState();
    }

    setTimer(minutes) {
        if (this.timerId) clearTimeout(this.timerId);
        if (minutes > 0) {
            this.timerId = setTimeout(() => {
                this.stop();
                showToast('🧘 Sanctuary meditation session complete.');
            }, minutes * 60 * 1000);
            showToast(`⏳ Sanctuary timer set for ${minutes} minutes.`);
        }
    }

    updateUIState() {
        const playBtn = document.getElementById('soundscape-toggle-btn');
        const statusEl = document.getElementById('soundscape-status-text');
        const waveBars = document.getElementById('sound-wave-container');
        if (playBtn) {
            playBtn.innerText = this.isPlaying ? '⏸️ Pause Frequency' : '▶️ Play Sanctuary Frequency';
        }
        if (statusEl) {
            statusEl.innerText = this.isPlaying ? `Playing ${this.currentFreq}Hz Tone` : 'Frequency Paused';
        }
        if (waveBars) {
            waveBars.style.opacity = this.isPlaying ? '1' : '0.2';
        }
    }

    initUI() {
        // Create Floating Soundscape Dock Button
        const dockBtn = document.createElement('button');
        dockBtn.id = 'soundscape-dock-btn';
        dockBtn.className = 'fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#10150a]/90 border border-green-500/40 text-green-400 hover:border-green-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center space-x-2 group backdrop-blur-md cursor-pointer';
        dockBtn.innerHTML = `
            <span class="text-xl group-hover:scale-110 transition-transform">🎧</span>
            <span class="text-xs uppercase tracking-widest font-bold magical-font hidden sm:inline text-white group-hover:text-green-400">Sacred Sound</span>
        `;
        document.body.appendChild(dockBtn);

        // Soundscape Modal
        const soundModal = document.createElement('div');
        soundModal.id = 'soundscape-modal';
        soundModal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4 transition-all';
        soundModal.innerHTML = `
            <div class="max-w-md w-full bg-[#0c1208] border border-green-500/40 rounded-3xl p-8 text-center relative shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                <button id="close-sound-modal" class="absolute top-5 right-5 text-gray-400 hover:text-white text-xl">✕</button>
                <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs uppercase font-bold tracking-widest mb-3">
                    <span>⚡</span> <span>Somatic Alchemy</span>
                </div>
                <h3 class="text-2xl magical-font font-bold text-white mb-2">Sacred Soundscape</h3>
                <p id="soundscape-status-text" class="text-xs text-yellow-400 font-semibold mb-6">Harmonic Solfeggio & Meditative Tones</p>

                <!-- Breathing Visualizer -->
                <div class="my-6">
                    <div class="breathing-circle">
                        <div class="text-center">
                            <span class="text-2xl">🌿</span>
                            <span class="block text-[10px] uppercase font-bold text-yellow-300 mt-1">Breathe In / Out</span>
                        </div>
                    </div>
                </div>

                <!-- Frequency Selector Buttons -->
                <div class="grid grid-cols-3 gap-2 mb-6">
                    <button class="freq-btn p-3 rounded-xl bg-black/60 border border-yellow-500/30 hover:border-yellow-400 text-xs font-bold text-yellow-400" data-freq="432">
                        432 Hz
                        <span class="block text-[9px] text-gray-400 font-light mt-0.5">Miracle Alignment</span>
                    </button>
                    <button class="freq-btn p-3 rounded-xl bg-black/60 border border-green-500/30 hover:border-green-400 text-xs font-bold text-green-400" data-freq="528">
                        528 Hz
                        <span class="block text-[9px] text-gray-400 font-light mt-0.5">DNA Repair</span>
                    </button>
                    <button class="freq-btn p-3 rounded-xl bg-black/60 border border-purple-500/30 hover:border-purple-400 text-xs font-bold text-purple-400" data-freq="888">
                        888 Hz
                        <span class="block text-[9px] text-gray-400 font-light mt-0.5">Infinite Abundance</span>
                    </button>
                </div>

                <!-- Main Action Buttons -->
                <div class="flex flex-col space-y-3">
                    <button id="soundscape-toggle-btn" class="w-full py-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-green-600 text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all">
                        ▶️ Play Sanctuary Frequency
                    </button>
                    <button id="singing-bowl-btn" class="w-full py-2.5 rounded-full bg-white/5 border border-white/20 text-yellow-300 text-xs uppercase font-bold hover:bg-white/10 transition-all">
                        🔔 Strike Singing Bowl
                    </button>
                </div>

                <!-- Timer Controls -->
                <div class="mt-6 pt-4 border-t border-white/10 flex justify-center space-x-2 text-[11px] text-gray-400">
                    <span>Timer:</span>
                    <button class="timer-btn hover:text-yellow-400" data-time="5">5m</button> &bull;
                    <button class="timer-btn hover:text-yellow-400" data-time="15">15m</button> &bull;
                    <button class="timer-btn hover:text-yellow-400" data-time="30">30m</button> &bull;
                    <button class="timer-btn hover:text-yellow-400" data-time="0">Off</button>
                </div>
            </div>
        `;
        document.body.appendChild(soundModal);

        dockBtn.addEventListener('click', () => {
            soundModal.classList.remove('hidden');
            soundModal.classList.add('flex');
        });

        soundModal.querySelector('#close-sound-modal').addEventListener('click', () => {
            soundModal.classList.add('hidden');
            soundModal.classList.remove('flex');
        });

        const toggleBtn = soundModal.querySelector('#soundscape-toggle-btn');
        toggleBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stop();
            } else {
                this.playTone(this.currentFreq);
            }
        });

        soundModal.querySelector('#singing-bowl-btn').addEventListener('click', () => {
            this.playSingingBowl();
        });

        soundModal.querySelectorAll('.freq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const freq = parseInt(btn.getAttribute('data-freq'));
                this.playTone(freq);
            });
        });

        soundModal.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const min = parseInt(btn.getAttribute('data-time'));
                this.setTimer(min);
            });
        });
    }
}

// =========================================================
// 6. SACRED CART & BOOKING BUNDLE MANAGER
// =========================================================
class SacredCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('esis_cart') || '[]');
        this.initUI();
    }

    save() {
        localStorage.setItem('esis_cart', JSON.stringify(this.items));
        this.updateCartBadge();
        this.renderCartItems();
    }

    addItem(id, name, price, type = 'Offering') {
        const existing = this.items.find(i => i.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ id, name, price: parseFloat(price), qty: 1, type });
        }
        this.save();
        showToast(`✨ Added "${name}" to your Sanctuary Cart!`);
    }

    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
    }

    updateQty(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                this.removeItem(id);
            } else {
                this.save();
            }
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-count-badge');
        const count = this.getItemCount();
        if (badge) {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }

    renderCartItems() {
        const listEl = document.getElementById('cart-items-list');
        const totalEl = document.getElementById('cart-total-price');
        if (!listEl || !totalEl) return;

        totalEl.innerText = `$${this.getTotal().toFixed(2)}`;

        if (this.items.length === 0) {
            listEl.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <span class="text-4xl block mb-2">🛍️</span>
                    <p class="text-sm font-light">Your sanctuary cart is currently empty.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = this.items.map(item => `
            <div class="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center space-x-4">
                <div class="flex-1">
                    <span class="text-[10px] uppercase font-bold text-yellow-400">${escapeHtml(item.type)}</span>
                    <h4 class="text-sm font-bold text-white magical-font">${escapeHtml(item.name)}</h4>
                    <span class="text-xs text-green-400 font-semibold">$${item.price.toFixed(2)} ea</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="window.sacredCart.updateQty('${item.id}', -1)" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center">-</button>
                    <span class="text-xs font-bold text-white px-1">${item.qty}</span>
                    <button onclick="window.sacredCart.updateQty('${item.id}', 1)" class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center">+</button>
                    <button onclick="window.sacredCart.removeItem('${item.id}')" class="text-red-400 hover:text-red-300 ml-2 text-xs">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    initUI() {
        // Floating Cart Toggle Button in header or navigation
        const navContainer = document.querySelector('nav .max-w-7xl');
        if (navContainer && !document.getElementById('cart-nav-btn')) {
            const cartBtn = document.createElement('button');
            cartBtn.id = 'cart-nav-btn';
            cartBtn.className = 'relative p-2 rounded-full bg-white/5 border border-white/10 hover:border-yellow-400 hover:text-yellow-400 transition-all flex items-center justify-center';
            cartBtn.innerHTML = `
                <span class="text-base">🛍️</span>
                <span id="cart-count-badge" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-[10px] items-center justify-center hidden shadow-[0_0_10px_rgba(251,191,36,0.6)]">0</span>
            `;
            navContainer.appendChild(cartBtn);

            cartBtn.addEventListener('click', () => {
                const drawer = document.getElementById('cart-drawer');
                if (drawer) {
                    drawer.classList.remove('closed');
                    drawer.classList.add('open');
                }
            });
        }

        // Cart Drawer
        const cartDrawer = document.createElement('div');
        cartDrawer.id = 'cart-drawer';
        cartDrawer.className = 'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#090d07] border-l border-yellow-500/30 shadow-2xl p-6 flex flex-col justify-between closed';
        cartDrawer.innerHTML = `
            <div>
                <div class="flex justify-between items-center pb-4 border-b border-white/10">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl">🛍️</span>
                        <h3 class="text-xl magical-font font-bold text-white">Sanctuary Cart</h3>
                    </div>
                    <button id="close-cart-drawer" class="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                <div id="cart-items-list" class="py-6 space-y-3 overflow-y-auto max-h-[60vh]">
                    <!-- Items rendered dynamically -->
                </div>
            </div>

            <div class="pt-4 border-t border-white/10">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm uppercase font-bold text-gray-300">Estimated Total:</span>
                    <span id="cart-total-price" class="text-2xl font-bold text-yellow-400 magical-font">$0.00</span>
                </div>

                <div class="space-y-2">
                    <a id="cart-venmo-checkout" href="https://venmo.com/u/Gabbyesi" target="_blank" class="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 transition-all">
                        <span>💸</span> <span>Checkout / Tip via Venmo (@Gabbyesi)</span>
                    </a>
                    <a href="index.html#booking" class="w-full py-2.5 rounded-full bg-white/5 border border-yellow-500/30 text-yellow-400 font-bold text-xs uppercase tracking-wider hover:bg-yellow-500/10 flex items-center justify-center space-x-2 transition-all">
                        <span>🗓️</span> <span>Schedule Matching Session on Setmore</span>
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(cartDrawer);

        cartDrawer.querySelector('#close-cart-drawer').addEventListener('click', () => {
            cartDrawer.classList.remove('open');
            cartDrawer.classList.add('closed');
        });

        // Add to cart buttons listener on shop pages
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const price = btn.getAttribute('data-price');
                const type = btn.getAttribute('data-type') || 'Product';
                this.addItem(id, name, price, type);
            });
        });

        this.updateCartBadge();
        this.renderCartItems();
    }
}

// =========================================================
// 7. JOURNAL INSTANT SEARCH & TOPIC FILTER ENGINE
// =========================================================
function initJournalSearchAndFilter() {
    const searchInput = document.getElementById('journal-search-input');
    const filterBtns = document.querySelectorAll('.journal-filter-btn');
    const articles = document.querySelectorAll('#journal-grid article');
    const countBadge = document.getElementById('journal-count-display');

    if (!searchInput && filterBtns.length === 0) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function filterPosts() {
        let visibleCount = 0;

        articles.forEach(art => {
            const title = art.querySelector('h3, h2')?.innerText.toLowerCase() || '';
            const text = art.innerText.toLowerCase();
            const category = art.getAttribute('data-category') || 'all';

            const matchesCategory = (activeFilter === 'all' || category.includes(activeFilter));
            const matchesQuery = searchQuery === '' || title.includes(searchQuery) || text.includes(searchQuery);

            if (matchesCategory && matchesQuery) {
                art.style.display = '';
                visibleCount++;
            } else {
                art.style.display = 'none';
            }
        });

        if (countBadge) {
            countBadge.innerText = `Showing ${visibleCount} entries`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterPosts();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            filterPosts();
        });
    });
}

// =========================================================
// 7B. INSTANT RESOURCE SEARCH & CATEGORY FILTER
// =========================================================
function initResourceSearchAndFilter() {
    const searchInput = document.getElementById('resource-search-input');
    const clearBtn = document.getElementById('clear-resource-search');
    const filterBtns = document.querySelectorAll('.resource-filter-btn');
    const items = document.querySelectorAll('[data-resource-item]');
    const countBadge = document.getElementById('visible-count');
    const emptyState = document.getElementById('resource-empty-state');
    const resetFiltersBtn = document.getElementById('reset-resource-filters-btn');

    if (!searchInput && filterBtns.length === 0) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function filterResources() {
        let visibleCount = 0;

        items.forEach(card => {
            const title = card.querySelector('h3, h2, h4')?.innerText.toLowerCase() || '';
            const text = card.innerText.toLowerCase();
            const category = card.getAttribute('data-category') || '';

            const matchesCategory = (activeFilter === 'all' || category.includes(activeFilter));
            const matchesQuery = searchQuery === '' || title.includes(searchQuery) || text.includes(searchQuery);

            if (matchesCategory && matchesQuery) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (countBadge) {
            countBadge.innerText = visibleCount;
        }

        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }

        if (clearBtn) {
            if (searchQuery.length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterResources();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            filterResources();
            searchInput.focus();
        });
    }

    function setFilter(cat) {
        activeFilter = cat;
        filterBtns.forEach(b => {
            const btnCat = b.getAttribute('data-filter');
            if (btnCat === cat) {
                b.className = 'resource-filter-btn px-4 py-1.5 rounded-full font-semibold border transition-all active bg-green-500/20 text-green-300 border-green-500/50';
            } else {
                b.className = 'resource-filter-btn px-4 py-1.5 rounded-full font-semibold border transition-all bg-white/5 text-gray-300 border-white/10 hover:border-green-400/50 hover:text-white';
            }
        });
        filterResources();
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-filter') || 'all';
            setFilter(cat);
        });
    });

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            setFilter('all');
        });
    }
}

// =========================================================
// 8. UNIVERSAL MOBILE NAVIGATION DRAWER
// =========================================================
function initUniversalMobileNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Add Hamburger Button if not present
    let menuBtn = document.getElementById('mobile-menu-toggle');
    if (!menuBtn) {
        menuBtn = document.createElement('button');
        menuBtn.id = 'mobile-menu-toggle';
        menuBtn.className = 'md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-yellow-400 hover:text-white transition-all';
        menuBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        `;
        const innerNav = nav.querySelector('.max-w-7xl');
        if (innerNav) innerNav.appendChild(menuBtn);
    }

    // Add Mobile Drawer
    let drawer = document.getElementById('mobile-drawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'mobile-drawer';
        drawer.className = 'fixed inset-y-0 right-0 z-50 w-72 bg-[#090d07] border-l border-green-900/40 p-6 flex flex-col justify-between closed shadow-2xl';
        drawer.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                    <span class="text-xl magical-font font-bold text-yellow-400">Esi's Corner</span>
                    <button id="close-mobile-drawer" class="text-gray-400 hover:text-white text-xl">✕</button>
                </div>
                <div class="flex flex-col space-y-4 text-sm uppercase tracking-widest font-semibold">
                    <a href="about.html" class="hover:text-yellow-400 py-2 border-b border-white/5">About</a>
                    <a href="journal.html" class="hover:text-yellow-400 py-2 border-b border-white/5">Journal</a>
                    <a href="resources.html" class="hover:text-yellow-400 py-2 border-b border-white/5">PDFs & Resources</a>
                    <a href="marketing.html" class="hover:text-yellow-400 py-2 border-b border-white/5">Marketing</a>
                    <a href="index.html#shop" class="hover:text-yellow-400 py-2 border-b border-white/5">Shop (Coming Soon)</a>
                    <a href="willow.html" class="hover:text-yellow-400 py-2 border-b border-white/5">Willow</a>
                </div>
            </div>
            <div class="pt-6 border-t border-white/10">
                <a href="index.html#booking" class="block text-center py-3 rounded-full bg-gradient-to-r from-yellow-500 via-green-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider">Book A Reading</a>
            </div>
        `;
        document.body.appendChild(drawer);

        menuBtn.addEventListener('click', () => {
            drawer.classList.remove('closed');
            drawer.classList.add('open');
        });

        drawer.querySelector('#close-mobile-drawer').addEventListener('click', () => {
            drawer.classList.remove('open');
            drawer.classList.add('closed');
        });
    }
}

// =========================================================
// 9. COMPLETE POEMS DATABASE & SANCTUARY READER ENGINE
// =========================================================
const SANCTUARY_POEMS = [
    {
        id: 'diary',
        title: 'Diary of A Mad Black Woman',
        date: 'Feb 27, 2024',
        type: 'Featured Essay',
        color: 'yellow',
        pageUrl: 'post-diary.html',
        content: `The feeling of double consciousness is draining. I would like to argue that black women have a triple consciousness. We see our fathers and brothers die, we see our mothers and sisters carrying their crosses along with the crosses of our fallen family. We harbor the anger of past generations of our wombs.

We are asked to be strong when we want to be soft. We are asked to lead when we want to rest. We are expected to swallow our rage so the room feels comfortable, while our spirits scream for justice and peace.

In my Vodou practice, our anger is not useless—it is alchemical. It is the fire that cleanses, the salt that protects, and the voice of the Ancestors demanding that we no longer shrink. This diary is for every Black woman who has been told she is 'too much' when she is finally choosing herself.`
    },
    {
        id: 'hide-and-seek',
        title: 'Hide and Seek',
        date: 'July 22, 2024',
        type: 'Poetry',
        color: 'green',
        pageUrl: 'post-hide-and-seek.html',
        content: `An inner child poem:

Ready or not here I come
Finding the girl inside
I know you're in there
I know you had to hide
For fear of other people
For fear of growing up
No matter the storm, come out and be warm
In this heart of mine
I’ll show you the life that we made,
It’s fine.`
    },
    {
        id: 'loved',
        title: 'Am I Made To Be Loved?',
        date: 'Feb 26, 2024',
        type: 'Poetry',
        color: 'green',
        pageUrl: 'post-loved.html',
        content: `Am I made to be loved?

Or was I fashioned just to carry the light for others while standing in the dark?
The ancestors whispered back:
You were created from divine love itself.
Before you seek it in another mortal vessel, remember the blood running in your veins is sacred royalty.
You are the love you've been waiting for.`
    },
    {
        id: 'morning',
        title: 'Morning',
        date: 'Feb 25, 2024',
        type: 'Reflections',
        color: 'yellow',
        pageUrl: 'post-morning.html',
        content: `I've never allowed myself to mourn.

Every sunrise asked for composure.
Every morning demanded that I stand tall before I had gathered my broken pieces.
Today I realize: morning is not just dawn; it is the sacred space to mourn what was lost so new light can enter.`
    },
    {
        id: 'death',
        title: 'A Random Thought About Death',
        date: 'Feb 24, 2024',
        type: 'Reflections',
        color: 'purple',
        pageUrl: 'post-death.html',
        content: `A thought wrote down before I knew the Barons.

Death is not an ending, it is the sacred return.
Before I knew Baron Samedi, before I poured rum at the crossroads, I knew the spirit does not decay with the flesh.
We are merely walking each other back to the ancestral fire.
When the breath leaves, the memory blossoms.`
    },
    {
        id: 'sick-irony',
        title: 'Sick Irony',
        date: 'Sept 2, 2021',
        type: 'Poetry',
        color: 'yellow',
        pageUrl: 'post-sick-irony.html',
        content: `"I miss the person you used to be."

Who is she?
That girl with the carefree smile and the light in her eyes
That girl who still did not know just how cruel the world could be
It seems as though the author of my book awarded me with character development with the harsh thematic lessons.
Oh to be carefree in a world that is careless
Oh to be her again
Where do I even start?
I guess this is where I begin.
She is the missing part of me that I have been filling with you.
And now the only way to get back to you is to find her.
The sick irony that the author of my life has played on me.
Trying to find yet again the carefree girl that once was me.`
    },
    {
        id: 'august-26',
        title: 'August 26',
        date: 'Aug 26, 2020',
        type: 'Poetry',
        color: 'yellow',
        pageUrl: 'post-august-26.html',
        content: `On the eve of yet another year more of existence,

I am not sure of who I am or who I want to be anymore.
The person I was a year ago,
Is no longer recognized.
The raven created by Poe would adorn me with the same thing it adorned his love:
Nevermore.`
    },
    {
        id: 'polarity',
        title: 'Polarity',
        date: 'June 9, 2020',
        type: 'Poetry',
        color: 'purple',
        pageUrl: 'post-polarity.html',
        content: `You speak in mysteries and riddles,
But I always crack the code.
You try to push me away,
But I can brace the cold.
Let me warm that cold shoulder with my embrace.
I am attracted to you.
Not just that face.
Not just the abs.
Not the hair.
I am attracted to your soul.
It's so strong and beautiful.
I know you have been wounded by love.
I understand that.
But baby my middle name is love let me heal it.
A strong man mentality means mental health fragility.
You need someone in your corner so let me stand by your side.
Yes, I know you and I are opposites.
Polar opposites even
But love that's why we are so attracted to each other.`
    },
    {
        id: 'last-one',
        title: 'Last One For You',
        date: 'Feb 23, 2019',
        type: 'Poetry',
        color: 'yellow',
        pageUrl: 'post-last-one.html',
        content: `I love you
I do
But I think I love the man I created in my mind
Not the actual You
You are not perfect
Your words hurt me multiple times
Your "trust issues" got outta line
I choose not to look at the signs
I was hurting you and myself by continuing on
You are not the man I thought you were
Your words built a prison around my mind
Scared to live the life I want
In fear that the guy I wanted
Would leave me
The gifts you got me were amazing
I'm grateful don't get me wrong
But that bracelet showed me everything that was wrong with our relationship
Beautiful on the outside
Ugly on the inside
Thank you for showing me what I don't want in a man
And thank you for setting me free.`
    },
    {
        id: 'tense',
        title: 'Tense',
        date: 'Feb 13, 2019',
        type: 'Poetry',
        color: 'purple',
        pageUrl: 'post-tense.html',
        content: `"I love you more"

It has to be true
It was never a debate I always knew
And now
Now
I have proof
I need sometime to become happy
Neither of us was
So I took a step back
I hurt you I know that
I didn't want to fight everyday
I just want to put a smile on your face
Always and forever turns into "Nevermore"
And now I know I loved you more
Because you said you used to love me (Past tense),
But I still love you and love you more (Present tense),
But sadly this relationship is Nevermore (Future tense).`
    },
    {
        id: 'broken-pot',
        title: 'Broken Pot',
        date: 'July 20, 2018',
        type: 'Poetry',
        color: 'green',
        pageUrl: 'post-broken-pot.html',
        content: `Trust is not something easily found
Like a drumstick or a clown
It is something that grows
Like an orchid on the ground
Long lasting and beautiful it can be
You and me grew the orchid from infancy
We nurtured and sheltered it
The world did not respond so nicely
The whispers of the jealous blew too rough
The over exposure of hatred wilted our leaves
And finally rudeness of earth killed
us
the orchid
and the trust.
Now we are just a broken pot sitting in the dust.`
    },
    {
        id: 'purple-emotions',
        title: 'Purple Emotions',
        date: 'Sept 17, 2017',
        type: 'Poetry',
        color: 'purple',
        pageUrl: 'post-purple-emotions.html',
        content: `Shades of blue
That's what I was before I met you
Shades of blue
The colors of those ocean eyes
The love in your eyes made me smile wide
Shades of blue
The rain on that wretched day
Shades of blue
When they took my love away
Shades of blue
How I felt after I left you
Shades of blue
After I saw how I hurt you
Shades of blue
After I could not apologize
Shades of blue
I wish I could wipe the tears from your face
Shades of blue
Turns to red...
The love that flowed in my heart instead
Flows out in a sea of red.`
    }
];

class SanctuaryPoemReader {
    constructor() {
        this.currentPoemIndex = 0;
        this.fontSize = 18; // Default reading font size
        this.initUI();
    }

    openPoem(poemId) {
        const idx = SANCTUARY_POEMS.findIndex(p => p.id === poemId);
        if (idx !== -1) {
            this.currentPoemIndex = idx;
            this.renderCurrentPoem();
            const modal = document.getElementById('poem-reader-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }
    }

    renderCurrentPoem() {
        const poem = SANCTUARY_POEMS[this.currentPoemIndex];
        if (!poem) return;

        const titleEl = document.getElementById('reader-poem-title');
        const badgeEl = document.getElementById('reader-poem-badge');
        const contentEl = document.getElementById('reader-poem-content');
        const counterEl = document.getElementById('reader-poem-counter');
        const discussLink = document.getElementById('reader-discuss-link');

        if (titleEl) titleEl.innerText = poem.title;
        if (badgeEl) badgeEl.innerText = `${poem.type} • ${poem.date}`;
        if (counterEl) counterEl.innerText = `Entry ${this.currentPoemIndex + 1} of ${SANCTUARY_POEMS.length}`;
        if (discussLink) discussLink.href = poem.pageUrl;

        if (contentEl) {
            contentEl.style.fontSize = `${this.fontSize}px`;
            // Format paragraphs and stanzas with clean line breaks
            const formatted = poem.content.split('\n\n').map(stanza => {
                const lines = stanza.split('\n').map(l => escapeHtml(l)).join('<br>');
                return `<p class="mb-5 leading-relaxed">${lines}</p>`;
            }).join('');
            contentEl.innerHTML = formatted;
        }
    }

    nextPoem() {
        this.currentPoemIndex = (this.currentPoemIndex + 1) % SANCTUARY_POEMS.length;
        this.renderCurrentPoem();
    }

    prevPoem() {
        this.currentPoemIndex = (this.currentPoemIndex - 1 + SANCTUARY_POEMS.length) % SANCTUARY_POEMS.length;
        this.renderCurrentPoem();
    }

    adjustFontSize(delta) {
        this.fontSize = Math.max(14, Math.min(26, this.fontSize + delta));
        const contentEl = document.getElementById('reader-poem-content');
        if (contentEl) contentEl.style.fontSize = `${this.fontSize}px`;
    }

    setAtmosphere(themeClass) {
        const box = document.getElementById('reader-dialog-box');
        if (box) {
            box.classList.remove('reader-theme-midnight', 'reader-theme-emerald', 'reader-theme-violet', 'reader-theme-gold');
            box.classList.add(themeClass);
        }
    }

    initUI() {
        // Build the Sanctuary Reading Modal
        const modal = document.createElement('div');
        modal.id = 'poem-reader-modal';
        modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-lg hidden items-center justify-center p-4 transition-all duration-300';
        modal.innerHTML = `
            <div id="reader-dialog-box" class="max-w-2xl w-full bg-[#080d06] border border-yellow-500/40 rounded-3xl p-6 md:p-10 text-left relative shadow-[0_0_50px_rgba(251,191,36,0.2)] max-h-[90vh] flex flex-col justify-between transition-colors duration-300">
                
                <!-- Modal Top Controls -->
                <div class="flex justify-between items-start pb-4 border-b border-white/10 mb-6">
                    <div>
                        <span id="reader-poem-badge" class="text-xs uppercase tracking-widest text-yellow-400 font-bold block mb-1">Poetry</span>
                        <h2 id="reader-poem-title" class="text-2xl md:text-3xl magical-font font-bold text-white">Poem Title</h2>
                    </div>

                    <div class="flex items-center space-x-2">
                        <!-- Font size buttons -->
                        <button id="reader-font-dec" title="Smaller text" class="w-7 h-7 rounded-lg bg-white/5 border border-white/15 text-xs text-gray-300 hover:text-white hover:border-yellow-400 flex items-center justify-center">A-</button>
                        <button id="reader-font-inc" title="Larger text" class="w-7 h-7 rounded-lg bg-white/5 border border-white/15 text-xs text-gray-300 hover:text-white hover:border-yellow-400 flex items-center justify-center">A+</button>
                        <button id="close-poem-reader" class="text-gray-400 hover:text-white text-2xl ml-2 leading-none">✕</button>
                    </div>
                </div>

                <!-- Theme / Atmosphere selector pills -->
                <div class="flex items-center justify-between text-xs text-gray-400 mb-4 pb-2 border-b border-white/5">
                    <div class="flex items-center space-x-1">
                        <span class="mr-1 text-[11px] uppercase font-semibold">Mood:</span>
                        <button onclick="window.sanctuaryReader.setAtmosphere('reader-theme-midnight')" class="px-2.5 py-1 rounded-md bg-black/60 border border-white/20 text-gray-300 hover:text-white text-[11px]">🌙 Midnight</button>
                        <button onclick="window.sanctuaryReader.setAtmosphere('reader-theme-emerald')" class="px-2.5 py-1 rounded-md bg-green-950/40 border border-green-500/30 text-green-300 hover:text-white text-[11px]">🌿 Emerald</button>
                        <button onclick="window.sanctuaryReader.setAtmosphere('reader-theme-violet')" class="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white text-[11px]">💜 Violet</button>
                        <button onclick="window.sanctuaryReader.setAtmosphere('reader-theme-gold')" class="px-2.5 py-1 rounded-md bg-yellow-950/40 border border-yellow-500/30 text-yellow-300 hover:text-white text-[11px]">☀️ Gold</button>
                    </div>

                    <button onclick="window.sacredSoundscape.playSingingBowl()" title="Focus Chime" class="text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 text-[11px]">
                        <span>🔔</span> <span>Resonate Chime</span>
                    </button>
                </div>

                <!-- Scrollable Poem Text Container -->
                <div id="reader-poem-content" class="overflow-y-auto pr-3 text-gray-200 font-light italic my-2 max-h-[50vh] text-center md:text-left">
                    <!-- Text injected here -->
                </div>

                <!-- Modal Bottom Navigation & Actions -->
                <div class="pt-6 border-t border-white/10 mt-6 flex flex-wrap justify-between items-center gap-4">
                    <div class="flex items-center space-x-2">
                        <button id="reader-prev-btn" class="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs text-gray-300 hover:text-white hover:border-yellow-400 transition-all">&larr; Previous</button>
                        <span id="reader-poem-counter" class="text-xs text-gray-400 font-mono">1 of 12</span>
                        <button id="reader-next-btn" class="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs text-gray-300 hover:text-white hover:border-yellow-400 transition-all">Next &rarr;</button>
                    </div>

                    <a id="reader-discuss-link" href="#" class="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500 via-green-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">
                        Full Post & Reflections &rarr;
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#close-poem-reader').addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        modal.querySelector('#reader-prev-btn').addEventListener('click', () => this.prevPoem());
        modal.querySelector('#reader-next-btn').addEventListener('click', () => this.nextPoem());
        modal.querySelector('#reader-font-dec').addEventListener('click', () => this.adjustFontSize(-2));
        modal.querySelector('#reader-font-inc').addEventListener('click', () => this.adjustFontSize(2));

        // Keyboard arrow navigation
        window.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('hidden')) {
                if (e.key === 'ArrowRight') this.nextPoem();
                if (e.key === 'ArrowLeft') this.prevPoem();
                if (e.key === 'Escape') {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            }
        });
    }
}

// Inline Accordion Toggle Helper
function toggleInlinePoem(poemId) {
    const el = document.getElementById(`inline-poem-${poemId}`);
    const btn = document.getElementById(`toggle-btn-${poemId}`);
    if (!el) return;

    if (el.classList.contains('expanded')) {
        el.classList.remove('expanded');
        if (btn) btn.innerHTML = '<span>📖 Expand Verse</span> <span>&darr;</span>';
    } else {
        el.classList.add('expanded');
        if (btn) btn.innerHTML = '<span>📖 Collapse Verse</span> <span>&uarr;</span>';
    }
}

// Global Dynamic Real Interaction Sync for Journal Cards
function initRealJournalInteractions() {
    document.querySelectorAll('[data-post-id]').forEach(el => {
        const pid = el.getAttribute('data-post-id');
        const countEl = el.querySelector('.real-like-count');
        if (countEl) {
            const likes = getPostLikes(pid);
            countEl.innerText = likes.count;
        }
    });
}

// Announcement Banner Auto-Loader from content/announcement.json
async function loadSanctuaryAnnouncement() {
    try {
        const res = await fetch('content/announcement.json');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.active && data.message) {
            let banner = document.getElementById('sanctuary-announcement-bar');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'sanctuary-announcement-bar';
                banner.className = 'w-full py-2.5 px-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black text-center text-xs md:text-sm font-bold tracking-wide flex items-center justify-center space-x-3 shadow-lg relative z-50';
                
                let btnHtml = '';
                if (data.buttonText && data.buttonLink) {
                    btnHtml = `<a href="${data.buttonLink}" class="ml-2 px-3 py-1 rounded-full bg-black text-yellow-300 text-xs font-bold hover:bg-neutral-900 transition-colors">${data.buttonText} &rarr;</a>`;
                }
                
                banner.innerHTML = `<span>✨ ${data.message}</span>${btnHtml}`;
                document.body.prepend(banner);
                
                const nav = document.querySelector('nav.fixed');
                if (nav) {
                    nav.style.top = banner.offsetHeight + 'px';
                    document.body.style.paddingTop = banner.offsetHeight + 'px';
                }
            }
        }
    } catch(e) {}
}

// Global Instantiation
window.addEventListener('DOMContentLoaded', () => {
    window.sacredSoundscape = new SacredSoundscape();
    window.sacredCart = new SacredCart();
    window.sanctuaryReader = new SanctuaryPoemReader();
    initJournalSearchAndFilter();
    initResourceSearchAndFilter();
    initUniversalMobileNav();
    initRealJournalInteractions();
    loadSanctuaryAnnouncement();
});


