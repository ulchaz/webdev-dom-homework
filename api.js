import { formatDateFromAPI } from './utils.js';

const BASE_URL = "https://wedev-api.sky.pro/api/v2/julia-esaulkova/comments";
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

  return fetch(`${BASE_URL}`, { method: "GET", headers })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        return Promise.reject('Необходима авторизация');
      } else if (response.status === 500) {
        return Promise.reject('Ошибка сервера 500');
      }
      return Promise.reject('Неизвестная ошибка');
    })
    .then((responseData) => {
      return responseData.comments.map((comment) => ({
        id: comment.id,
        name: comment.author.name,
        date: formatDateFromAPI(comment.date),
        text: comment.text,
        isLiked: false,
        likes: 0,
        isEdit: false,
        isLikeLoading: false,
      }));
    });
}

export function postComment(name, text) {
  if (!token) {
    return Promise.reject('Необходима авторизация');
  }

  return fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, text }),
  }).then((response) => {
    if (response.status === 201 || response.status === 200) {
      return response.json();
    } else if (response.status === 400) {
      return response.json().then(data => {
        return Promise.reject(data.error || '400: Ошибка валидации');
      });
    } else if (response.status === 401) {
      return Promise.reject('401: Необходима авторизация');
    } else if (response.status === 500) {
      return Promise.reject('500: Ошибка сервера');
    }
    return Promise.reject('Неизвестная ошибка');
  });
}