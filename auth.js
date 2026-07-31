import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// Firebase web configuration is public by design and identifies this browser app.
const firebaseConfig = {
  apiKey: 'AIzaSyB7YWr4CS7SaJRoclYAfM3-Q_cqDv10g9k',
  authDomain: 'charand-ccbd5.firebaseapp.com',
  projectId: 'charand-ccbd5',
  storageBucket: 'charand-ccbd5.firebasestorage.app',
  messagingSenderId: '788715951206',
  appId: '1:788715951206:web:782c7d6a69da31bcf8c9a7',
  measurementId: 'G-Z143Q5ZB83'
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
auth.languageCode = 'ko';
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let currentUser = null;
let focusRestore = null;

const authDialog = document.createElement('section');
authDialog.className = 'auth-dialog';
authDialog.id = 'auth-dialog';
authDialog.setAttribute('aria-hidden', 'true');
authDialog.setAttribute('aria-label', 'SHARAND 회원 로그인');
authDialog.setAttribute('aria-modal', 'true');
authDialog.setAttribute('role', 'dialog');
authDialog.innerHTML = `
  <div class="auth-dialog__card" tabindex="-1">
    <header class="auth-dialog__header">
      <div>
        <p class="auth-eyebrow">Private client</p>
        <h2 class="auth-dialog__title">Welcome to SHARAND</h2>
      </div>
      <button aria-label="로그인 창 닫기" class="auth-close" data-auth-close type="button"><span class="material-symbols-outlined">close</span></button>
    </header>
    <div class="auth-dialog__body">
      <div class="auth-guest" data-auth-guest>
        <div aria-label="로그인 방식" class="auth-tabs" role="tablist">
          <button aria-controls="auth-sign-in" aria-selected="true" class="auth-tab" data-auth-tab="sign-in" id="auth-sign-in-tab" role="tab" type="button">로그인</button>
          <button aria-controls="auth-sign-up" aria-selected="false" class="auth-tab" data-auth-tab="sign-up" id="auth-sign-up-tab" role="tab" type="button">회원가입</button>
        </div>

        <section aria-labelledby="auth-sign-in-tab" class="auth-panel" data-auth-panel="sign-in" id="auth-sign-in" role="tabpanel">
          <p class="auth-copy">저장한 관심 컬렉션과 주문 요청을 한 곳에서 확인하세요.</p>
          <form class="auth-form" id="auth-sign-in-form" novalidate>
            <div class="auth-field"><label for="auth-sign-in-email">이메일</label><input autocomplete="email" id="auth-sign-in-email" name="email" required type="email"/></div>
            <div class="auth-field"><label for="auth-sign-in-password">비밀번호</label><input autocomplete="current-password" id="auth-sign-in-password" minlength="6" name="password" required type="password"/></div>
            <button class="auth-submit" type="submit">이메일로 로그인</button>
          </form>
          <button class="auth-text-button" data-auth-reset type="button">비밀번호를 잊으셨나요?</button>
        </section>

        <section aria-labelledby="auth-sign-up-tab" class="auth-panel" data-auth-panel="sign-up" hidden id="auth-sign-up" role="tabpanel">
          <p class="auth-copy">SARAND의 새로운 소식과 프라이빗 서비스를 만나보세요.</p>
          <form class="auth-form" id="auth-sign-up-form" novalidate>
            <div class="auth-field"><label for="auth-sign-up-name">이름</label><input autocomplete="name" id="auth-sign-up-name" name="name" required type="text"/></div>
            <div class="auth-field"><label for="auth-sign-up-email">이메일</label><input autocomplete="email" id="auth-sign-up-email" name="email" required type="email"/></div>
            <div class="auth-field"><label for="auth-sign-up-password">비밀번호</label><input autocomplete="new-password" id="auth-sign-up-password" minlength="6" name="password" required type="password"/><span class="auth-label">6자 이상 입력해 주세요</span></div>
            <button class="auth-submit" type="submit">SHARAND 계정 만들기</button>
          </form>
        </section>

        <div class="auth-divider">또는</div>
        <button class="auth-google" data-auth-google type="button"><span aria-hidden="true" class="auth-google-mark">G</span>Google로 계속하기</button>
      </div>

      <section class="auth-client" data-auth-client hidden>
        <div aria-hidden="true" class="auth-avatar" data-auth-avatar></div>
        <p class="auth-eyebrow">Private client</p>
        <h3 class="auth-client-name" data-auth-client-name></h3>
        <p class="auth-client-email" data-auth-client-email></p>
        <p class="auth-client-note">SHARAND에 로그인되어 있습니다. 관심 피스를 담고 프라이빗 상담을 시작해 보세요.</p>
        <button class="auth-signout" data-auth-signout type="button">로그아웃</button>
      </section>

      <p aria-live="polite" class="auth-message" data-auth-message role="status"></p>
    </div>
  </div>
`;
document.body.append(authDialog);

const $ = (selector) => authDialog.querySelector(selector);
const $$ = (selector) => [...authDialog.querySelectorAll(selector)];
const refs = {
  card: $('.auth-dialog__card'),
  guest: $('[data-auth-guest]'),
  client: $('[data-auth-client]'),
  clientName: $('[data-auth-client-name]'),
  clientEmail: $('[data-auth-client-email]'),
  avatar: $('[data-auth-avatar]'),
  message: $('[data-auth-message]'),
  signInForm: $('#auth-sign-in-form'),
  signUpForm: $('#auth-sign-up-form'),
  signInEmail: $('#auth-sign-in-email'),
  signInPassword: $('#auth-sign-in-password'),
  signUpName: $('#auth-sign-up-name'),
  signUpEmail: $('#auth-sign-up-email'),
  signUpPassword: $('#auth-sign-up-password')
};

const errorMessage = (error) => {
  const messages = {
    'auth/email-already-in-use': '이미 등록된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요.',
    'auth/invalid-email': '이메일 주소를 확인해 주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    'auth/operation-not-allowed': '현재 이 로그인 방식은 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    'auth/popup-blocked': '브라우저에서 로그인 창을 차단했습니다. 팝업 차단을 해제한 뒤 다시 시도해 주세요.',
    'auth/popup-closed-by-user': 'Google 로그인 창이 닫혔습니다.',
    'auth/too-many-requests': '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/weak-password': '비밀번호는 6자 이상으로 입력해 주세요.'
  };
  return messages[error?.code] || '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
};

const displayName = (user) => user?.displayName?.trim() || user?.email?.split('@')[0] || 'SHARAND Client';

const setMessage = (message = '', type = '') => {
  refs.message.textContent = message;
  refs.message.className = `auth-message${type ? ` is-${type}` : ''}`;
};

const setBusy = (isBusy) => {
  authDialog.dataset.busy = String(isBusy);
  $$('button, input').forEach((element) => { element.disabled = isBusy; });
};

const setActivePanel = (panel) => {
  const selected = panel === 'sign-up' ? 'sign-up' : 'sign-in';
  $$('[data-auth-tab]').forEach((tab) => {
    const isActive = tab.dataset.authTab === selected;
    tab.setAttribute('aria-selected', String(isActive));
  });
  $$('[data-auth-panel]').forEach((view) => { view.hidden = view.dataset.authPanel !== selected; });
  setMessage();
};

const renderUser = (user) => {
  currentUser = user || null;
  refs.guest.hidden = Boolean(currentUser);
  refs.client.hidden = !currentUser;

  const accountButton = document.getElementById('account-button');
  const icon = accountButton?.querySelector('.material-symbols-outlined');
  if (accountButton) {
    accountButton.setAttribute('aria-label', currentUser ? `${displayName(currentUser)} 계정` : '내 계정');
    accountButton.title = currentUser ? displayName(currentUser) : '로그인';
  }
  if (icon) icon.textContent = currentUser ? 'account_circle' : 'person';

  if (currentUser) {
    const name = displayName(currentUser);
    refs.clientName.textContent = name;
    refs.clientEmail.textContent = currentUser.email || '';
    refs.avatar.textContent = name.slice(0, 1).toUpperCase();
    if (currentUser.photoURL) {
      const image = new Image();
      image.alt = '';
      image.referrerPolicy = 'no-referrer';
      image.src = currentUser.photoURL;
      refs.avatar.replaceChildren(image);
    }
  } else {
    refs.avatar.replaceChildren();
    setActivePanel('sign-in');
  }

  window.dispatchEvent(new CustomEvent('sarand:auth-state', {
    detail: { user: currentUser ? { uid: currentUser.uid, email: currentUser.email, displayName: displayName(currentUser) } : null }
  }));
};

const open = (trigger) => {
  focusRestore = trigger instanceof HTMLElement ? trigger : document.activeElement;
  setMessage();
  renderUser(auth.currentUser);
  authDialog.classList.add('is-open');
  authDialog.setAttribute('aria-hidden', 'false');
  document.body.classList.add('auth-is-locked');
  window.setTimeout(() => {
    (currentUser ? $('[data-auth-signout]') : refs.signInEmail)?.focus();
  }, 30);
};

const close = () => {
  authDialog.classList.remove('is-open');
  authDialog.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('auth-is-locked');
  if (focusRestore instanceof HTMLElement) focusRestore.focus();
  focusRestore = null;
};

window.SarandAuth = { open, close, getUser: () => currentUser };

authDialog.addEventListener('click', (event) => {
  if (event.target === authDialog || event.target.closest('[data-auth-close]')) close();
});

$$('[data-auth-tab]').forEach((tab) => tab.addEventListener('click', () => setActivePanel(tab.dataset.authTab)));

refs.signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!refs.signInForm.checkValidity()) { refs.signInForm.reportValidity(); return; }
  setBusy(true);
  setMessage('로그인 중입니다.');
  try {
    await signInWithEmailAndPassword(auth, refs.signInEmail.value.trim(), refs.signInPassword.value);
    close();
  } catch (error) {
    setMessage(errorMessage(error), 'error');
  } finally {
    setBusy(false);
  }
});

refs.signUpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!refs.signUpForm.checkValidity()) { refs.signUpForm.reportValidity(); return; }
  setBusy(true);
  setMessage('계정을 만드는 중입니다.');
  try {
    const credential = await createUserWithEmailAndPassword(auth, refs.signUpEmail.value.trim(), refs.signUpPassword.value);
    await updateProfile(credential.user, { displayName: refs.signUpName.value.trim() });
    renderUser(auth.currentUser);
    close();
  } catch (error) {
    setMessage(errorMessage(error), 'error');
  } finally {
    setBusy(false);
  }
});

$$('[data-auth-google]').forEach((button) => button.addEventListener('click', async () => {
  setBusy(true);
  setMessage('Google 계정을 여는 중입니다.');
  try {
    await signInWithPopup(auth, googleProvider);
    close();
  } catch (error) {
    setMessage(errorMessage(error), 'error');
  } finally {
    setBusy(false);
  }
}));

$('[data-auth-reset]').addEventListener('click', async () => {
  const email = refs.signInEmail.value.trim();
  if (!email) {
    refs.signInEmail.focus();
    setMessage('비밀번호 재설정 이메일을 받을 주소를 먼저 입력해 주세요.', 'error');
    return;
  }
  setBusy(true);
  setMessage('재설정 이메일을 보내는 중입니다.');
  try {
    await sendPasswordResetEmail(auth, email);
    setMessage('비밀번호 재설정 이메일을 보냈습니다. 받은편지함을 확인해 주세요.', 'success');
  } catch (error) {
    setMessage(errorMessage(error), 'error');
  } finally {
    setBusy(false);
  }
});

$('[data-auth-signout]').addEventListener('click', async () => {
  setBusy(true);
  try {
    await signOut(auth);
    close();
  } catch (error) {
    setMessage(errorMessage(error), 'error');
  } finally {
    setBusy(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && authDialog.classList.contains('is-open')) close();
});

onAuthStateChanged(auth, renderUser);
