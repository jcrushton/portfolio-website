// GitHub Pages has no server, so the contact form hands the note to the
// visitor's email app as a pre-filled message.
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var subject = 'Portfolio note from ' + name;
    var body = message + '\n\n' + name + '\n' + email;
    window.location.href = 'mailto:' + form.dataset.to +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
})();
