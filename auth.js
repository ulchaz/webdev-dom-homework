import { setToken, removeToken } from './api.js';

let isAuthenticated = false;
let currentUser = null;

export function getIsAuthenticated() {
  return isAuthenticated;
}

export function getCurrentUser() {
  return currentUser;
}

export function setAuth(token, user) {
  setToken(token);
  isAuthenticated = true;
  currentUser = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  removeToken();
  isAuthenticated = false;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function initAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    setToken(token);
    isAuthenticated = true;
    currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

export function register({ login, name, password }) {
  return fetch('https://wedev-api.sky.pro/api/user', {
    method: 'POST',
    body: JSON.stringify({ login, name, password }),
  }).then((response) => {
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 400) {
      return Promise.reject('Пользователь с таким логином уже существует');
    }
    return Promise.reject('Ошибка регистрации');
  });
}

export function login({ login, password }) {
  return fetch('https://wedev-api.sky.pro/api/user/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  }).then((response) => {
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 400) {
      return response.json().then(() => {
        return Promise.reject('Неверный логин или пароль');
      });
    }
    return Promise.reject('Ошибка авторизации');
  });
}