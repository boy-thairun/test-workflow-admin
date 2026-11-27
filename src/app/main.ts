import { AuthError, createAuthClient } from '../auth/client.ts';
import { resolveAdminAccess, type AdminAccess } from '../auth/access.ts';
import './style.css';

const root = document.querySelector<HTMLElement>('#app')!;
const auth = createAuthClient();

function route(path: string) {
  if (location.pathname !== path) history.replaceState(null, '', path);
}

function showLogin(error = '') {
  route('/login');
  root.innerHTML = '<main class="login"><form class="card">'
    + '<p class="brand">Virtual Room Admin</p><h1>เข้าสู่ระบบ</h1>'
    + '<label for="email">อีเมล</label><input id="email" name="email" type="email" autocomplete="username" required>'
    + '<label for="password">รหัสผ่าน</label><input id="password" name="password" type="password" autocomplete="current-password" required>'
    + '<p class="error" role="alert" hidden></p><button type="submit">เข้าสู่ระบบ</button>'
    + '</form></main>';
  const form = root.querySelector('form')!;
  const message = root.querySelector<HTMLElement>('.error')!;
  const submit = form.querySelector('button')!;
  message.textContent = error;
  message.hidden = !error;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    message.hidden = true;
    const data = new FormData(form);
    try {
      showAccess(resolveAdminAccess(await auth.login(String(data.get('email')), String(data.get('password')))));
    } catch (failure) {
      message.textContent = failure instanceof AuthError && failure.code === 'INVALID_CREDENTIALS'
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง';
      message.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
}

function showAccess(access: AdminAccess) {
  if (access.status === 'signed-out') {
    showLogin();
    return;
  }
  const allowed = access.status === 'allowed';
  route(allowed ? '/users' : '/forbidden');
  root.innerHTML = '<header><p class="brand">Virtual Room Admin</p>'
    + '<button class="secondary" type="button">ออกจากระบบ</button></header>'
    + (allowed
      ? '<main class="content"><h1>จัดการผู้ใช้</h1><p class="identity"></p><div id="users"></div>'
      : '<main class="content"><h1>ไม่มีสิทธิ์เข้าหน้าจัดการ</h1><p class="identity"></p>')
    + '<p class="error" role="alert" hidden></p></main>';
  root.querySelector<HTMLElement>('.identity')!.textContent = access.user.email;
  const button = root.querySelector('button')!;
  const message = root.querySelector<HTMLElement>('.error')!;
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await auth.logout();
      showLogin();
    } catch {
      message.textContent = 'ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง';
      message.hidden = false;
      button.disabled = false;
    }
  });
}

root.innerHTML = '<main class="content" role="status">กำลังตรวจสอบเซสชัน…</main>';
try {
  showAccess(resolveAdminAccess(await auth.current()));
} catch {
  showLogin('ติดต่อ API ไม่ได้ กรุณาลองอีกครั้ง');
}
