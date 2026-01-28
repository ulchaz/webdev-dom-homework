import { formatDateFromAPI } from './utils.js';

const BASE_URL = "https://wedev-api.sky.pro/api/v1/julia-esaulkova";

export function fetchComments() {
  return fetch(`${BASE_URL}/comments`, {
    method: "GET"
  })
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 500) {
      return Promise.reject('Ошибка сервера 500 при загрузке комментариев');
    } else {
      return Promise.reject('Неизвестная ошибка при загрузке комментариев');
    }
  })
  .then((responseData) => {
    return responseData.comments.map((comment) => {
      return {
        name: comment.author.name,
        date: formatDateFromAPI(comment.date),
        text: comment.text,
        isLiked: false,
        likes: 0,
        isEdit: false,
        isLikeLoading: false,
      };
    });
  });
}

export function postComment(name, text) {
  return fetch(`${BASE_URL}/comments`, {
    method: "POST",
    body: JSON.stringify({
      name: name,
      text: text,
    })
  })
  .then((response) => {
    if (response.status === 201 || response.status === 200) {
      return response.json();
    } else if (response.status === 400) {
      return Promise.reject('400: Имя и комментарий должны содержать минимум 3 символа');
    } else if (response.status === 500) {
      return Promise.reject('500: Ошибка сервера');
    } else {
      return Promise.reject('Неизвестная ошибка сервера');
    }
  });
}