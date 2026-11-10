/* CampusFold prototype: shared behaviour */
(function () {
  'use strict';

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var lbl = toggle.querySelector('.nav-toggle-label');
      if (lbl) { lbl.textContent = open ? 'Close' : 'Menu'; }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        var l2 = toggle.querySelector('.nav-toggle-label');
        if (l2) { l2.textContent = 'Menu'; }
        toggle.focus();
      }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = document.getElementById(btn.getAttribute('aria-controls'));
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (answer) { answer.classList.toggle('open', !expanded); }
    });
  });

  // Full UK postcode, such as "LS2 9JT", "M1 1AA" or "SW1A 1AA" (with or without the space)
  var UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

  // Demo forms: validate and preview locally. Nothing is sent anywhere.
  // This site sets no cookies and uses no localStorage, sessionStorage or network requests.
  function setupForm(formId, resultId, labels) {
    var form = document.getElementById(formId);
    var result = document.getElementById(resultId);
    if (!form || !result) { return; }

    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;

      form.querySelectorAll('.field').forEach(function (field) {
        var input = field.querySelector('input, select, textarea');
        if (!input) { return; }
        var errorEl = field.querySelector('.error-msg');
        var ok;
        if (input.type === 'checkbox') {
          ok = input.checked;
        } else {
          ok = input.value.trim() !== '';
        }
        // Collection area must be broad: numbers are fine (for example "Zone 2"), but a full UK postcode is rejected
        if (ok && input.hasAttribute('data-broad-area') && UK_POSTCODE.test(input.value)) {
          ok = false;
          if (errorEl) { errorEl.textContent = 'Please enter a broad area only, such as a town or district. Leave out the full postcode.'; }
        } else if (errorEl && input.hasAttribute('data-broad-area')) {
          errorEl.textContent = 'Please enter a broad area.';
        }
        field.classList.toggle('invalid', !ok);
        input.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) {
          valid = false;
          if (!firstInvalid) { firstInvalid = input; }
        }
      });

      if (!valid) {
        result.classList.remove('show');
        if (firstInvalid) { firstInvalid.focus(); }
        return;
      }

      var dl = result.querySelector('dl');
      dl.innerHTML = '';
      Object.keys(labels).forEach(function (id) {
        var input = document.getElementById(id);
        if (!input) { return; }
        var shown = input.tagName === 'SELECT' ? input.options[input.selectedIndex].text : input.value.trim();
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = labels[id];
        dd.textContent = shown;
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      result.classList.add('show');
      result.focus();
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      var filled = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim() !== '';
      if (field && filled) {
        field.classList.remove('invalid');
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  setupForm('pickup-form', 'pickup-result', {
    service: 'Laundry service',
    date: 'Preferred collection date',
    area: 'Collection area',
    time: 'Preferred time'
  });

  setupForm('enquiry-form', 'enquiry-result', {
    topic: 'Topic',
    message: 'Message'
  });

  // Stop past dates being chosen in the pickup form
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var d = new Date();
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    dateInput.min = iso;
  }

  // Preselect service when arriving from the Services page (?service=...)
  var params = new URLSearchParams(window.location.search);
  var preset = params.get('service');
  var serviceSelect = document.getElementById('service');
  if (preset && serviceSelect) {
    Array.prototype.forEach.call(serviceSelect.options, function (opt) {
      if (opt.value === preset) { serviceSelect.value = preset; }
    });
  }
})();
