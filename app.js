/* Ambisius Belajar - Static Web App (No frameworks, no build) */
(function () {
  'use strict';

  // --------- Constants and Sample Data ---------
  const STAGES = [
    { id: 'stage1', name: 'Stage 1', priceIdr: 50000 },
    { id: 'stage2', name: 'Stage 2', priceIdr: 50000 },
    { id: 'stage3', name: 'Stage 3', priceIdr: 50000 },
  ];

  const RESOURCE_CATALOG = [
    { id: 'L1', section: 'Listening', title: 'Identifying Key Information', type: 'text', url: '#', description: 'Strategies for listening to monologues and conversations.' },
    { id: 'L2', section: 'Listening', title: 'Map/Plan/Diagram Labelling', type: 'video', url: 'https://www.youtube.com/embed/RpG3gxYkW5I', description: 'Common pitfalls and tips.' },
    { id: 'R1', section: 'Reading', title: 'Skimming and Scanning', type: 'text', url: '#', description: 'Reading efficiently for key points.' },
    { id: 'R2', section: 'Reading', title: 'True/False/Not Given', type: 'text', url: '#', description: 'How to avoid traps.' },
    { id: 'W1', section: 'Writing', title: 'Task 1: Describing Graphs', type: 'pdf', url: '#', description: 'Structure and vocabulary.' },
    { id: 'W2', section: 'Writing', title: 'Task 2: Opinion Essays', type: 'text', url: '#', description: 'Plan, write, review.' },
    { id: 'S1', section: 'Speaking', title: 'Fluency and Coherence', type: 'text', url: '#', description: 'Practise speaking with prompts.' },
  ];

  const QUIZ_BANK = {
    Listening: [
      {
        id: 'LQ1', title: 'Listening Basics', timeLimitSec: 120,
        questions: [
          { q: 'Speaker mentions the meeting is on', options: ['Monday', 'Tuesday', 'Friday', 'Sunday'], a: 1 },
          { q: 'The venue is on', options: ['2nd floor', '3rd floor', 'Ground floor', 'Basement'], a: 2 },
          { q: 'Bring your', options: ['ID card', 'Passport', 'Notebook', 'Calculator'], a: 0 },
          { q: 'Starts at', options: ['8:00', '8:30', '9:00', '9:30'], a: 2 },
          { q: 'Ends at', options: ['10:00', '10:30', '11:00', '11:30'], a: 1 },
        ]
      }
    ],
    Reading: [
      {
        id: 'RQ1', title: 'Reading Passage 1', timeLimitSec: 180,
        questions: [
          { q: 'Skimming helps to', options: ['Read every word', 'Find main idea quickly', 'Check grammar', 'Translate text'], a: 1 },
          { q: 'Scanning is used for', options: ['Details', 'Pronunciation', 'Summaries', 'Synonyms'], a: 0 },
          { q: 'True/False/Not Given: Scanning reads all words', options: ['True', 'False', 'Not Given'], a: 1 },
          { q: 'Synonym of rapid', options: ['slow', 'fast', 'small', 'late'], a: 1 },
          { q: 'Opposite of complex', options: ['simple', 'advanced', 'abstract', 'tough'], a: 0 },
        ]
      }
    ],
    Writing: [
      {
        id: 'WQ1', title: 'Writing Task Practice', timeLimitSec: 900,
        writing: true,
        prompts: [
          'Task 1: Summarize the key trends in a chart showing internet usage from 2000-2020.',
          'Task 2: Some believe technology isolates people. Discuss both views and give your opinion.'
        ]
      }
    ],
    Speaking: [
      {
        id: 'SQ1', title: 'Speaking Prompts', timeLimitSec: 300,
        speaking: true,
        prompts: [
          'Describe a memorable journey you had.',
          'Talk about a book that influenced you and why.'
        ]
      }
    ]
  };

  // --------- Utilities ---------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.hidden = true), 2200);
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function percentToBand(p) {
    const approx = Math.round(((p / 100) * 9) * 2) / 2; // half bands
    return Math.max(0, Math.min(9, approx));
  }

  function svgLine(points, width, height) {
    if (points.length === 0) return '<svg></svg>';
    const xs = points.map((_, i) => (i / (points.length - 1)) * (width - 16) + 8);
    const ys = points.map(v => height - 8 - (v / 100) * (height - 16));
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const area = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(' ') + ` L${xs[xs.length-1].toFixed(1)},${height-8} L${xs[0].toFixed(1)},${height-8} Z`;
    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#14b8a6" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="#fff" rx="10"/>
        <path d="${area}" fill="url(#grad)" />
        <path d="${d}" fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" />
      </svg>`;
  }

  // --------- Storage Layer (localStorage) ---------
  const STORAGE_KEYS = {
    users: 'ab.users',
    currentUserId: 'ab.currentUserId',
  };

  function readUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); } catch { return []; }
  }
  function writeUsers(users) { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }
  function getCurrentUserId() { return localStorage.getItem(STORAGE_KEYS.currentUserId); }
  function setCurrentUserId(id) { if (id) localStorage.setItem(STORAGE_KEYS.currentUserId, id); else localStorage.removeItem(STORAGE_KEYS.currentUserId); }

  function createEmptyUser(email, passwordHash) {
    return {
      id: 'u_' + Math.random().toString(36).slice(2, 10),
      email,
      passwordHash,
      profile: { targetBand: 6.5, testType: 'Academic' },
      progress: { completedResourceIds: [] },
      history: { Listening: [], Reading: [], Writing: [], Speaking: [] },
      unlockedStages: {},
      payments: { transactions: [] }
    };
  }

  function getCurrentUser() {
    const id = getCurrentUserId();
    if (!id) return null;
    return readUsers().find(u => u.id === id) || null;
  }

  function saveUser(updated) {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = updated;
      writeUsers(users);
    }
  }

  // --------- Auth ---------
  async function sha256(text) {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function handleRegister() {
    const email = $('#register-email').value.trim().toLowerCase();
    const password = $('#register-password').value;
    if (!email || !password) return showToast('Please enter email and password');
    const users = readUsers();
    if (users.some(u => u.email === email)) return showToast('Email already registered');
    const hash = await sha256(password);
    const user = createEmptyUser(email, hash);
    users.push(user);
    writeUsers(users);
    setCurrentUserId(user.id);
    $('#auth-modal').hidden = true;
    initializeUI();
    showToast('Account created');
  }

  async function handleLogin() {
    const email = $('#login-email').value.trim().toLowerCase();
    const password = $('#login-password').value;
    if (!email || !password) return showToast('Please enter email and password');
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return showToast('No account found');
    const hash = await sha256(password);
    if (user.passwordHash !== hash) return showToast('Incorrect password');
    setCurrentUserId(user.id);
    $('#auth-modal').hidden = true;
    initializeUI();
    showToast('Welcome back');
  }

  function handleLogout() {
    setCurrentUserId(null);
    $('#auth-modal').hidden = false;
    showToast('Logged out');
  }

  function setupAuthModal() {
    const modal = $('#auth-modal');
    const tabs = $$('.tab');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const tabName = t.dataset.tab;
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      $('#tab-' + tabName).classList.add('active');
    }));

    $('#register-submit').addEventListener('click', handleRegister);
    $('#login-submit').addEventListener('click', handleLogin);
  }

  // --------- Routing ---------
  function navigateTo(hash) {
    if (!hash) hash = '#dashboard';
    $$('.view').forEach(v => v.classList.remove('view-active'));
    const v = document.querySelector(`[id="view-${hash.slice(1)}"]`);
    if (v) v.classList.add('view-active');
    $$('.nav-link').forEach(b => {
      if (b.dataset.route === hash) b.classList.add('active'); else b.classList.remove('active');
    });

    // render on navigation
    if (hash === '#dashboard') renderDashboard();
    if (hash === '#resources') renderResources();
    if (hash === '#quizzes') renderQuizzes();
    if (hash === '#mock') renderMockTests();
    if (hash === '#profile') renderProfile();
    if (hash === '#subscription') renderSubscription();
  }

  function setupNav() {
    $$('.nav-link').forEach(b => b.addEventListener('click', () => {
      const h = b.dataset.route;
      location.hash = h;
      navigateTo(h);
    }));
    $('#logoutBtn').addEventListener('click', handleLogout);
  }

  // --------- Resources ---------
  function renderResources() {
    const user = getCurrentUser();
    const wrap = $('#resources-list');
    wrap.innerHTML = '';
    RESOURCE_CATALOG.forEach(item => {
      const completed = user.progress.completedResourceIds.includes(item.id);
      const el = document.createElement('div');
      el.className = 'card stage';
      el.innerHTML = `
        <div class="small" style="color:var(--muted)">${item.section}</div>
        <h3>${item.title}</h3>
        <p class="small" style="margin:0">${item.description}</p>
        ${item.type === 'video' ? `<div class="center" style="margin-top:8px"><iframe width="100%" height="200" src="${item.url}" title="Video" frameborder="0" allowfullscreen></iframe></div>` : ''}
        <div class="stage-actions">
          <button class="btn btn-secondary" data-open="${item.id}">Open</button>
          <button class="btn ${completed ? 'btn-secondary' : 'btn-primary'}" data-complete="${item.id}" ${completed ? 'disabled' : ''}>${completed ? 'Completed' : 'Mark Completed'}</button>
        </div>`;
      wrap.appendChild(el);
    });

    wrap.querySelectorAll('button[data-complete]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-complete');
      const user = getCurrentUser();
      if (!user.progress.completedResourceIds.includes(id)) {
        user.progress.completedResourceIds.push(id);
        saveUser(user);
        renderResources();
        showToast('Resource marked completed');
      }
    }));

    wrap.querySelectorAll('button[data-open]').forEach(btn => btn.addEventListener('click', () => {
      showToast('Open resource: content viewer not implemented; see description and video.');
    }));
  }

  // --------- Quizzes ---------
  let activeQuiz = null; let quizTimer = null; let quizRemaining = 0;

  function renderQuizzes() {
    const wrap = $('#quizzes-list');
    wrap.innerHTML = '';
    Object.keys(QUIZ_BANK).forEach(section => {
      const quizzes = QUIZ_BANK[section];
      quizzes.forEach(qz => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="small" style="color:var(--muted)">${section}</div>
          <h3>${qz.title}</h3>
          <div class="stage-actions">
            <button class="btn btn-primary" data-start-quiz="${section}:${qz.id}">Start</button>
          </div>`;
        wrap.appendChild(card);
      });
    });

    wrap.querySelectorAll('button[data-start-quiz]').forEach(btn => btn.addEventListener('click', () => {
      const [section, id] = btn.getAttribute('data-start-quiz').split(':');
      startQuiz(section, id);
    }));
  }

  function startQuiz(section, quizId) {
    const qz = QUIZ_BANK[section].find(x => x.id === quizId);
    if (!qz) return;
    activeQuiz = { section, quiz: qz };
    $('#quiz-title').textContent = `${section}: ${qz.title}`;

    const runner = $('#quiz-runner');
    runner.hidden = false;
    const list = $('#quiz-questions');
    list.innerHTML = '';

    if (qz.writing) {
      qz.prompts.forEach((p, idx) => {
        const block = document.createElement('div');
        block.className = 'quiz-question';
        block.innerHTML = `<div style="font-weight:600; margin-bottom:6px">${p}</div><textarea data-writing="${idx}" rows="6" placeholder="Write your response here..."></textarea>`;
        list.appendChild(block);
      });
    } else if (qz.speaking) {
      qz.prompts.forEach((p, idx) => {
        const block = document.createElement('div');
        block.className = 'quiz-question';
        block.innerHTML = `<div style="font-weight:600; margin-bottom:6px">Prompt ${idx+1}</div><div>${p}</div><div class="hint">Speak for 1-2 minutes. You may record separately.</div>`;
        list.appendChild(block);
      });
    } else {
      qz.questions.forEach((item, idx) => {
        const qEl = document.createElement('div');
        qEl.className = 'quiz-question';
        qEl.innerHTML = `<div style="font-weight:600; margin-bottom:6px">Q${idx+1}. ${item.q}</div>` +
          item.options.map((opt, i) => `
            <label class="option"><input type="radio" name="q_${idx}" value="${i}"><span>${opt}</span></label>
          `).join('');
        list.appendChild(qEl);
      });
    }

    quizRemaining = qz.timeLimitSec || 60;
    $('#quiz-timer').textContent = formatMMSS(quizRemaining);
    clearInterval(quizTimer);
    quizTimer = setInterval(() => {
      quizRemaining -= 1;
      $('#quiz-timer').textContent = formatMMSS(Math.max(0, quizRemaining));
      if (quizRemaining <= 0) {
        clearInterval(quizTimer);
        submitQuiz();
      }
    }, 1000);

    $('#submit-quiz').onclick = submitQuiz;
    $('#cancel-quiz').onclick = () => { activeQuiz = null; $('#quiz-runner').hidden = true; clearInterval(quizTimer); };
  }

  function formatMMSS(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  function submitQuiz() {
    if (!activeQuiz) return;
    const { section, quiz } = activeQuiz;
    clearInterval(quizTimer);

    let percent = 0;
    let details = {};

    if (quiz.writing) {
      const answers = $$('#quiz-questions textarea').map(t => t.value.trim());
      details = { task1: answers[0] || '', task2: answers[1] || '' };
      percent = answers.reduce((acc, v) => acc + Math.min(100, Math.floor(v.length / 10)), 0) / (answers.length || 1);
    } else if (quiz.speaking) {
      details = { spoke: true };
      percent = 60; // placeholder
    } else {
      const selections = quiz.questions.map((item, idx) => {
        const checked = document.querySelector(`input[name="q_${idx}"]:checked`);
        return checked ? Number(checked.value) : -1;
      });
      const correct = selections.filter((v, i) => v === quiz.questions[i].a).length;
      percent = Math.round((correct / quiz.questions.length) * 100);

      // mark correctness visually
      quiz.questions.forEach((item, idx) => {
        const opts = Array.from(document.querySelectorAll(`input[name="q_${idx}"]`));
        opts.forEach((input, i) => {
          const label = input.closest('.option');
          label.classList.remove('correct', 'incorrect');
          if (i === item.a) label.classList.add('correct');
          if (input.checked && i !== item.a) label.classList.add('incorrect');
        });
      });
    }

    // Save history
    const user = getCurrentUser();
    user.history[section] = user.history[section] || [];
    user.history[section].push({ type: 'quiz', percent, band: percentToBand(percent), at: Date.now(), details });
    saveUser(user);

    showToast(`${section} score: ${percent}% (Band ${percentToBand(percent)})`);
    $('#quiz-runner').hidden = true;
    activeQuiz = null;
    renderDashboard();
  }

  // --------- Mock Tests (per Stage) ---------
  let activeMock = null; let mockTimer = null; let mockRemaining = 0;

  function renderMockTests() {
    const user = getCurrentUser();
    const wrap = $('#stages-list');
    wrap.innerHTML = '';
    STAGES.forEach(st => {
      const unlocked = !!user.unlockedStages[st.id];
      const card = document.createElement('div');
      card.className = 'card stage';
      card.innerHTML = `
        <h3>${st.name}</h3>
        <div class="small" style="color:var(--muted)">Includes: Listening, Reading, Writing, Speaking</div>
        <div class="stage-actions">
          ${unlocked
            ? `<button class="btn btn-primary" data-start-mock="${st.id}">Start Mock</button>`
            : `<span class="price">Rp ${st.priceIdr.toLocaleString('id-ID')}</span>
               <button class="btn btn-primary" data-buy="${st.id}">Buy Stage</button>`}
        </div>`;
      wrap.appendChild(card);
    });

    wrap.querySelectorAll('button[data-buy]').forEach(btn => btn.addEventListener('click', () => openPaymentModal(btn.getAttribute('data-buy'))));
    wrap.querySelectorAll('button[data-start-mock]').forEach(btn => btn.addEventListener('click', () => startMock(btn.getAttribute('data-start-mock'))));
  }

  function startMock(stageId) {
    activeMock = { stageId, step: 0 };
    const content = $('#mock-content');
    content.innerHTML = '';

    // Listening (5), Reading (5), Writing (2 prompts)
    const listening = (QUIZ_BANK.Listening[0] || {}).questions || [];
    const reading = (QUIZ_BANK.Reading[0] || {}).questions || [];
    const writingPrompts = (QUIZ_BANK.Writing[0] || {}).prompts || [];

    // Build content
    const blockL = document.createElement('div');
    blockL.className = 'quiz-question';
    blockL.innerHTML = `<div style="font-weight:700; margin-bottom:6px">Listening</div>` + listening.slice(0,5).map((item, idx) => `
      <div style="margin-top:6px">Q${idx+1}. ${item.q}</div>
      ${item.options.map((opt, i) => `<label class="option"><input type="radio" name="L_${idx}" value="${i}"><span>${opt}</span></label>`).join('')}
    `).join('');

    const blockR = document.createElement('div');
    blockR.className = 'quiz-question';
    blockR.innerHTML = `<div style="font-weight:700; margin-bottom:6px">Reading</div>` + reading.slice(0,5).map((item, idx) => `
      <div style="margin-top:6px">Q${idx+1}. ${item.q}</div>
      ${item.options.map((opt, i) => `<label class="option"><input type="radio" name="R_${idx}" value="${i}"><span>${opt}</span></label>`).join('')}
    `).join('');

    const blockW = document.createElement('div');
    blockW.className = 'quiz-question';
    blockW.innerHTML = `<div style="font-weight:700; margin-bottom:6px">Writing</div>
      <div style="margin-top:6px">${writingPrompts[0] || 'Task 1 prompt unavailable.'}</div>
      <textarea id="mock-w1" rows="5" placeholder="Task 1 response..."></textarea>
      <div style="margin-top:6px">${writingPrompts[1] || 'Task 2 prompt unavailable.'}</div>
      <textarea id="mock-w2" rows="8" placeholder="Task 2 response..."></textarea>`;

    const blockS = document.createElement('div');
    blockS.className = 'quiz-question';
    blockS.innerHTML = `<div style="font-weight:700; margin-bottom:6px">Speaking</div>
      <div>Describe a memorable journey you had. Speak for 1-2 minutes.</div>
      <div class="hint">Recording is not included; practice speaking aloud.</div>`;

    content.appendChild(blockL);
    content.appendChild(blockR);
    content.appendChild(blockW);
    content.appendChild(blockS);

    $('#mock-title-run').textContent = `Mock Test - ${stageId.toUpperCase()}`;
    $('#mock-runner').hidden = false;

    mockRemaining = 25 * 60; // 25 minutes demo
    $('#mock-timer').textContent = formatMMSS(mockRemaining);
    clearInterval(mockTimer);
    mockTimer = setInterval(() => {
      mockRemaining -= 1;
      $('#mock-timer').textContent = formatMMSS(Math.max(0, mockRemaining));
      if (mockRemaining <= 0) { clearInterval(mockTimer); submitMock(); }
    }, 1000);

    $('#submit-mock').onclick = submitMock;
    $('#cancel-mock').onclick = () => { clearInterval(mockTimer); $('#mock-runner').hidden = true; activeMock = null; };
  }

  function submitMock() {
    if (!activeMock) return;
    clearInterval(mockTimer);

    // Score L and R
    const listening = (QUIZ_BANK.Listening[0] || {}).questions || [];
    const reading = (QUIZ_BANK.Reading[0] || {}).questions || [];
    const selL = listening.slice(0,5).map((it, idx) => {
      const c = document.querySelector(`input[name="L_${idx}"]:checked`);
      return c ? Number(c.value) : -1;
    });
    const selR = reading.slice(0,5).map((it, idx) => {
      const c = document.querySelector(`input[name="R_${idx}"]:checked`);
      return c ? Number(c.value) : -1;
    });
    const correctL = selL.filter((v,i)=> v === listening[i].a).length;
    const correctR = selR.filter((v,i)=> v === reading[i].a).length;
    const percentL = Math.round((correctL / Math.min(5, listening.length)) * 100);
    const percentR = Math.round((correctR / Math.min(5, reading.length)) * 100);

    // Writing submit only stored
    const w1 = $('#mock-w1').value.trim();
    const w2 = $('#mock-w2').value.trim();

    const user = getCurrentUser();
    user.history.Listening.push({ type: 'mock', percent: percentL, band: percentToBand(percentL), at: Date.now(), stage: activeMock.stageId });
    user.history.Reading.push({ type: 'mock', percent: percentR, band: percentToBand(percentR), at: Date.now(), stage: activeMock.stageId });
    user.history.Writing.push({ type: 'mock', percent: Math.min(100, Math.floor((w1.length + w2.length) / 20)), band: percentToBand(Math.min(100, Math.floor((w1.length + w2.length) / 20))), at: Date.now(), stage: activeMock.stageId, details: { w1, w2 } });
    user.history.Speaking.push({ type: 'mock', percent: 60, band: percentToBand(60), at: Date.now(), stage: activeMock.stageId });
    saveUser(user);

    showToast(`Mock submitted. L ${percentL}%, R ${percentR}%`);
    $('#mock-runner').hidden = true;
    activeMock = null;
    renderDashboard();
  }

  // --------- Subscription & Payment (Simulated QRIS) ---------
  function renderSubscription() {
    const user = getCurrentUser();
    const wrap = $('#subscription-stages');
    wrap.innerHTML = '';
    STAGES.forEach(st => {
      const unlocked = !!user.unlockedStages[st.id];
      const el = document.createElement('div');
      el.className = 'card stage';
      el.innerHTML = `
        <h3>${st.name}</h3>
        <div class="small" style="color:var(--muted)">One-time access to all four tests</div>
        <div class="stage-actions">
          ${unlocked ? `<span class="price">Unlocked</span>` : `<span class="price">Rp ${st.priceIdr.toLocaleString('id-ID')}</span>`}
          ${unlocked ? `<button class="btn btn-secondary" disabled>Purchased</button>` : `<button class="btn btn-primary" data-buy="${st.id}">Buy with QRIS</button>`}
        </div>`;
      wrap.appendChild(el);
    });

    wrap.querySelectorAll('button[data-buy]').forEach(btn => btn.addEventListener('click', () => openPaymentModal(btn.getAttribute('data-buy'))));
  }

  function openPaymentModal(stageId) {
    const user = getCurrentUser();
    const token = 'tok_' + Math.random().toString(36).slice(2);
    // Simulate backend transaction creation
    user.payments.transactions.push({ token, stageId, status: 'pending', createdAt: Date.now() });
    saveUser(user);

    const qrData = `AMBISIUS-BELAJAR|${stageId}|${token}|IDR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

    const body = $('#payment-body');
    body.innerHTML = `
      <div class="payment-qr"><img src="${qrUrl}" alt="QRIS code"/></div>
      <div>Scan with your banking/e-wallet app.</div>
      <div class="payment-token">Token: ${token}</div>
      <div class="hint">This is a simulation. After paying, click "I have paid" to complete.</div>
    `;

    $('#payment-modal').hidden = false;

    // Start polling (simulated: check if transaction status changed to 'paid')
    startPaymentPolling(token);

    $('#payment-paid').onclick = () => {
      // Simulate backend confirmation
      const u = getCurrentUser();
      const tx = (u.payments.transactions || []).find(t => t.token === token);
      if (tx) { tx.status = 'paid'; tx.paidAt = Date.now(); saveUser(u); }
    };
    $('#payment-cancel').onclick = () => { $('#payment-modal').hidden = true; stopPaymentPolling(); };
  }

  let pollingInterval = null; let pollingToken = null;
  function startPaymentPolling(token) {
    pollingToken = token;
    clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
      const u = getCurrentUser();
      const tx = (u.payments.transactions || []).find(t => t.token === token);
      if (tx && tx.status === 'paid') {
        clearInterval(pollingInterval);
        $('#payment-modal').hidden = true;
        // Unlock stage
        u.unlockedStages[tx.stageId] = true;
        saveUser(u);
        showToast('Payment successful. Stage unlocked!');
        renderSubscription();
        renderMockTests();
      }
      // else keep polling
    }, 1500);
  }
  function stopPaymentPolling() { clearInterval(pollingInterval); pollingInterval = null; pollingToken = null; }

  // --------- Profile ---------
  function renderProfile() {
    const user = getCurrentUser();
    $('#profile-email').value = user.email;
    $('#profile-target').value = user.profile.targetBand;
    $('#profile-test-type').value = user.profile.testType;

    const sub = $('#profile-subscription');
    sub.innerHTML = '';
    STAGES.forEach(st => {
      const li = document.createElement('div');
      const unlocked = !!user.unlockedStages[st.id];
      li.textContent = `${st.name}: ${unlocked ? 'Unlocked' : 'Locked'}`;
      sub.appendChild(li);
    });
  }

  function setupProfileActions() {
    $('#save-profile').addEventListener('click', () => {
      const user = getCurrentUser();
      user.profile.targetBand = Number($('#profile-target').value) || 0;
      user.profile.testType = $('#profile-test-type').value;
      saveUser(user);
      showToast('Profile saved');
      renderDashboard();
    });
    $('#delete-account').addEventListener('click', () => {
      if (!confirm('Delete your account permanently?')) return;
      const id = getCurrentUserId();
      const users = readUsers().filter(u => u.id !== id);
      writeUsers(users);
      setCurrentUserId(null);
      $('#auth-modal').hidden = false;
      showToast('Account deleted');
    });
  }

  // --------- Dashboard ---------
  function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Target & progress
    $('#overview-target').textContent = String(user.profile.targetBand);
    const completed = user.progress.completedResourceIds.length;
    const total = RESOURCE_CATALOG.length;
    const completion = total ? Math.round((completed / total) * 100) : 0;
    $('#overview-progress').style.width = `${completion}%`;

    // Average band (latest entries per skill)
    const latestBands = ['Listening','Reading','Writing','Speaking']
      .map(s => user.history[s]).map(arr => (arr && arr.length ? arr[arr.length-1].band : null))
      .filter(v => v !== null);
    const avgBand = latestBands.length ? (latestBands.reduce((a,b)=>a+b,0) / latestBands.length) : 0;
    $('#overview-avg-band').textContent = avgBand ? avgBand.toFixed(1) : '-';

    // Charts
    const pointsFor = (skill) => {
      const arr = user.history[skill] || [];
      return arr.slice(-10).map(x => x.percent);
    };
    $('#chart-listening').innerHTML = svgLine(pointsFor('Listening'), 360, 120);
    $('#chart-reading').innerHTML = svgLine(pointsFor('Reading'), 360, 120);
    $('#chart-writing').innerHTML = svgLine(pointsFor('Writing'), 360, 120);
    $('#chart-speaking').innerHTML = svgLine(pointsFor('Speaking'), 360, 120);

    // Recent activity
    const activity = $('#recent-activity');
    activity.innerHTML = '';
    const items = ['Listening','Reading','Writing','Speaking']
      .flatMap(s => (user.history[s]||[]).map(h => ({...h, skill: s})))
      .sort((a,b)=>b.at-a.at).slice(0,8);
    items.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.skill} ${it.type} — ${it.percent}% (Band ${it.band}) • ${formatDate(it.at)}`;
      activity.appendChild(li);
    });
  }

  // --------- Initialization ---------
  function initializeUI() {
    const user = getCurrentUser();
    if (!user) {
      $('#auth-modal').hidden = false;
    } else {
      $('#auth-modal').hidden = true;
      navigateTo(location.hash || '#dashboard');
      renderDashboard();
      renderSubscription();
    }
  }

  function boot() {
    setupAuthModal();
    setupNav();
    setupProfileActions();
    initializeUI();

    window.addEventListener('hashchange', () => navigateTo(location.hash));
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
