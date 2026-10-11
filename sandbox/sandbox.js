// Fourth Wish Adoption Desk: a practice CRM with a guided walkthrough.
// The whole screen re-renders from `state` after every action; clicks are
// handled by one delegated listener that reads data-action / data-arg.
(function () {
  'use strict';

  var app = document.getElementById('app');

  function fresh() {
    return {
      screen: 'queue',
      tab: 'app',
      query: '',
      flags: { vet: false, house: false, cat: false },
      decision: null,
      notice: ''
    };
  }

  var state = Object.assign(fresh(), { tour: true, step: 0 });

  function set(patch) {
    Object.assign(state, patch);
    render();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Data ----------

  var CASES = [
    { id: '0417', animal: 'Apollo', kind: 'Lab mix, 3 yrs', applicant: 'Maya Alvarez', submitted: 'Sep 22', status: 'Needs review' },
    { id: '0412', animal: 'Juniper', kind: 'Tabby cat, 1 yr', applicant: 'Dev Patel', submitted: 'Sep 20', status: 'Needs review' },
    { id: '0409', animal: 'Biscuit', kind: 'Corgi mix, 5 yrs', applicant: 'Ellen Whitaker', submitted: 'Sep 18', status: 'In progress' },
    { id: '0405', animal: 'Marmalade', kind: 'Orange cat, 2 yrs', applicant: 'Sam Torres', submitted: 'Sep 17', status: 'In progress' },
    { id: '0401', animal: 'Pickles', kind: 'Holland lop rabbit, 4 yrs', applicant: 'Grace Lin', submitted: 'Sep 15', status: 'Awaiting documents' },
    { id: '0398', animal: 'Waffles', kind: 'Beagle, 7 yrs', applicant: 'Chris Boyd', submitted: 'Sep 14', status: 'Needs review' }
  ];

  var TONE = {
    'Needs review': 'tone-review',
    'In progress': 'tone-progress',
    'Awaiting documents': 'tone-docs',
    'Decision recorded': 'tone-done'
  };

  var ANIMAL_FACTS = [
    ['Species', 'Dog'], ['Breed', 'Lab mix'], ['Age', '3 years'],
    ['Weight', '62 lb'], ['Neutered', 'Yes'], ['In care since', 'Jun 2025']
  ];
  var APPLICANT_FACTS = [
    ['Name', 'Maya Alvarez'], ['City', 'Mesa, AZ'],
    ['Submitted', 'Sep 22'], ['Reviewer', 'You (trainee)']
  ];

  var TABS = [['app', 'Application'], ['vet', 'Vet history'], ['home', 'Home visit'], ['notes', 'Notes']];

  var CHOICES = [['approve', 'Approve'], ['info', 'Request more information'], ['deny', 'Deny']];

  // ---------- Icons ----------

  var ICON = {
    star: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="#F2A33A"/></svg>',
    list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    paw: function (size) {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="10" r="1.6"/><circle cx="12" cy="7" r="1.6"/><circle cx="17" cy="10" r="1.6"/><path d="M8 17c0-2.5 2-4 4-4s4 1.5 4 4c0 1.5-1.5 2-4 2s-4-.5-4-2z"/></svg>';
    },
    person: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>',
    bars: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6770" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>',
    chevron: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    flag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>'
  };

  // ---------- Actions ----------

  var actions = {
    startTour: function () { set(Object.assign(fresh(), { tour: true, step: 1 })); },
    closeTour: function () { set({ tour: false }); },
    goQueue: function () { set({ screen: 'queue', notice: '' }); },
    dismissNotice: function () { set({ notice: '' }); },
    navNotice: function () { set({ notice: "That area isn't part of this walkthrough. Head back to the Queue." }); },
    clearDecision: function () { set({ decision: null }); },
    openCase: function (id) {
      if (id !== '0417') {
        set({ notice: "Only Apollo's case (#0417) is open in this walkthrough." });
        return;
      }
      set({ screen: 'case', tab: 'app', notice: '', step: (state.tour && state.step === 1) ? 2 : state.step });
    },
    pickTab: function (t) {
      var st = state.step;
      if (state.tour && state.step === 2 && t === 'vet') st = 3;
      if (state.tour && state.step === 4 && t === 'home') st = 5;
      set({ tab: t, notice: '', step: st });
    },
    toggleFlag: function (k) {
      var f = Object.assign({}, state.flags);
      f[k] = !f[k];
      var st = state.step;
      if (state.tour && state.step === 3 && k === 'vet' && f.vet) st = 4;
      set({ flags: f, notice: '', step: st });
    },
    decide: function (d) {
      set({ decision: d, notice: '', step: (state.tour && state.step === 5) ? 6 : state.step });
    },
    showMe: function () {
      var c = state;
      if (c.screen === 'queue' && c.step >= 2) {
        set({ screen: 'case', notice: '' });
      } else if (c.step === 1) {
        set({ screen: 'case', tab: 'app', step: 2, notice: '' });
      } else if (c.step === 2) {
        set({ screen: 'case', tab: 'vet', step: 3, notice: '' });
      } else if (c.step === 3) {
        set({ screen: 'case', tab: 'vet', flags: Object.assign({}, c.flags, { vet: true }), step: 4, notice: '' });
      } else if (c.step === 4) {
        set({ screen: 'case', tab: 'home', step: 5, notice: '' });
      }
    }
  };

  // ---------- Views ----------

  function btn(action, arg, cls, inner, extra) {
    return '<button type="button" class="' + cls + '" data-action="' + action + '"' +
      (arg != null ? ' data-arg="' + esc(arg) + '"' : '') + (extra || '') + '>' + inner + '</button>';
  }

  function sideNav() {
    return '<nav class="sidenav" aria-label="Main navigation">' +
      '<div class="logo">' + ICON.star + '<div><strong>Fourth Wish</strong><span>Adoption Desk</span></div></div>' +
      '<div class="navlist">' +
        btn('goQueue', null, 'navbtn current', ICON.list + '<span class="grow">Queue</span><span class="count">6</span>', ' aria-current="page"') +
        btn('navNotice', 'animals', 'navbtn', ICON.paw(18) + 'Animals') +
        btn('navNotice', 'applicants', 'navbtn', ICON.person + 'Applicants') +
        btn('navNotice', 'reports', 'navbtn', ICON.bars + 'Reports') +
      '</div>' +
      '<div class="me"><div class="avatar" aria-hidden="true">TR</div><div><strong>Trainee reviewer</strong><span>Practice account</span></div></div>' +
    '</nav>';
  }

  function topBar() {
    return '<header class="topbar">' +
      '<div class="topbar-left"><span class="practice">Practice environment</span><span class="muted">Nothing here is real. Click anything.</span></div>' +
      '<div class="topbar-right">' +
        btn('startTour', null, 'btn-ghost btn-replay', 'Replay walkthrough') +
        '<a class="btn-ghost" href="../">Back to portfolio</a>' +
      '</div>' +
    '</header>';
  }

  function notice() {
    if (!state.notice) return '';
    return '<div class="notice" role="status"><span>' + esc(state.notice) + '</span>' +
      btn('dismissNotice', null, '', 'Dismiss') + '</div>';
  }

  function queueScreen() {
    var q = state.query.trim().toLowerCase();
    var ringRow = state.tour && state.screen === 'queue' && state.step >= 1 && state.step <= 5;
    var rows = CASES.filter(function (r) {
      return !q || (r.animal + ' ' + r.id + ' ' + r.applicant + ' ' + r.kind).toLowerCase().indexOf(q) !== -1;
    });

    var rowsHtml = rows.map(function (r) {
      var cls = 'qrow' + (r.id === '0417' && ringRow ? ' ring-in' : '');
      return btn('openCase', r.id, cls,
        '<span class="mono muted case-no">#' + r.id + '</span>' +
        '<span class="who"><b>' + esc(r.animal) + '</b><span>' + esc(r.kind) + '</span></span>' +
        '<span class="hide-sm">' + esc(r.applicant) + '</span>' +
        '<span class="hide-sm muted">' + esc(r.submitted) + '</span>' +
        '<span class="pill ' + TONE[r.status] + '">' + esc(r.status) + '</span>');
    }).join('');

    return '<section class="screen" aria-labelledby="queue-title">' +
      '<div><h1 id="queue-title">Adoption queue</h1><p class="sub">Applications waiting on a reviewer.</p></div>' +
      '<div class="stats">' +
        '<div class="card stat"><b>3</b><span>Needs review</span></div>' +
        '<div class="card stat"><b>2</b><span>In progress</span></div>' +
        '<div class="card stat"><b>1</b><span>Awaiting documents</span></div>' +
      '</div>' +
      '<div><label class="search-label" for="queue-search">Search the queue</label>' +
        '<div class="field">' + ICON.search +
          '<input id="queue-search" type="search" value="' + esc(state.query) + '" placeholder="Animal, applicant, or case number" autocomplete="off">' +
        '</div></div>' +
      '<div class="card table">' +
        '<div class="qrow head" aria-hidden="true"><span class="case-no">Case</span><span>Animal</span><span class="hide-sm">Applicant</span><span class="hide-sm">Submitted</span><span>Status</span></div>' +
        rowsHtml +
        (rows.length === 0 ? '<div class="empty">No cases match that search. Try an animal name or a case number.</div>' : '') +
      '</div>' +
    '</section>';
  }

  function facts(title, list) {
    return '<div class="card facts"><h2>' + title + '</h2>' +
      list.map(function (f) { return '<div class="fact"><span>' + f[0] + '</span><span>' + f[1] + '</span></div>'; }).join('') +
    '</div>';
  }

  function frow(k, v, kClass) {
    return '<div class="frow"><span class="' + (kClass || 'k') + '">' + k + '</span><span>' + v + '</span></div>';
  }

  function flagRow(key, label, text, note, wrapClass, ring) {
    var on = state.flags[key];
    return '<div class="' + wrapClass + (on ? ' on' : '') + '">' +
      '<div class="frow"><span class="k">' + label + '</span><span>' + text + '</span>' +
        btn('toggleFlag', key, 'flagbtn' + (ring && !on ? ' ring-out' : ''), ICON.flag + (on ? 'Flagged' : 'Flag'),
          ' aria-pressed="' + on + '"') +
      '</div>' +
      (on ? '<p class="flagnote">' + note + '</p>' : '') +
    '</div>';
  }

  function tabPanel() {
    var t = state.tab;
    var body = '';
    if (t === 'app') {
      body = frow('Residence', 'Owns a single-family home with a fenced yard.') +
        frow('Dog experience', '12 years. Two dogs at home today.') +
        frow('Why Apollo', '&ldquo;Rosie needs a playmate who can keep up. Duke has opinions, but he&rsquo;ll adjust.&rdquo;') +
        frow('Vet reference', 'Desert Paws Veterinary, on file.') +
        flagRow('house', 'Household', '2 dogs (Rosie, 6 &middot; Duke, 9), 1 cat (Moose), 1 bearded dragon (Steve).',
          'Noted. A full household deserves a look, but the home visit shows how the animals are kept apart. Usually not a blocker.',
          'flagwrap', false);
    } else if (t === 'vet') {
      body = frow('Jun 3, 2025', '<strong>Intake exam.</strong> Healthy, 62 lb.', 'mono') +
        frow('Jun 3, 2025', '<strong>Vaccines.</strong> DHPP, rabies, and Bordetella given.', 'mono') +
        frow('Jun 20, 2025', '<strong>Neuter.</strong> Completed, no complications.', 'mono') +
        frow('Jun 20, 2025', '<strong>Heartworm test.</strong> Negative.', 'mono') +
        frow('Jan 22, 2026', '<strong>Recheck.</strong> Mild limp, left rear leg. X-ray ordered.', 'mono') +
        flagRow('vet', 'No entries since', 'Eight months without a record. The X-ray result isn&rsquo;t on file.',
          'Flagged. The next reviewer will see this gap first, and it shows on the case summary.',
          'gapbox', state.tour && state.step === 3);
    } else if (t === 'home') {
      body = frow('Visit', 'Completed Oct 2 by R. Okafor, volunteer.') +
        frow('Recommendation', 'Approve.') +
        frow('Yard', '6 ft privacy fence. Gate latches.') +
        frow('Animal spaces', 'Steve&rsquo;s enclosure is in a spare room. The door closes.') +
        frow('Dogs', 'Rosie and Duke stayed calm at the meet, then sniffed and settled within minutes.') +
        flagRow('cat', 'Cat', 'Moose left the room and didn&rsquo;t come back during the visit.',
          'Noted. Cats often retreat from visitors. Worth a mention, rarely a blocker.',
          'flagwrap', false);
    } else {
      body = frow('Sep 22', 'Application received.', 'mono') +
        frow('Sep 25', 'Phone interview. Applicant was confident and specific about training plans, and said Rosie &ldquo;needs a job.&rdquo;', 'mono') +
        frow('Oct 2', 'Home visit completed.', 'mono') +
        frow('Oct 6', 'Case assigned to you for review.', 'mono');
    }
    return '<div class="panel" role="tabpanel" id="panel-' + t + '" aria-labelledby="tab-' + t + '">' + body + '</div>';
  }

  function outcome() {
    if (!state.decision) return '';
    var vet = state.flags.vet;
    var o;
    if (state.decision === 'info') {
      o = vet
        ? { tone: 'good', title: 'Good call', message: 'Requesting more information is the right move. The home visit is strong, so the only open question is the X-ray ordered in January with no result on file. You flagged it, so the next reviewer knows exactly what to ask for.' }
        : { tone: 'warn', title: 'Right call, one step missing', message: "Requesting more information fits this case. One thing is missing: you haven't flagged the vet gap, so your request has no paper trail. Open Vet history, flag it, and your decision will read as complete." };
    } else if (state.decision === 'approve') {
      o = { tone: 'warn', title: 'Not yet', message: "The application and home visit are strong, but approving now skips a loose end. The last vet record is an X-ray order with no result, eight months old. If Apollo's leg needs care, his adopter should know before he goes home." + (vet ? ' You spotted the gap, which is the hard part. A flag is a reason to pause, not just to note.' : " You also haven't flagged the gap yet.") };
    } else {
      o = { tone: 'bad', title: 'More than this case calls for', message: 'A records gap is a reason to ask questions, not to say no. The applicant has 12 years of dog experience and a recommended home visit, so this looks like a good match with a paperwork hole.' };
    }
    return '<div class="outcome tone-' + o.tone + '" role="status">' +
      '<div class="title">' + esc(o.title) + '</div>' +
      '<p>' + esc(o.message) + '</p>' +
      '<p class="flagline">' + (vet ? 'Vet gap flagged: yes' : 'Vet gap flagged: not yet') + '</p>' +
      btn('clearDecision', null, '', 'Change my decision') +
    '</div>';
  }

  function caseScreen() {
    var fc = (state.flags.vet ? 1 : 0) + (state.flags.house ? 1 : 0) + (state.flags.cat ? 1 : 0);
    var flagLabel = fc === 0 ? 'No flags' : (fc === 1 ? '1 flag' : fc + ' flags');
    var caseStatus = state.decision ? 'Decision recorded' : 'Needs review';
    var onCase = state.tour && state.screen === 'case';

    var tabs = TABS.map(function (d) {
      var sel = state.tab === d[0];
      var ring = onCase && ((state.step === 2 && d[0] === 'vet') || (state.step === 4 && d[0] === 'home'));
      return btn('pickTab', d[0], 'tab' + (ring ? ' ring-in' : ''), d[1],
        ' role="tab" id="tab-' + d[0] + '" aria-controls="panel-' + d[0] + '" aria-selected="' + sel + '" tabindex="' + (sel ? '0' : '-1') + '"');
    }).join('');

    var choices = CHOICES.map(function (d) {
      return btn('decide', d[0], 'choice ' + d[0], d[1], ' aria-pressed="' + (state.decision === d[0]) + '"');
    }).join('');

    return '<section class="screen" aria-labelledby="case-title">' +
      btn('goQueue', null, 'back', ICON.chevron + 'Back to queue') +
      '<div class="card case-head">' +
        '<div class="case-id"><div class="case-icon" aria-hidden="true">' + ICON.paw(28) + '</div>' +
          '<div><div class="case-title"><h1 id="case-title">Apollo</h1><span class="mono">Case #0417</span></div>' +
          '<p class="sub" style="margin-top:2px">Lab mix &middot; 3 years &middot; Male &middot; 62 lb</p></div></div>' +
        '<div class="badges">' +
          '<span class="pill badge ' + (fc > 0 ? 'tone-review' : 'tone-docs') + '">' + flagLabel + '</span>' +
          '<span class="pill badge ' + TONE[caseStatus] + '">' + caseStatus + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="cols">' +
        '<aside class="aside">' + facts('Animal', ANIMAL_FACTS) + facts('Applicant', APPLICANT_FACTS) + '</aside>' +
        '<div class="main-col">' +
          '<div class="card tabs-card"><div class="tablist" role="tablist" aria-label="Case sections">' + tabs + '</div>' + tabPanel() + '</div>' +
          '<div class="card decision' + (onCase && state.step === 5 ? ' ring-out' : '') + '">' +
            '<div class="decision-head"><h2>Your decision</h2><span class="muted" style="font-size:13px">' + flagLabel + ' raised</span></div>' +
            '<div class="choices">' + choices + '</div>' +
            outcome() +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function coach() {
    if (!state.tour) return '';
    var step = state.step;
    var onQueueLate = state.screen === 'queue' && step >= 2 && step <= 5;
    var stepOf = function (n, name) { return 'Step ' + n + ' of 5 · ' + name; };
    var c;
    if (step === 0) {
      c = { label: 'Welcome', title: 'Welcome to the Adoption Desk', body: "You're a new case reviewer at Fourth Wish, a fictional animal rescue. This is a practice space: nothing here is real and you can't break anything. We'll walk through one case from queue to decision.", hint: '' };
    } else if (onQueueLate) {
      c = { label: 'Pick up where you left off', title: "Reopen Apollo's case", body: 'Open case #0417 to continue the walkthrough.', hint: 'Click the highlighted row.' };
    } else if (step === 1) {
      c = { label: stepOf(1, 'Search'), title: "Find Apollo's case", body: 'The queue lists every application waiting on a reviewer. Search for “Apollo” or scan the list, then open case #0417.', hint: 'Click the highlighted row to continue.' };
    } else if (step === 2) {
      c = { label: stepOf(2, 'Review'), title: 'Read the record', body: 'A case is split into tabs. The application tells you who is asking. The vet history tells you about the animal. Start with Vet history.', hint: 'Click the highlighted tab.' };
    } else if (step === 3) {
      c = { label: stepOf(3, 'Flag'), title: 'Spot the gap', body: "The last record is eight months old, and it ends with an X-ray order but no result. That's worth a flag. A flag doesn't decide anything. It tells the next person where to look.", hint: 'Flag the highlighted row.' };
    } else if (step === 4) {
      c = { label: stepOf(4, 'Review'), title: 'Check the home visit', body: 'Does the home visit raise concerns or settle them? Read the summary. Flag anything you think matters. You can unflag it later.', hint: 'Click the highlighted tab.' };
    } else if (step === 5) {
      c = { label: stepOf(5, 'Decide'), title: 'Make the call', body: "You have what you need. Approve, request more information, or deny. There's no penalty for trying all three.", hint: 'Choose an option in the highlighted panel.' };
    } else {
      c = { label: 'Walkthrough complete', title: 'That is the loop', body: 'Search, review, flag, decide. Change your decision, flip the flags, or replay from the start. Everything here is yours to poke at.', hint: '' };
    }

    var dots = [1, 2, 3, 4, 5].map(function (i) { return '<span class="dot' + (i <= step ? ' on' : '') + '"></span>'; }).join('');

    var buttons;
    if (step === 0) {
      buttons = btn('startTour', null, 'coach-primary', 'Start walkthrough') + btn('closeTour', null, 'coach-secondary', 'Skip, let me explore');
    } else if (step >= 1 && step <= 4) {
      buttons = btn('showMe', null, 'coach-primary', 'Show me') + btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    } else if (step === 5) {
      buttons = btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    } else {
      buttons = btn('startTour', null, 'coach-primary', 'Replay walkthrough') + btn('closeTour', null, 'coach-secondary', 'Close walkthrough');
    }

    return '<div class="coach" role="region" aria-label="Walkthrough" aria-live="polite">' +
      '<div class="coach-copy">' +
        '<div class="coach-label"><span>' + esc(c.label) + '</span><span class="dots" aria-hidden="true">' + dots + '</span></div>' +
        '<div class="coach-title">' + esc(c.title) + '</div>' +
        '<p class="coach-body">' + esc(c.body) + '</p>' +
        (c.hint ? '<p class="coach-hint">' + esc(c.hint) + '</p>' : '') +
      '</div>' +
      '<div class="coach-actions">' + buttons + '</div>' +
    '</div>';
  }

  // ---------- Render ----------

  function focusKey(el) {
    if (!el || !app.contains(el)) return null;
    if (el.id === 'queue-search') return { id: el.id, pos: el.selectionStart };
    if (el.dataset && el.dataset.action) return { action: el.dataset.action, arg: el.dataset.arg };
    return null;
  }

  function restoreFocus(key) {
    if (!key) return;
    var el;
    if (key.id) {
      el = document.getElementById(key.id);
      if (el) {
        el.focus();
        try { el.setSelectionRange(key.pos, key.pos); } catch (e) { /* not supported for this input */ }
      }
      return;
    }
    var sel = '[data-action="' + key.action + '"]' + (key.arg != null ? '[data-arg="' + key.arg + '"]' : ':not([data-arg])');
    el = app.querySelector(sel);
    if (el) el.focus();
  }

  function render() {
    var key = focusKey(document.activeElement);
    app.innerHTML =
      '<div class="shell">' + sideNav() +
        '<div class="content">' + topBar() + notice() +
          '<main id="main">' + (state.screen === 'queue' ? queueScreen() : caseScreen()) + '</main>' +
          coach() +
        '</div>' +
      '</div>';
    restoreFocus(key);
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || !app.contains(el)) return;
    var fn = actions[el.dataset.action];
    if (fn) fn(el.dataset.arg);
  });

  app.addEventListener('input', function (e) {
    if (e.target.id === 'queue-search') set({ query: e.target.value });
  });

  // Arrow keys move between case tabs, as in a standard tablist.
  app.addEventListener('keydown', function (e) {
    if (!e.target.matches('[role="tab"]')) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var ids = TABS.map(function (d) { return d[0]; });
    var i = ids.indexOf(e.target.dataset.arg);
    var next = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    e.preventDefault();
    actions.pickTab(next);
    var t = document.getElementById('tab-' + next);
    if (t) t.focus();
  });

  render();
})();
