(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = {
    name: {
      input: document.getElementById('name'),
      container: document.getElementById('nameField'),
      error: document.getElementById('nameError'),
      validate: (value) => value.trim().length > 0,
    },
    email: {
      input: document.getElementById('email'),
      container: document.getElementById('emailField'),
      error: document.getElementById('emailError'),
      validate: (value) => value.trim().length > 0 && EMAIL_PATTERN.test(value.trim()),
    },
    message: {
      input: document.getElementById('message'),
      container: document.getElementById('messageField'),
      error: document.getElementById('messageError'),
      validate: (value) => value.trim().length > 0,
    },
  };

  function setFieldValidity(key, isValid) {
    const { container, error } = fields[key];
    container.classList.toggle('invalid', !isValid);
    if (!isValid) {
      error.style.display = 'block';
    } else {
      error.style.display = 'none';
    }
  }

  function validateField(key) {
    const { input, validate, error } = fields[key];
    const isValid = validate(input.value);

    if (!isValid) {
      if (key === 'name') {
        error.textContent = 'Please enter your name.';
      } else if (key === 'email') {
        error.textContent = 'Please enter a valid email address.';
      } else if (key === 'message') {
        error.textContent = 'Please enter a message.';
      }
    }

    setFieldValidity(key, isValid);
    return isValid;
  }

  function validateAll() {
    let allValid = true;
    Object.keys(fields).forEach((key) => {
      if (!validateField(key)) {
        allValid = false;
      }
    });
    return allValid;
  }

  Object.keys(fields).forEach((key) => {
    const { input } = fields[key];

    input.addEventListener('blur', () => validateField(key));
    input.addEventListener('input', () => {
      if (fields[key].container.classList.contains('invalid')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.classList.remove('show');

    if (!validateAll()) {
      const firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid textarea');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const payload = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim(),
    };

    console.log('Contact form validated, ready to send:', payload);

    status.textContent = 'Thanks — your message is ready to send once the integration is wired up.';
    status.classList.add('show');
    form.reset();

    Object.keys(fields).forEach((key) => {
      fields[key].container.classList.remove('invalid');
      fields[key].error.style.display = 'none';
    });
  });
})();
