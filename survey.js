// ============================================================
// 80sGrid Survey System v1.0
// Shows surveys after quiz completion (1st and 2nd quiz of day)
// Tracks completed surveys permanently in localStorage
// ============================================================
(function() {
  'use strict';

  var FORMSPREE_URL = 'https://formspree.io/f/xeelpozw';
  var COMPLETED_KEY = '80sGrid_completedSurveys';

  // ---- Survey Definitions ----
  var SURVEYS = [
    {
      id: 'tribe',
      number: 1,
      title: '\uD83C\uDFB6 WHAT TYPE OF 80s FAN ARE YOU? \uD83C\uDFB6',
      options: [
        { value: 'New Wave', icon: '\uD83C\uDFB9', label: 'NEW WAVE', desc: 'Depeche Mode \u2022 The Cure \u2022 Tears for Fears', pct: 26, color: '#9d4edd', bg: 'linear-gradient(135deg,#6a0dad,#9d4edd)', border: '#b388ff' },
        { value: 'Hair Metal', icon: '\uD83C\uDFB8', label: 'HAIR METAL', desc: 'M\u00F6tley Cr\u00FCe \u2022 Def Leppard \u2022 Bon Jovi', pct: 15, color: '#dc2626', bg: 'linear-gradient(135deg,#b91c1c,#dc2626)', border: '#f87171' },
        { value: 'Pop Royalty', icon: '\uD83D\uDC51', label: 'POP ROYALTY', desc: 'Madonna \u2022 Michael Jackson \u2022 Prince', pct: 28, color: '#FF1493', bg: 'linear-gradient(135deg,#FF1493,#ff69b4)', border: '#ffb6c1' },
        { value: 'Goth Dark Wave', icon: '\u2620\uFE0F', label: 'GOTH / DARK WAVE', desc: 'Siouxsie \u2022 Bauhaus \u2022 The Smiths', pct: 14, color: '#888', bg: 'linear-gradient(135deg,#1a1a1a,#333333)', border: '#666' },
        { value: 'Heartland Rock', icon: '\uD83C\uDDFA\uD83C\uDDF8', label: 'HEARTLAND ROCK', desc: 'Springsteen \u2022 Petty \u2022 Mellencamp', pct: 17, color: '#d97706', bg: 'linear-gradient(135deg,#b45309,#d97706)', border: '#fbbf24' }
      ]
    },
    {
      id: 'prom',
      number: 2,
      title: '\uD83C\uDF93 DID YOU GO TO YOUR PROM? \uD83C\uDF93',
      options: [
        { value: 'married_date', icon: '\uD83D\uDC8D', label: 'YES \u2014 AND I LATER MARRIED MY PROM DATE', desc: '', pct: 8, color: '#FF1493', bg: 'linear-gradient(135deg,#FF1493,#ff69b4)', border: '#ffb6c1' },
        { value: 'blast', icon: '\uD83D\uDD7A', label: 'YES \u2014 HAD AN ABSOLUTE BLAST', desc: '', pct: 44, color: '#9d4edd', bg: 'linear-gradient(135deg,#6a0dad,#9d4edd)', border: '#b388ff' },
        { value: 'hated', icon: '\uD83D\uDE2C', label: 'YES \u2014 HATED EVERY SECOND OF IT', desc: '', pct: 22, color: '#dc2626', bg: 'linear-gradient(135deg,#b91c1c,#dc2626)', border: '#f87171' },
        { value: 'no_comment', icon: '\uD83E\uDD10', label: 'NO\u2026 AND THAT\'S ALL I\'M SAYING ABOUT THAT', desc: '', pct: 26, color: '#888', bg: 'linear-gradient(135deg,#1a1a1a,#333333)', border: '#666' }
      ]
    },
    {
      id: 'mall',
      number: 3,
      title: '\uD83D\uDECD\uFE0F WHAT WAS YOUR FAVORITE MALL STORE? \uD83D\uDECD\uFE0F',
      options: [
        { value: 'esprit', icon: '\uD83D\uDC54', label: 'ESPRIT', desc: 'The colorblock queen of the mall', pct: 18, color: '#FF1493', bg: 'linear-gradient(135deg,#FF1493,#ff69b4)', border: '#ffb6c1' },
        { value: 'the_limited', icon: '\uD83D\uDED2', label: 'THE LIMITED', desc: 'Power suits and shoulder pads', pct: 24, color: '#9d4edd', bg: 'linear-gradient(135deg,#6a0dad,#9d4edd)', border: '#b388ff' },
        { value: 'benetton', icon: '\uD83C\uDF0D', label: 'BENETTON', desc: 'United Colors and bold statements', pct: 15, color: '#d97706', bg: 'linear-gradient(135deg,#b45309,#d97706)', border: '#fbbf24' },
        { value: 'chess_king', icon: '\u265F\uFE0F', label: 'CHESS KING', desc: 'Where the cool guys shopped', pct: 12, color: '#dc2626', bg: 'linear-gradient(135deg,#b91c1c,#dc2626)', border: '#f87171' },
        { value: 'sam_goody', icon: '\uD83C\uDFB5', label: 'SAM GOODY', desc: 'Your cassette tape headquarters', pct: 31, color: '#888', bg: 'linear-gradient(135deg,#1a1a1a,#444)', border: '#777' }
      ]
    },
    {
      id: 'sats',
      number: 4,
      title: '\uD83D\uDCDD WHAT DID YOU GET ON YOUR SATs? \uD83D\uDCDD',
      options: [
        { value: 'over_1400', icon: '\uD83C\uDF93', label: 'OVER 1400 \u2014 CRUSHED IT', desc: '', pct: 14, color: '#FFD700', bg: 'linear-gradient(135deg,#b8860b,#FFD700)', border: '#FFD700' },
        { value: '1000_1399', icon: '\uD83D\uDCDA', label: '1000\u20131399 \u2014 SOLID', desc: '', pct: 38, color: '#9d4edd', bg: 'linear-gradient(135deg,#6a0dad,#9d4edd)', border: '#b388ff' },
        { value: '800_999', icon: '\uD83D\uDE05', label: '800\u2013999 \u2014 GOT INTO COLLEGE ANYWAY', desc: '', pct: 29, color: '#FF1493', bg: 'linear-gradient(135deg,#FF1493,#ff69b4)', border: '#ffb6c1' },
        { value: 'mr_hand', icon: '\uD83C\uDFC4', label: 'ASK MR. HAND\u2026', desc: 'Fast Times reference \u2014 you know who you are', pct: 19, color: '#dc2626', bg: 'linear-gradient(135deg,#b91c1c,#dc2626)', border: '#f87171' }
      ]
    },
    {
      id: 'coffee',
      number: 5,
      title: '\u2615 COFFEE WITH ONE PERSON \u2014 WHO? \u2615',
      options: [
        { value: 'prince', icon: '\uD83C\uDF86', label: 'PRINCE', desc: 'If he\'d even show up', pct: 32, color: '#9d4edd', bg: 'linear-gradient(135deg,#6a0dad,#9d4edd)', border: '#b388ff' },
        { value: 'madonna', icon: '\uD83D\uDC84', label: 'MADONNA', desc: 'She\'d do all the talking', pct: 27, color: '#FF1493', bg: 'linear-gradient(135deg,#FF1493,#ff69b4)', border: '#ffb6c1' },
        { value: 'bono', icon: '\uD83C\uDF0D', label: 'BONO', desc: 'Bring earplugs', pct: 11, color: '#dc2626', bg: 'linear-gradient(135deg,#b91c1c,#dc2626)', border: '#f87171' },
        { value: 'sade', icon: '\uD83C\uDF39', label: 'SAD\u00C9', desc: 'The most mysterious conversation you\'d ever have', pct: 30, color: '#d97706', bg: 'linear-gradient(135deg,#b45309,#d97706)', border: '#fbbf24' }
      ]
    }
  ];

  // ---- Inject CSS ----
  var style = document.createElement('style');
  style.textContent = [
    '#surveyContainer .sv-wrap { background:linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding:25px 18px; border-radius:12px; margin-top:10px; }',
    '#surveyContainer .sv-title { font-family:"Arial Black",sans-serif; letter-spacing:3px; font-size:1.1em; text-shadow:0 0 20px rgba(255,20,147,0.5); margin-bottom:14px; color:#fff; text-align:center; }',
    '#surveyContainer .sv-counter { text-align:center; color:#00ffff; font-size:0.75em; letter-spacing:2px; margin-bottom:12px; font-family:"Courier New",monospace; }',
    '#surveyContainer .sv-options { display:flex; flex-direction:column; gap:8px; }',
    '#surveyContainer .sv-card { padding:12px 14px; display:flex; align-items:center; gap:12px; text-align:left; border-radius:10px; cursor:pointer; transition:all 0.25s; color:#fff; }',
    '#surveyContainer .sv-card:hover { transform:scale(1.02); filter:brightness(1.15); }',
    '#surveyContainer .sv-card.sv-voted { cursor:default; }',
    '#surveyContainer .sv-card.sv-voted:hover { transform:none; filter:none; }',
    '#surveyContainer .sv-card.sv-selected { box-shadow:0 0 25px rgba(0,255,0,0.6), inset 0 0 15px rgba(0,255,0,0.1); border-color:#00ff00 !important; transform:scale(1.03); }',
    '#surveyContainer .sv-card.sv-dimmed { opacity:0.65; }',
    '#surveyContainer .sv-icon { min-width:40px; height:40px; background:rgba(0,0,0,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.4em; }',
    '#surveyContainer .sv-body { flex:1; }',
    '#surveyContainer .sv-label { font-size:0.95em; font-weight:900; letter-spacing:1px; }',
    '#surveyContainer .sv-desc { font-size:0.72em; font-weight:normal; opacity:0.85; margin-top:2px; }',
    '#surveyContainer .sv-bar { display:none; margin-top:6px; background:rgba(0,0,0,0.3); border-radius:4px; height:8px; overflow:hidden; }',
    '#surveyContainer .sv-fill { height:100%; border-radius:4px; width:0%; transition:width 0.8s ease; }',
    '#surveyContainer .sv-pct { display:none; font-size:1.1em; font-weight:900; min-width:42px; text-align:right; text-shadow:0 0 10px rgba(0,0,0,0.5); }'
  ].join('\n');
  document.head.appendChild(style);

  // ---- Helpers ----
  function getCompletedSurveys() {
    try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]'); } catch(e) { return []; }
  }

  function markSurveyCompleted(surveyId) {
    var completed = getCompletedSurveys();
    if (completed.indexOf(surveyId) === -1) {
      completed.push(surveyId);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    }
  }

  function getNextUnseenSurvey() {
    var completed = getCompletedSurveys();
    for (var i = 0; i < SURVEYS.length; i++) {
      if (completed.indexOf(SURVEYS[i].id) === -1) return SURVEYS[i];
    }
    return null;
  }

  function getQuizzesPlayedToday() {
    var key = 'quizzesPlayed_' + new Date().toISOString().slice(0,10);
    return parseInt(localStorage.getItem(key) || '0');
  }

  // ---- Render ----
  function renderSurvey(survey, container) {
    var totalSurveys = SURVEYS.length;
    var completedCount = getCompletedSurveys().length;
    var html = '<div class="sv-wrap">';
    html += '<div class="sv-counter">SURVEY ' + survey.number + ' OF ' + totalSurveys + '</div>';
    html += '<div class="sv-title">' + survey.title + '</div>';
    html += '<div class="sv-options" id="svOptions">';

    for (var i = 0; i < survey.options.length; i++) {
      var o = survey.options[i];
      var iconBorder = o.border ? 'border:2px solid ' + hexToRgba(o.border, 0.5) + ';' : '';
      html += '<div class="sv-card" data-value="' + o.value + '" data-pct="' + o.pct + '" data-color="' + o.color + '" ';
      html += 'style="background:' + o.bg + '; border:2px solid ' + o.border + ';">';
      html += '<div class="sv-icon" style="' + iconBorder + '">' + o.icon + '</div>';
      html += '<div class="sv-body">';
      html += '<div class="sv-label">' + o.label + '</div>';
      if (o.desc) html += '<div class="sv-desc">' + o.desc + '</div>';
      html += '<div class="sv-bar"><div class="sv-fill"></div></div>';
      html += '</div>';
      html += '<div class="sv-pct"></div>';
      html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;

    // Attach click handlers
    var cards = container.querySelectorAll('.sv-card');
    for (var j = 0; j < cards.length; j++) {
      (function(card) {
        card.addEventListener('click', function() {
          if (container.querySelector('.sv-voted')) return;
          handleSurveySelection(survey, card.dataset.value, container);
        });
      })(cards[j]);
    }
  }

  function handleSurveySelection(survey, choice, container) {
    // Mark all cards as voted
    var cards = container.querySelectorAll('.sv-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      card.classList.add('sv-voted');
      var val = card.dataset.value;
      var pct = parseInt(card.dataset.pct);
      var color = card.dataset.color;
      var isSelected = (val === choice);

      // Hide description, show bar
      var descEl = card.querySelector('.sv-desc');
      if (descEl) descEl.style.display = 'none';
      var barEl = card.querySelector('.sv-bar');
      barEl.style.display = 'block';
      var fillEl = card.querySelector('.sv-fill');
      fillEl.style.background = isSelected ? 'linear-gradient(135deg,' + color + ',#fff)' : color;
      if (isSelected) fillEl.style.boxShadow = '0 0 10px ' + color;
      setTimeout((function(f, p) { return function() { f.style.width = p + '%'; }; })(fillEl, pct), 50);

      // Show percentage
      var pctEl = card.querySelector('.sv-pct');
      pctEl.style.display = 'block';
      pctEl.textContent = pct + '%';

      if (isSelected) {
        card.classList.add('sv-selected');
        card.querySelector('.sv-label').textContent += ' \u2713';
      } else {
        card.classList.add('sv-dimmed');
      }
    }

    // Mark completed permanently
    markSurveyCompleted(survey.id);

    // Also store tribe choice for backward compatibility
    if (survey.id === 'tribe') {
      localStorage.setItem('80sGrid_fanType', choice);
    }

    // Submit to Formspree
    try {
      var quizNum = window.QUIZ_NUM || 1;
      fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          type: 'survey',
          survey_id: survey.id,
          survey_number: survey.number,
          survey_title: survey.title,
          choice: choice,
          quiz: 'Quiz ' + quizNum,
          date: new Date().toISOString()
        })
      });
    } catch(e) {}
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2),16);
    var g = parseInt(hex.substring(2,4),16);
    var b = parseInt(hex.substring(4,6),16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ---- Main Entry Point ----
  // Called by each quiz page after incrementQuizzesPlayedToday()
  window.showSurveyIfNeeded = function() {
    var container = document.getElementById('surveyContainer');
    if (!container) return;

    var quizzesToday = getQuizzesPlayedToday();

    // Only show survey after 1st or 2nd quiz of the day (not bonus/3rd)
    if (quizzesToday > 2) return;

    var survey = getNextUnseenSurvey();
    if (!survey) return;

    renderSurvey(survey, container);
  };

})();
