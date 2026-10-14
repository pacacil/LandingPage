document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.innerWidth > 760;
  root.classList.add('js-ready');
  if (!reduceMotion) root.style.scrollBehavior = 'smooth';

  /* ---------- Campus video (desktop only, after first interaction) ---------- */
  var vimeoIframe = document.querySelector('.tile--media iframe[data-src]');
  if (vimeoIframe && isDesktop && !reduceMotion) {
    var vimeoLoaded = false;
    var interactionEvents = ['scroll', 'mousemove', 'touchstart', 'keydown'];
    var loadVimeo = function () {
      if (vimeoLoaded) return;
      vimeoLoaded = true;
      interactionEvents.forEach(function (evt) { window.removeEventListener(evt, loadVimeo); });
      vimeoIframe.addEventListener('load', function () {
        // the background player paints black before the first frame; fade in once it is playing
        setTimeout(function () { vimeoIframe.classList.add('is-playing'); }, 900);
      });
      vimeoIframe.src = vimeoIframe.getAttribute('data-src');
    };
    interactionEvents.forEach(function (evt) { window.addEventListener(evt, loadVimeo, { once: true, passive: true }); });
    setTimeout(loadVimeo, 3000);
  }

  /* ---------- Consent mode ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    'analytics_storage': 'denied', 'ad_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied',
    'functionality_storage': 'granted', 'security_storage': 'granted', 'wait_for_update': 500
  });
  var savedChoice = localStorage.getItem('cookie-choice');
  var savedStats = localStorage.getItem('cookie-stats');
  if (savedChoice === 'accepted') {
    var statsGranted = savedStats !== 'denied';
    gtag('consent', 'update', {
      'analytics_storage': statsGranted ? 'granted' : 'denied', 'ad_storage': statsGranted ? 'granted' : 'denied',
      'ad_user_data': statsGranted ? 'granted' : 'denied', 'ad_personalization': statsGranted ? 'granted' : 'denied'
    });
  }

  /* ---------- Cookie notice ---------- */
  var cookieBanner = document.getElementById('cookie-banner');
  var cookieAccept = document.getElementById('cookie-accept');
  var cookieDecline = document.getElementById('cookie-decline');
  var cookieManage = document.getElementById('cookie-manage');
  var cookieClose = document.getElementById('cookie-close');
  var cookiePrefs = document.getElementById('cookie-prefs');
  var cookieStatsCheckbox = document.getElementById('cookie-stats');
  if (savedChoice === 'accepted' || savedChoice === 'declined') cookieBanner.classList.add('dismissed');
  if (savedStats === 'denied' && cookieStatsCheckbox) cookieStatsCheckbox.checked = false;

  function dismissCookies(choice) {
    cookieBanner.classList.add('dismissed');
    localStorage.setItem('cookie-choice', choice);
    var statsAllowed = cookieStatsCheckbox && cookieStatsCheckbox.checked;
    localStorage.setItem('cookie-stats', statsAllowed ? 'granted' : 'denied');
    if (choice === 'accepted') {
      gtag('consent', 'update', {
        'analytics_storage': statsAllowed ? 'granted' : 'denied', 'ad_storage': statsAllowed ? 'granted' : 'denied',
        'ad_user_data': statsAllowed ? 'granted' : 'denied', 'ad_personalization': statsAllowed ? 'granted' : 'denied'
      });
    } else {
      gtag('consent', 'update', { 'analytics_storage': 'denied', 'ad_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied' });
    }
  }
  cookieAccept.addEventListener('click', function () { dismissCookies('accepted'); });
  cookieDecline.addEventListener('click', function () { dismissCookies('declined'); });
  cookieClose.addEventListener('click', function () { cookieBanner.classList.add('dismissed'); });
  cookieManage.addEventListener('click', function () {
    cookiePrefs.classList.toggle('hidden');
    this.textContent = cookiePrefs.classList.contains('hidden') ? 'ניהול העדפות' : 'שמירת העדפות';
  });

  /* ---------- Validation shared by both forms ---------- */
  function isValidPhone(value) {
    var v = value.trim();
    if (!/^[0-9\-+\s()]{9,18}$/.test(v)) return false;
    var digits = v.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 12;
  }
  function isValidEmail(input) {
    var v = input.value.trim();
    return v !== '' && input.validity.valid && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function setFieldError(input, hasError) {
    input.classList.toggle('error', hasError);
    input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    if (input.parentElement.classList.contains('form-field')) input.parentElement.classList.toggle('has-error', hasError);
  }

  /* ---------- Lead form ---------- */
  var form = document.getElementById('lead-form');
  var step1 = document.getElementById('form-step-1');
  var success = document.getElementById('form-success');
  var btnStep1 = document.getElementById('btn-step1');
  var fullnameInput = document.getElementById('fullname');
  var phoneInput = document.getElementById('phone');
  var emailInput = document.getElementById('email');
  var exitShown = false;
  var formTouched = false;

  btnStep1.addEventListener('click', function (e) {
    e.stopPropagation();
    var checks = [
      [fullnameInput, fullnameInput.value.trim() !== ''],
      [phoneInput, isValidPhone(phoneInput.value)],
      [emailInput, isValidEmail(emailInput)]
    ];
    var firstInvalid = null;
    checks.forEach(function (check) {
      setFieldError(check[0], !check[1]);
      if (!check[1] && !firstInvalid) firstInvalid = check[0];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    gtag('event', 'lead_form_step1', { event_category: 'form', event_label: 'name_phone_email_submitted' });
    // Fire the submit event while the fields are still in the form, so HubSpot collects them.
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    exitShown = true;
    localStorage.setItem('exit-popup-shown', '1');
    step1.classList.add('hidden');
    success.classList.remove('hidden');
    ['.form-badge', '.form-title', '.form-disclaimer'].forEach(function (sel) {
      var el = form.querySelector(sel);
      if (el) el.classList.add('hidden');
    });
    success.focus({ preventScroll: true });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    gtag('event', 'generate_lead', { event_category: 'form', event_label: 'form_complete' });
    success.classList.remove('hidden');
  });

  [fullnameInput, phoneInput, emailInput].forEach(function (input) {
    input.addEventListener('focus', function () { formTouched = true; });
    input.addEventListener('input', function () {
      if (input.classList.contains('error')) setFieldError(input, false);
    });
    // Enter (or "Go" on a phone keyboard) sends the form like the button does
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); btnStep1.click(); }
    });
  });

  /* ---------- Links that lead to the form ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var scrollTarget = this.hasAttribute('data-focus-form') ? document.getElementById('form-section') : target;
      scrollTarget.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (this.hasAttribute('data-focus-form') && window.matchMedia('(pointer: fine)').matches && !step1.classList.contains('hidden')) {
        setTimeout(function () { fullnameInput.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
      }
    });
  });

  /* ---------- Certificate fields (tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.cert-tab'));
  function selectTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !selected;
        var list = panel.querySelector('[data-rows]');
        if (selected && list) list.classList.add('is-in');
      }
    });
    if (moveFocus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      // RTL: the next tab sits to the left
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  if (tabs.length) selectTab(tabs[0], false);

  /* ---------- Entrances, once per section ---------- */
  var revealTargets = document.querySelectorAll('[data-reveal], [data-rows], .final-cta');
  var revealList = function (el) {
    el.classList.add('is-in');
    // a hidden tab panel cannot intersect; reveal every list with the tabs, so a later tab switch
    // shows its rows at once instead of replaying a long entrance in answer to a click
    if (el.classList.contains('cert-tabs')) {
      document.querySelectorAll('.cert-panel [data-rows]').forEach(function (l) { l.classList.add('is-in'); });
    }
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { revealList(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(revealList);
  }

  /* ---------- Exit-intent dialog ---------- */
  var exitPopup = document.getElementById('exit-popup');
  var exitOverlay = document.getElementById('exit-overlay');
  var exitClose = document.getElementById('exit-close');
  var exitForm = document.getElementById('exit-form');
  var exitDialog = exitPopup.querySelector('.exit-popup-content');
  var formSection = document.getElementById('form-section');
  var formInView = false;
  var lastFocus = null;

  if ('IntersectionObserver' in window && formSection) {
    new IntersectionObserver(function (entries) { formInView = entries[0].isIntersecting; }, { threshold: 0.4 }).observe(formSection);
  }

  function showExitPopup() {
    if (exitShown || formInView || formTouched || localStorage.getItem('exit-popup-shown')) return;
    exitShown = true;
    lastFocus = document.activeElement;
    exitPopup.classList.remove('hidden', 'is-closing');
    localStorage.setItem('exit-popup-shown', '1');
    var first = document.getElementById('exit-name');
    (first || exitDialog).focus({ preventScroll: true });
  }
  function closeExitPopup() {
    if (exitPopup.classList.contains('hidden')) return;
    var finish = function () {
      exitPopup.classList.add('hidden');
      exitPopup.classList.remove('is-closing');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    if (reduceMotion) { finish(); return; }
    exitPopup.classList.add('is-closing');
    setTimeout(finish, 180);
  }

  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && e.clientY <= 0) showExitPopup();
  });
  var lastScrollY = window.scrollY;
  var scrollUpDistance = 0;
  var pageLoadTime = Date.now();
  var maxScrollReached = 0;
  window.addEventListener('scroll', function () {
    var currentY = window.scrollY;
    if (currentY > maxScrollReached) maxScrollReached = currentY;
    if (currentY < lastScrollY) {
      scrollUpDistance += (lastScrollY - currentY);
      var timeOnPage = (Date.now() - pageLoadTime) / 1000;
      var scrolledEnough = maxScrollReached > document.documentElement.scrollHeight * 0.5;
      if (scrollUpDistance > 1200 && currentY < 150 && timeOnPage > 30 && scrolledEnough) {
        showExitPopup();
        scrollUpDistance = 0;
      }
    } else {
      scrollUpDistance = 0;
    }
    lastScrollY = currentY;
  }, { passive: true });

  exitClose.addEventListener('click', closeExitPopup);
  exitOverlay.addEventListener('click', closeExitPopup);
  document.addEventListener('keydown', function (e) {
    if (exitPopup.classList.contains('hidden')) return;
    if (e.key === 'Escape') { closeExitPopup(); return; }
    if (e.key === 'Tab') {
      // keep keyboard focus inside the dialog
      var focusable = exitDialog.querySelectorAll('button, input, a[href]');
      var visible = Array.prototype.filter.call(focusable, function (el) { return el.offsetParent !== null; });
      if (!visible.length) return;
      var first = visible[0];
      var last = visible[visible.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  exitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = document.getElementById('exit-name');
    var phoneEl = document.getElementById('exit-phone');
    var emailEl = document.getElementById('exit-email');
    var checks = [[nameEl, nameEl.value.trim() !== ''], [phoneEl, isValidPhone(phoneEl.value)], [emailEl, isValidEmail(emailEl)]];
    var firstInvalid = null;
    checks.forEach(function (check) {
      setFieldError(check[0], !check[1]);
      if (!check[1] && !firstInvalid) firstInvalid = check[0];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    gtag('event', 'exit_intent_lead', { event_category: 'form', event_label: 'exit_popup' });
    exitForm.classList.add('hidden');
    exitDialog.querySelector('h3').classList.add('hidden');
    exitDialog.querySelector('h3 + p').classList.add('hidden');
    document.getElementById('exit-success').classList.remove('hidden');
    setTimeout(closeExitPopup, 2500);
  });
});
