import { formatDateFromAPI } from './utils.js';

const BASE_URL = "https://wedev-api.sky.pro/api/v2/julia-esaulkova/comments";
const USER_URL = "https://wedev-api.sky.pro/api/user";
let token = null;

export function setToken(newToken) {
  token = newToken;
}

export function getToken() {
  return token;
}

export function removeToken() {
  token = null;
}

export function fetchComments() {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(BASE_URL, { 
    method: "GET", 
    headers 
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        return Promise.reject('401: Необходима авторизация');
      }
      return Promise.reject('Ошибка загрузки');
    })
    .then((responseData) => {
      return responseData.comments.map((comment) => ({
        id: comment.id,
        name: comment.author.name,
        date: formatDateFromAPI(comment.date),
        text: comment.text,
        likes: comment.likes || 0
      }));
    });
}

export function postComment(name, text) {
  if (!token) {
    return Promise.reject('401: Необходима авторизация');
  }

  return fetch(BASE_URL, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ 
      text: text,
      name: name 
    }),
  }).then((response) => {
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 400) {
      return response.json().then(data => {
        return Promise.reject(data.error || '400: Ошибка валидации');
      });
    } else if (response.status === 401) {
      return Promise.reject('401: Необходима авторизация');
    }
    return Promise.reject('Неизвестная ошибка');
  });
}

export function registerUser({ login, name, password }) {
  return fetch(`${USER_URL}`, {
    method: 'POST',
    body: JSON.stringify({ login, name, password }),
  }).then((response) => {
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 400) {
      return response.json().then((data) => {
        return Promise.reject(data.error || 'Ошибка регистрации');
      });
    }
    return Promise.reject('Ошибка регистрации');
  });
}

export function loginUser({ login, password }) {
  return fetch(`${USER_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  }).then((response) => {
    if (response.status === 201) {
      return response.json();
    } else if (response.status === 400) {
      return response.json().then((data) => {
        return Promise.reject('Неверный логин или пароль');
      });
    }
    return Promise.reject('Ошибка авторизации');
  });
}