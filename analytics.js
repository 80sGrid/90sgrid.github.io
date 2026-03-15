// ═══════════════════════════════════════════════════════════════════════════════
// 80sGrid.com — Google Analytics 4 In-Depth Tracking
// Measurement ID: G-FE9N3JWSGN
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GA4 INITIALIZATION ──────────────────────────────────────────────────────
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FE9N3JWSGN', {
  send_page_view: true
});

// ─── PERSISTENT USER ID FOR COHORT ANALYSIS ────────────────────────────────
(function() {
  var uid = localStorage.getItem('80sGrid_uid');
  if (!uid) {
    uid = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('80sGrid_uid', uid);
  }
  gtag('config', 'G-FE9N3JWSGN', { user_id: uid, send_page_view: false });
})();

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

function getQuizNumber() {
  var path = window.location.pathname;
  if (path.includes('answers')) return 'answers';
  var match = path.match(/quiz(\d+)/);
  if (match) return parseInt(match[1]);
  // index.html = Quiz 1
  if (path === '/' || path.endsWith('/') || path.includes('index')) return 1;
  return 'unknown';
}

function getPageType() {
  var q = getQuizNumber();
  return q === 'answers' ? 'answer_key' : 'quiz';
}

function getQuizUrl(quizNum) {
  if (quizNum === 1) return 'https://80sgrid.com/';
  if (quizNum === 'answers') return 'https://80sgrid.com/answers.html';
  return 'https://80sgrid.com/quiz' + quizNum + '.html';
}

// ─── PAGE-LEVEL TRACKING ─────────────────────────────────────────────────────
(function() {
  var quizNum = getQuizNumber();
  var pageType = getPageType();
  var sessionStart = Date.now();
  var firstCellClicked = false;
  var quizStartTime = null;
  var maxScrollDepth = 0;
  var scrollMilestones = {};

  // Set persistent user properties
  gtag('set', 'user_properties', {
    site_version: '1.0',
    page_type: pageType
  });

  // Enhanced page view with quiz context
  trackEvent('page_view_enhanced', {
    quiz_number: quizNum,
    page_type: pageType,
    referrer: document.referrer,
    referrer_domain: document.referrer ? new URL(document.referrer).hostname : 'direct',
    landing_page: !document.referrer || !document.referrer.includes('80sgrid')
  });

  // Track if this is a new vs returning visitor
  var visitCount = parseInt(localStorage.getItem('80sGrid_visitCount') || '0') + 1;
  localStorage.setItem('80sGrid_visitCount', visitCount);
  var firstVisitDate = localStorage.getItem('80sGrid_firstVisit');
  if (!firstVisitDate) {
    firstVisitDate = new Date().toISOString();
    localStorage.setItem('80sGrid_firstVisit', firstVisitDate);
  }
  trackEvent('visitor_profile', {
    visit_count: visitCount,
    visitor_type: visitCount === 1 ? 'new' : 'returning',
    days_since_first_visit: Math.floor((Date.now() - new Date(firstVisitDate).getTime()) / 86400000),
    total_quizzes_played: parseInt(localStorage.getItem('totalQuizzesPlayed') || '0'),
    best_score: parseInt(localStorage.getItem('bestQuizScore') || '0'),
    play_streak: parseInt(localStorage.getItem('playStreak') || '0')
  });

  // ─── SCROLL DEPTH TRACKING ───────────────────────────────────────────────
  window.addEventListener('scroll', function() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((window.scrollY / docHeight) * 100);
    if (pct > maxScrollDepth) {
      maxScrollDepth = pct;
      [25, 50, 75, 90, 100].forEach(function(milestone) {
        if (pct >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          trackEvent('scroll_depth', {
            quiz_number: quizNum,
            depth_percent: milestone,
            engagement_time_msec: Date.now() - sessionStart
          });
        }
      });
    }
  });

  // ─── TIME ON PAGE (beacon on unload) ─────────────────────────────────────
  var sessionEndSent = false;
  function sendTimeOnPage() {
    if (sessionEndSent) return;
    sessionEndSent = true;
    var elapsed = Math.round((Date.now() - sessionStart) / 1000);
    var quizTime = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : null;
    var data = {
      quiz_number: quizNum,
      total_seconds: elapsed,
      max_scroll_depth: maxScrollDepth,
      started_quiz: firstCellClicked,
      engagement_time_msec: elapsed * 1000
    };
    if (quizTime !== null) data.quiz_seconds = quizTime;
    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon && window.gtag) {
      trackEvent('session_end', data);
    }
  }
  window.addEventListener('pagehide', sendTimeOnPage);
  window.addEventListener('beforeunload', sendTimeOnPage);

  // ─── DOM-READY: MONKEY-PATCH & EVENT DELEGATION ──────────────────────────
  document.addEventListener('DOMContentLoaded', function() {

    // --- Track first cell click as quiz_start ---
    document.querySelectorAll('.cell').forEach(function(cell) {
      cell.addEventListener('click', function() {
        var pos = cell.dataset.row + '-' + cell.dataset.col;
        var engagementMs = Date.now() - sessionStart;
        if (!firstCellClicked) {
          firstCellClicked = true;
          quizStartTime = Date.now();
          trackEvent('quiz_start', {
            quiz_number: quizNum,
            first_cell: pos,
            engagement_time_msec: engagementMs
          });
        }
        trackEvent('cell_click', {
          quiz_number: quizNum,
          cell_position: pos,
          engagement_time_msec: engagementMs
        });
      });
    });

    // --- Track navigation bar clicks ---
    document.querySelectorAll('.page-nav a, a.page-link, .next-quiz-btn').forEach(function(link) {
      link.addEventListener('click', function() {
        trackEvent('navigation_click', {
          from_quiz: quizNum,
          destination: this.getAttribute('href'),
          link_text: this.textContent.trim().substring(0, 50)
        });
      });
    });

    // --- Track outbound link clicks (with dedicated sponsor tracking) ---
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
      if (!link.href.includes('80sgrid')) {
        link.addEventListener('click', function() {
          var url = this.href;
          var isSponsor = url.includes('arrivealivepodcast');
          trackEvent('outbound_click', {
            quiz_number: quizNum,
            url: url,
            link_text: this.textContent.trim().substring(0, 50),
            link_type: isSponsor ? 'sponsor' : 'external'
          });
          // Dedicated sponsor conversion event for ROI measurement
          if (isSponsor) {
            trackEvent('sponsor_click', {
              quiz_number: quizNum,
              sponsor_name: 'arrive_alive_podcast',
              sponsor_url: url,
              user_completed_quiz: document.getElementById('results') && document.getElementById('results').style.display !== 'none',
              user_score: document.getElementById('score') ? document.getElementById('score').textContent : ''
            });
          }
        });
      }
    });

    // --- Quiz progression funnel (cross-quiz journey tracking) ---
    (function() {
      var completedQuizzes = [];
      var quizScores = {};
      for (var i = 1; i <= 10; i++) {
        var score = parseInt(localStorage.getItem('quiz' + i + 'Score') || '0');
        if (score > 0) {
          completedQuizzes.push(i);
          quizScores['quiz_' + i + '_score'] = score;
        }
      }
      var farthestQuiz = completedQuizzes.length > 0 ? Math.max.apply(null, completedQuizzes) : 0;
      trackEvent('quiz_progression', {
        quiz_number: quizNum,
        quizzes_completed: completedQuizzes.length,
        completed_list: completedQuizzes.join(','),
        farthest_quiz: farthestQuiz,
        is_sequential: completedQuizzes.length === farthestQuiz,
        dropped_off_at: farthestQuiz > 0 && farthestQuiz < 10 ? farthestQuiz + 1 : null,
        completion_rate: Math.round((completedQuizzes.length / 10) * 100)
      });
      // Fire a funnel step event so GA4 can build a proper funnel
      if (typeof quizNum === 'number' && quizNum >= 1 && quizNum <= 10) {
        trackEvent('quiz_funnel_step', {
          quiz_number: quizNum,
          step_name: 'quiz_' + quizNum + '_viewed',
          quizzes_completed_before: completedQuizzes.filter(function(q) { return q < quizNum; }).length
        });
      }
    })();

    // --- Monkey-patch: checkAnswers ---
    if (typeof window.checkAnswers === 'function') {
      var origCheckAnswers = window.checkAnswers;
      // Track which cells were answered via lifeline (multiple choice)
      var mcCells = {};
      var origSelectMCOption = window.selectMCOption;
      if (typeof origSelectMCOption === 'function') {
        window.selectMCOption = function(value) {
          if (typeof currentCell !== 'undefined' && currentCell) {
            mcCells[currentCell.dataset.row + '-' + currentCell.dataset.col] = true;
          }
          return origSelectMCOption.apply(this, arguments);
        };
      }

      window.checkAnswers = function() {
        // Snapshot filled cells before checkAnswers runs (it may return early)
        var filledCount = 0;
        document.querySelectorAll('.cell').forEach(function(cell) {
          var input = cell.querySelector('input');
          if (input && input.value.trim()) filledCount++;
        });

        origCheckAnswers.apply(this, arguments);

        // Detect empty submission (checkAnswers returned early, no score written)
        if (filledCount === 0) {
          trackEvent('quiz_submit_empty', {
            quiz_number: quizNum,
            engagement_time_msec: Date.now() - sessionStart
          });
          return;
        }

        // After checkAnswers runs, read the score from the DOM
        var scoreEl = document.getElementById('score');
        if (scoreEl && scoreEl.textContent) {
          var match = scoreEl.textContent.match(/(\d+)\s*out\s*of\s*(\d+)/);
          if (match) {
            var correct = parseInt(match[1]);
            var total = parseInt(match[2]);
            var lifelinesUsed = 3 - (typeof lifelinesRemaining !== 'undefined' ? lifelinesRemaining : 3);
            var timeToComplete = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : null;

            // Count cells answered via typed text vs multiple choice
            var cellsMC = 0;
            var cellsTyped = 0;
            document.querySelectorAll('.cell').forEach(function(cell) {
              var input = cell.querySelector('input');
              if (input && input.value.trim()) {
                var key = cell.dataset.row + '-' + cell.dataset.col;
                if (mcCells[key]) { cellsMC++; } else { cellsTyped++; }
              }
            });

            trackEvent('quiz_complete', {
              quiz_number: quizNum,
              score: correct,
              total_answered: total,
              score_percent: Math.round((correct / 9) * 100),
              perfect_score: correct === 9,
              lifelines_used: lifelinesUsed,
              no_lifelines: lifelinesUsed === 0,
              cells_typed: cellsTyped,
              cells_mc: cellsMC,
              time_to_complete_seconds: timeToComplete,
              engagement_time_msec: Date.now() - sessionStart
            });

            // Track individual answer results for deeper analysis
            document.querySelectorAll('.cell').forEach(function(cell) {
              var isCorrect = cell.classList.contains('correct');
              var isIncorrect = cell.classList.contains('incorrect');
              if (isCorrect || isIncorrect) {
                trackEvent('answer_result', {
                  quiz_number: quizNum,
                  cell_position: cell.dataset.row + '-' + cell.dataset.col,
                  correct: isCorrect
                });
              }
            });

            // Track high score qualification
            if (correct >= 8 && total === 9) {
              trackEvent('high_score_qualified', {
                quiz_number: quizNum,
                score: correct
              });
            }
          }
        }

        // Check if daily limit was hit
        var limitModal = document.getElementById('limitModal');
        if (limitModal && limitModal.classList.contains('show')) {
          trackEvent('daily_limit_reached', {
            quiz_number: quizNum
          });
        }
      };
    }

    // --- Override: shareScore (replaces original with score + UTM tracking) ---
    if (typeof window.shareScore === 'function') {
      window.shareScore = function() {
        var method = navigator.share ? 'native_share' : 'clipboard';
        var resultsVisible = document.getElementById('results') && document.getElementById('results').style.display !== 'none';
        var scoreEl = document.getElementById('score');
        var scoreMatch = scoreEl && scoreEl.textContent ? scoreEl.textContent.match(/(\d+)\s*out\s*of\s*(\d+)/) : null;
        var shareUrl = getQuizUrl(quizNum) + '?utm_source=share&utm_medium=' + method + '&utm_campaign=quiz' + quizNum;
        var shareText;
        if (resultsVisible && scoreMatch) {
          shareText = 'I scored ' + scoreMatch[1] + '/' + scoreMatch[2] + ' on Len\'s 80sGrid Quiz ' + quizNum + '! Can you beat me? ' + shareUrl;
        } else {
          shareText = 'Test your 80s music knowledge on Len\'s 80sGrid! ' + shareUrl;
        }

        trackEvent('share_click', {
          quiz_number: quizNum,
          share_method: method,
          has_score: !!scoreMatch,
          engagement_time_msec: Date.now() - sessionStart
        });
        var shareCount = parseInt(localStorage.getItem('80sGrid_shareCount') || '0') + 1;
        localStorage.setItem('80sGrid_shareCount', shareCount);
        trackEvent('viral_share', {
          quiz_number: quizNum,
          share_method: method,
          total_shares_by_user: shareCount,
          share_context: resultsVisible ? 'after_quiz' : 'before_quiz'
        });

        if (navigator.share) {
          navigator.share({ title: "Len's 80sGrid.com Music Edition", text: shareText }).catch(function() {});
        } else {
          navigator.clipboard.writeText(shareText).then(function() {
            alert('Link copied! Share it with your friends!');
          }).catch(function() { alert(shareText); });
        }
      };
    }

    // --- Monkey-patch: showMultipleChoice ---
    if (typeof window.showMultipleChoice === 'function') {
      var origShowMC = window.showMultipleChoice;
      window.showMultipleChoice = function() {
        var remaining = typeof lifelinesRemaining !== 'undefined' ? lifelinesRemaining : '?';
        if (remaining > 0) {
          trackEvent('lifeline_used', {
            quiz_number: quizNum,
            lifelines_remaining_before: remaining,
            cell_position: (typeof currentCell !== 'undefined' && currentCell) ? currentCell.dataset.row + '-' + currentCell.dataset.col : 'unknown'
          });
        }
        origShowMC.apply(this, arguments);
      };
    }

    // --- Monkey-patch: resetGrid ---
    if (typeof window.resetGrid === 'function') {
      var origResetGrid = window.resetGrid;
      window.resetGrid = function() {
        // Check if they had answers filled in
        var filledCells = document.querySelectorAll('.cell input');
        var filledCount = 0;
        filledCells.forEach(function(input) { if (input.value) filledCount++; });
        trackEvent('grid_reset', {
          quiz_number: quizNum,
          cells_filled_before_reset: filledCount
        });
        origResetGrid.apply(this, arguments);
        // Reset quiz timing
        firstCellClicked = false;
        quizStartTime = null;
      };
    }

    // --- Monkey-patch: toggleStats ---
    if (typeof window.toggleStats === 'function') {
      var origToggleStats = window.toggleStats;
      window.toggleStats = function() {
        origToggleStats.apply(this, arguments);
        var modal = document.getElementById('statsModal');
        if (modal && modal.classList.contains('show')) {
          trackEvent('stats_viewed', {
            quiz_number: quizNum,
            total_played: parseInt(localStorage.getItem('totalQuizzesPlayed') || '0'),
            best_score: parseInt(localStorage.getItem('bestQuizScore') || '0'),
            play_streak: parseInt(localStorage.getItem('playStreak') || '0')
          });
        }
      };
    }

    // --- Monkey-patch: showLeaderboard ---
    if (typeof window.showLeaderboard === 'function') {
      var origShowLeaderboard = window.showLeaderboard;
      window.showLeaderboard = function() {
        trackEvent('leaderboard_viewed', {
          quiz_number: quizNum
        });
        origShowLeaderboard.apply(this, arguments);
      };
    }

    // --- Monkey-patch: saveHighScore ---
    if (typeof window.saveHighScore === 'function') {
      var origSaveHighScore = window.saveHighScore;
      window.saveHighScore = function() {
        var i1 = document.getElementById('initial1').value;
        var i2 = document.getElementById('initial2').value;
        var i3 = document.getElementById('initial3').value;
        if (i1 && i2 && i3) {
          trackEvent('high_score_entry', {
            quiz_number: quizNum,
            initials: (i1 + i2 + i3).toUpperCase()
          });
        }
        origSaveHighScore.apply(this, arguments);
      };
    }

    // --- Track How-to-Play interactions ---
    if (typeof window.openHTP === 'function') {
      var origOpenHTP = window.openHTP;
      window.openHTP = function() {
        trackEvent('how_to_play_opened', { quiz_number: quizNum });
        origOpenHTP.apply(this, arguments);
      };
    }
    if (typeof window.toggleHowToPlay === 'function') {
      var origToggleHTP = window.toggleHowToPlay;
      window.toggleHowToPlay = function() {
        trackEvent('how_to_play_toggled', { quiz_number: quizNum });
        origToggleHTP.apply(this, arguments);
      };
    }

    // --- Track referral source for viral measurement ---
    (function() {
      var ref = document.referrer;
      var params = new URLSearchParams(window.location.search);
      var utm_source = params.get('utm_source');
      var utm_medium = params.get('utm_medium');
      var utm_campaign = params.get('utm_campaign');

      if (utm_source || utm_medium || utm_campaign) {
        trackEvent('campaign_visit', {
          quiz_number: quizNum,
          utm_source: utm_source || '(not set)',
          utm_medium: utm_medium || '(not set)',
          utm_campaign: utm_campaign || '(not set)'
        });
      }

      // K-factor: track when someone arrives via a share link
      if (utm_source === 'share') {
        trackEvent('share_conversion', {
          quiz_number: quizNum,
          share_medium: utm_medium || '(not set)',
          share_campaign: utm_campaign || '(not set)',
          is_new_user: parseInt(localStorage.getItem('80sGrid_visitCount') || '0') <= 1
        });
      }

      // Classify traffic source
      var source = 'direct';
      if (utm_source === 'share') {
        source = 'share';
      } else if (ref) {
        if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('fbclid')) source = 'facebook';
        else if (ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) source = 'twitter_x';
        else if (ref.includes('instagram.com')) source = 'instagram';
        else if (ref.includes('tiktok.com')) source = 'tiktok';
        else if (ref.includes('reddit.com')) source = 'reddit';
        else if (ref.includes('google.com') || ref.includes('google.co')) source = 'google';
        else if (ref.includes('bing.com')) source = 'bing';
        else if (ref.includes('80sgrid')) source = 'internal';
        else source = 'other_referral';
      }
      trackEvent('traffic_source', {
        quiz_number: quizNum,
        source_category: source,
        referrer_full: ref ? ref.substring(0, 200) : 'direct',
        is_viral: source !== 'direct' && source !== 'google' && source !== 'bing' && source !== 'internal'
      });
    })();

    // ─── RETENTION TRACKING ─────────────────────────────────────────────────
    (function() {
      var firstVisit = localStorage.getItem('80sGrid_firstVisit');
      if (!firstVisit) return;
      var daysSince = Math.floor((Date.now() - new Date(firstVisit).getTime()) / 86400000);
      if (daysSince < 1) return;

      // Track today's date to avoid duplicate retention events
      var today = new Date().toISOString().slice(0, 10);
      var lastRetentionDay = localStorage.getItem('80sGrid_lastRetentionDay');
      if (lastRetentionDay === today) return;
      localStorage.setItem('80sGrid_lastRetentionDay', today);

      // Fire retention milestone events
      var milestones = [1, 3, 7, 14, 30, 60, 90];
      var hitMilestones = localStorage.getItem('80sGrid_retentionHit') || '';
      milestones.forEach(function(d) {
        if (daysSince >= d && hitMilestones.indexOf('d' + d) === -1) {
          trackEvent('retention', {
            quiz_number: quizNum,
            retention_day: d,
            days_since_first_visit: daysSince,
            total_quizzes_played: parseInt(localStorage.getItem('totalQuizzesPlayed') || '0'),
            visit_count: parseInt(localStorage.getItem('80sGrid_visitCount') || '0')
          });
          hitMilestones += ',d' + d;
          localStorage.setItem('80sGrid_retentionHit', hitMilestones);
        }
      });

      // Fire a return_visit event every time a returning user comes back
      trackEvent('return_visit', {
        quiz_number: quizNum,
        days_since_first_visit: daysSince,
        days_since_last_visit: Math.floor((Date.now() - parseInt(localStorage.getItem('80sGrid_lastVisitTs') || Date.now())) / 86400000),
        visit_count: parseInt(localStorage.getItem('80sGrid_visitCount') || '0')
      });
      localStorage.setItem('80sGrid_lastVisitTs', Date.now().toString());
    })();

  }); // end DOMContentLoaded
})();
