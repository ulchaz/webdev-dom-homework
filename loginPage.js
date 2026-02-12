import { login, register, setAuth } from './auth.js';
import { fetchAndRenderComments } from './main.js';
import { renderRegisterPage, renderLoginPage } from './render.js';
import { setFormData } from './comments.js';

const appElement = document.getElementById('app');

export function initLoginListeners(fetchAndRenderComments) {
  const loginButton = document.getElementById('login-button');
  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const switchToRegister = document.getElementById('switch-to-register');

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const loginValue = loginInput.value.trim();
      const passwordValue = passwordInput.value.trim();

      if (!loginValue || !passwordValue) {
        alert('Введите логин и пароль');
        return;
      }

      loginButton.disabled = true;
      loginButton.textContent = 'Вход...';

      login({ login: loginValue, password: passwordValue })
        .then((responseData) => {
          setAuth(responseData.user.token, responseData.user);
          setFormData({ name: responseData.user.name, text: '' });
          alert('Вход выполнен успешно!');
          fetchAndRenderComments();
        })
        .catch((error) => {
          console.error('Ошибка входа:', error);
          alert('Неверный логин или пароль');
        })
        .finally(() => {
          loginButton.disabled = false;
          loginButton.textContent = 'Войти';
        });
    });
  }

  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => {
      appElement.innerHTML = renderRegisterPage();
      initRegisterListeners(fetchAndRenderComments);
    });
  }
}

export function initRegisterListeners(fetchAndRenderComments) {
  const registerButton = document.getElementById('register-button');
  const regLogin = document.getElementById('reg-login');
  const regName = document.getElementById('reg-name');
  const regPassword = document.getElementById('reg-password');
  const switchToLogin = document.getElementById('switch-to-login');

  if (registerButton) {
    registerButton.addEventListener('click', () => {
      const loginValue = regLogin.value.trim();
      const nameValue = regName.value.trim();
      const passwordValue = regPassword.value.trim();

      if (!loginValue || !nameValue || !passwordValue) {
        alert('Заполните все поля');
        return;
      }

      if (loginValue.length < 3) {
        alert('Логин должен содержать минимум 3 символа');
        return;
      }

      if (nameValue.length < 2) {
        alert('Имя должно содержать минимум 2 символа');
        return;
      }

      if (passwordValue.length < 3) {
        alert('Пароль должен содержать минимум 3 символа');
        return;
      }

      registerButton.disabled = true;
      registerButton.textContent = 'Регистрация...';

      register({ login: loginValue, name: nameValue, password: passwordValue })
        .then((responseData) => {
          setAuth(responseData.user.token, responseData.user);
          setFormData({ name: responseData.user.name, text: '' });
          alert('Регистрация прошла успешно!');
          fetchAndRenderComments();
        })
        .catch((error) => {
          console.error('Ошибка регистрации:', error);
          if (error === 'Пользователь с таким логином уже существует') {
            alert('Пользователь с таким логином уже существует');
          } else {
            alert('Ошибка регистрации. Попробуйте позже');
          }
        })
        .finally(() => {
          registerButton.disabled = false;
          registerButton.textContent = 'Зарегистрироваться';
        });
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
      appElement.innerHTML = renderLoginPage();
      initLoginListeners(fetchAndRenderComments);
    });
  }
}