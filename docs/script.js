const views = ['home','recommendations','connect','reviews'];
function show(name) {
  if (!views.includes(name)) name = 'home';
  views.forEach(v => document.getElementById('v-' + v).classList.toggle('active', v === name));
  document.body.classList.toggle('connect', name === 'connect');
  document.querySelectorAll('nav a').forEach(a =>
    a.parentElement.classList.toggle('active', a.dataset.view === name));
  window.scrollTo(0, 0);
}
document.querySelectorAll('nav a').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); show(a.dataset.view); }));
show('home');

/* ---------- BOOK DATA ---------- */
const books = [
  {t:"The Hobbit", a:"J.R.R. Tolkien", tags:"fantasy adventure magic dragons", mood:"adventurous cozy hopeful", min:8, d:"A homebody hobbit is pulled into a quest full of trolls, riddles and one very large dragon."},
  {t:"Charlotte's Web", a:"E.B. White", tags:"classic animals friendship children", mood:"cozy hopeful gentle sad", min:5, d:"A clever spider saves a pig with the power of words."},
  {t:"Anne of Green Gables", a:"L.M. Montgomery", tags:"classic coming-of-age family", mood:"cozy hopeful cheerful", min:9, d:"A talkative orphan wins over a whole farming town."},
  {t:"Pride and Prejudice", a:"Jane Austen", tags:"romance classic comedy", mood:"romantic witty cozy", min:13, d:"Sharp wit, wrong first impressions and a slow-burning love story."},
  {t:"And Then There Were None", a:"Agatha Christie", tags:"mystery crime thriller classic", mood:"thrilling tense dark", min:13, d:"Ten strangers on an island, and they are disappearing one by one."},
  {t:"The Alchemist", a:"Paulo Coelho", tags:"adventure fable philosophy journey", mood:"hopeful calm inspiring", min:12, d:"A shepherd boy follows a dream across the desert."},
  {t:"Project Hail Mary", a:"Andy Weir", tags:"science fiction scifi space humor", mood:"thrilling hopeful funny adventurous", min:14, d:"A lone astronaut wakes up with no memory and the fate of Earth in his hands."},
  {t:"The Night Circus", a:"Erin Morgenstern", tags:"fantasy romance magic", mood:"romantic dreamy magical cozy", min:15, d:"Two young magicians are bound in a duel inside a circus that opens only at night."},
  {t:"Circe", a:"Madeline Miller", tags:"mythology fantasy retelling", mood:"calm dreamy powerful", min:16, d:"The witch of Greek myth finally tells her own story."},
  {t:"The Name of the Wind", a:"Patrick Rothfuss", tags:"fantasy magic music", mood:"adventurous dreamy", min:16, d:"A legendary wizard recounts how he became a legend."},
  {t:"Gone Girl", a:"Gillian Flynn", tags:"thriller mystery crime psychological", mood:"thrilling dark tense", min:18, d:"A wife vanishes on her anniversary and every clue points somewhere new."},
  {t:"Little Women", a:"Louisa May Alcott", tags:"classic family coming-of-age", mood:"cozy hopeful warm", min:10, d:"Four sisters grow up, dream big and hold each other together."}
];
const thoughts = [
  "A good book is a door you can open any time you like.",
  "Every shelf is a small map of someone's curiosity.",
  "Read the last page first if you must. We won't tell.",
  "The best bookmark is whatever was closest to the sofa.",
  "Ten pages a day is a library by next year.",
  "Rereading is just visiting an old friend."
];
const moods = ["cozy","thrilling","hopeful","dreamy","romantic","adventurous"];
const rnd = a => a[Math.floor(Math.random() * a.length)];

/* ---------- HOME EXTRAS ---------- */
function newPick() {
  const b = rnd(books);
  document.getElementById('pick').innerHTML =
    '<div class="pick-title"></div><div class="pick-meta"></div><p></p>';
  const el = document.getElementById('pick');
  el.querySelector('.pick-title').textContent = b.t;
  el.querySelector('.pick-meta').textContent = 'by ' + b.a;
  el.querySelector('p').textContent = b.d;
}
document.getElementById('pickBtn').addEventListener('click', newPick);
newPick();

let qi = new Date().getDate() % thoughts.length;
const showQuote = () => { document.getElementById('quote').textContent = thoughts[qi]; };
document.getElementById('quoteBtn').addEventListener('click', () => { qi = (qi + 1) % thoughts.length; showQuote(); });
showQuote();

let read = 0, goal = 12;
try { read = +localStorage.getItem('anw-read') || 0; } catch (e) {}
function drawGoal() {
  document.getElementById('gRead').textContent = read;
  document.getElementById('gGoal').textContent = goal;
  document.getElementById('gBar').style.width = Math.min(100, read / goal * 100) + '%';
  try { localStorage.setItem('anw-read', read); } catch (e) {}
}
document.getElementById('gPlus').addEventListener('click', () => { read++; drawGoal(); });
document.getElementById('gMinus').addEventListener('click', () => { read = Math.max(0, read - 1); drawGoal(); });
drawGoal();

moods.forEach(m => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn'; b.textContent = m;
  b.addEventListener('click', () => {
    document.getElementById('mood').value = m;
    show('recommendations');
    findBooks();
  });
  document.getElementById('chips').appendChild(b);
});

/* ---------- RECOMMENDATIONS ---------- */
const words = v => v.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
function findBooks() {
  const au = document.getElementById('author').value.trim().toLowerCase();
  const ge = words(document.getElementById('genre').value);
  const mo = words(document.getElementById('mood').value);
  const ageV = parseInt(document.getElementById('age').value, 10);
  const box = document.getElementById('results');
  box.innerHTML = '';
  if (!au && !ge.length && !mo.length && !ageV) {
    box.innerHTML = '<div class="res"><p>Fill in at least one box, then press Enter.</p></div>';
    return;
  }
  const scored = books.filter(b => !ageV || ageV >= b.min).map(b => {
    let sc = 0;
    if (au && b.a.toLowerCase().includes(au)) sc += 3;
    ge.forEach(w => { if (b.tags.includes(w)) sc += 2; });
    mo.forEach(w => { if (b.mood.includes(w)) sc += 2; });
    return {b, sc};
  }).sort((x, y) => y.sc - x.sc);
  let top = scored.filter(x => x.sc > 0).slice(0, 3);
  let note = '';
  if (!top.length) { top = scored.slice(0, 3); note = 'No exact match, so here are a few picks to start with.'; }
  if (!top.length) { box.innerHTML = '<div class="res"><p>No books found for that age. Try a different one.</p></div>'; return; }
  if (note) { const n = document.createElement('p'); n.textContent = note; n.style.textAlign = 'center'; box.appendChild(n); }
  top.forEach(({b}) => {
    const r = document.createElement('div'); r.className = 'res';
    r.innerHTML = '<h3></h3><small></small><p></p>';
    r.querySelector('h3').textContent = b.t;
    r.querySelector('small').textContent = 'by ' + b.a;
    r.querySelector('p').textContent = b.d;
    box.appendChild(r);
  });
}
document.getElementById('enterBtn').addEventListener('click', findBooks);
document.querySelectorAll('.card input').forEach(i =>
  i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); findBooks(); } }));

/* ---------- CONNECT ---------- */
const authors = [
  {n:"Mara Ellison", s:"Cozy fantasy and maps", x:"4 books"},
  {n:"Theo Banerjee", s:"Science fiction", x:"6 books"},
  {n:"Lucia Fernandez", s:"Historical romance", x:"3 books"},
  {n:"Daniel Okafor", s:"Adventures for young readers", x:"8 books"}
];
const readers = [
  {n:"Aisha", u:"@pageturner_aisha", s:"Reading The Hobbit", x:"31 books read"},
  {n:"Sam", u:"@cozynook_sam", s:"Reading Anne of Green Gables", x:"18 books read"},
  {n:"Maya", u:"@midnight_maya", s:"Reading Gone Girl", x:"44 books read"},
  {n:"Zain", u:"@bookworm_zain", s:"Reading Project Hail Mary", x:"27 books read"},
  {n:"Lena", u:"@dreamy_lena", s:"Reading The Night Circus", x:"22 books read"},
  {n:"Omar", u:"@plotwist_omar", s:"Reading And Then There Were None", x:"35 books read"}
];
let following = 0;
function accountCard(o, sub, isAuthor) {
  const c = document.createElement('div'); c.className = 'c-card';
  c.innerHTML = '<div class="avatar" aria-hidden="true"></div><div class="c-info"><div class="c-name"></div><div class="c-sub"></div><div class="c-sub"></div></div><div class="c-btns"><button type="button" class="msg">Message</button><button type="button" class="follow">Follow</button></div>';
  c.querySelector('.avatar').textContent = o.n[0];
  c.querySelector('.c-name').textContent = o.n;
  const subs = c.querySelectorAll('.c-sub');
  subs[0].textContent = sub;
  subs[1].textContent = o.x;
  const m = c.querySelector('.msg');
  m.setAttribute('aria-label', 'Message ' + o.n);
  m.addEventListener('click', () => openChat(o, isAuthor));
  const b = c.querySelector('.follow');
  b.setAttribute('aria-label', 'Follow ' + o.n);
  b.addEventListener('click', () => {
    const on = b.classList.toggle('on');
    b.textContent = on ? 'Following' : 'Follow';
    following += on ? 1 : -1;
    document.getElementById('followNote').textContent =
      'Tap Follow to connect. You are following ' + following + (following === 1 ? ' person.' : ' people.');
  });
  return c;
}
authors.forEach(a => document.getElementById('authorList').appendChild(accountCard(a, a.s, true)));
readers.forEach(r => document.getElementById('readerList').appendChild(accountCard(r, r.u + ' · ' + r.s, false)));

/* ---------- MESSAGING ---------- */
const threads = {};
let chatWith = null, chatIsAuthor = false;
const replies = {
  author: ["Thank you for writing to me! It means a lot.", "Great question. I'll share more about that soon.", "So glad you're reading. Tell me what you think when you finish!"],
  reader: ["Hi! I'd love to swap book ideas.", "Oh nice, that one is on my list too!", "Tell me more. What did you like most about it?"]
};
function addBubble(text, who) {
  const log = document.getElementById('chatLog');
  const e = log.querySelector('.chat-empty'); if (e) e.remove();
  const d = document.createElement('div'); d.className = 'bubble ' + who; d.textContent = text;
  log.appendChild(d); log.scrollTop = log.scrollHeight;
}
function openChat(o, isAuthor) {
  chatWith = o; chatIsAuthor = isAuthor;
  document.getElementById('chatTitle').textContent = o.n;
  document.getElementById('chatAv').textContent = o.n[0];
  const log = document.getElementById('chatLog'); log.innerHTML = '';
  const t = threads[o.n] || [];
  if (!t.length) { const e = document.createElement('div'); e.className = 'chat-empty'; e.textContent = 'Say hello to ' + o.n + '.'; log.appendChild(e); }
  t.forEach(m => addBubble(m.text, m.who));
  document.getElementById('chat').showModal();
  document.getElementById('chatInput').focus();
}
function sendChat() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim(); if (!text || !chatWith) return;
  const who = chatWith, auth = chatIsAuthor;
  (threads[who.n] = threads[who.n] || []).push({text, who: 'me'});
  addBubble(text, 'me'); inp.value = '';
  setTimeout(() => {
    const r = rnd(replies[auth ? 'author' : 'reader']);
    threads[who.n].push({text: r, who: 'them'});
    if (chatWith === who && document.getElementById('chat').open) addBubble(r, 'them');
  }, 1200);
}
document.getElementById('chatSend').addEventListener('click', sendChat);
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
document.getElementById('chatClose').addEventListener('click', () => document.getElementById('chat').close());

const leaf = document.getElementById('leaf');
leaf.addEventListener('click', () => {
  const flipped = leaf.classList.toggle('flipped');
  leaf.setAttribute('aria-pressed', flipped);
});

/* ---------- MOBILE MENU ---------- */
const menuBtn = document.getElementById('menuBtn');
const siteNav = document.getElementById('siteNav');

menuBtn.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen);
});

siteNav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

/* ---------- DARK MODE ---------- */
const themeBtn = document.getElementById('themeBtn');

themeBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeBtn.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeBtn.setAttribute('aria-pressed', isDark);
});

/* ---------- CONTACT FORM ---------- */
const form = document.getElementById('contactForm');
const nameIn = document.getElementById('cName');
const emailIn = document.getElementById('cEmail');
const msgIn = document.getElementById('cMsg');
const nameMsg = document.getElementById('nameMsg');
const emailMsg = document.getElementById('emailMsg');
const msgMsg = document.getElementById('msgMsg');
const msgCount = document.getElementById('msgCount');
const formSuccess = document.getElementById('formSuccess');

function setError(input, msgEl, text) {
  msgEl.textContent = text;
  msgEl.classList.add('error');
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
}
function clearError(input, msgEl) {
  msgEl.textContent = '';
  msgEl.classList.remove('error');
  input.classList.remove('error');
  input.removeAttribute('aria-invalid');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameIn.value.trim();
  const email = emailIn.value.trim();
  const message = msgIn.value.trim();
  let ok = true;

  if (name.length < 3) { setError(nameIn, nameMsg, 'Please enter your full name.'); ok = false; }
  else clearError(nameIn, nameMsg);

  if (!(email.includes('@') && email.includes('.'))) { setError(emailIn, emailMsg, 'Please enter a valid email.'); ok = false; }
  else clearError(emailIn, emailMsg);

  if (message.length < 10) { setError(msgIn, msgMsg, 'Tell us a little more (10+ characters).'); ok = false; }
  else clearError(msgIn, msgMsg);

  if (!ok) { formSuccess.textContent = ''; return; }

  formSuccess.textContent = 'Thanks, ' + name + '! Your message has been sent.';
  form.reset();
  msgCount.textContent = '0 / 200';
});

msgIn.addEventListener('input', () => {
  msgCount.textContent = msgIn.value.length + ' / 200';
});