document.addEventListener('DOMContentLoaded', () => {
  const basketCount = document.getElementById('basketCount');
  const basketBtn = document.getElementById('basketBtn') || document.querySelector('.btn-basket');
  const newsletterForm = document.getElementById('newsletter-form');
  const contactForm = document.getElementById('contactForm');
  const emailInput = document.getElementById('newsletter-email');
  const contactMessage = document.getElementById('contactMessage');

  let count = 0;

  document.querySelectorAll('.add-to-basket').forEach((button) => {
    button.addEventListener('click', () => {
      count += 1;
      if (basketCount) {
        basketCount.textContent = count;
      }

      if (basketBtn) {
        basketBtn.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.04)' },
            { transform: 'scale(1)' }
          ],
          { duration: 250 }
        );
      }

      button.textContent = 'Added to basket';
      button.disabled = true;
    });
  });

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (emailInput && emailInput.value.trim()) {
        const message = document.createElement('p');
        message.className = 'form-message';
        message.textContent = `Thanks, ${emailInput.value.trim()} — you’re on the list.`;

        newsletterForm.appendChild(message);
        newsletterForm.reset();

        setTimeout(() => message.remove(), 3000);
      }
    });
  }

  if (contactForm && contactMessage) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      contactMessage.textContent = 'Thanks for reaching out. We’ll reply within two working days.';
      contactForm.reset();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
});