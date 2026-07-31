(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const accountButtons = [...document.querySelectorAll('#account-button, #mobile-account-button')];
  const mobileMenu = document.querySelector('.mobile-menu');

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  document.querySelectorAll('.mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => { if (mobileMenu) mobileMenu.open = false; });
  });

  accountButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.open = false;
      window.SarandAuth?.open?.(button);
    });
  });

  window.addEventListener('sarand:auth-state', (event) => {
    const user = event.detail?.user;
    accountButtons.forEach((button) => {
      button.textContent = user ? 'My salon' : 'Sign in';
      button.setAttribute('aria-label', user ? `${user.displayName || 'SHARAND Client'} 계정` : '내 계정');
    });
  });
})();
