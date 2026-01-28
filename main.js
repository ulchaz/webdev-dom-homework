// main.js
import { fetchComments, postComment } from './api.js';
import { renderComments, renderAddForm } from './render.js';
import { 
  getComments, setComments, getFormData, setFormData,
  getIsLoading, setIsLoading,
  toggleLike, enableEditMode, saveComment, replyToComment,
  updateButtonState, validateForm
} from './comments.js';

const commentsEl = document.getElementById('comments');
const deleteButtonEl = document.getElementById('delete-button');
const addFormContainer = document.getElementById('add-form-container');

function initEventListeners() {
  //const comments = getComments();
  
  // Кнопки лайка
  commentsEl.addEventListener('click', (event) => {
    const likeButton = event.target.closest('.like-button');
    if (likeButton) {
      event.stopPropagation();
      const index = parseInt(likeButton.getAttribute('data-index'));
      if (!isNaN(index)) {
       // const currentComments = getComments();

        const promise = toggleLike(index);

        renderComments(getComments(), commentsEl);

        if (promise && typeof promise.then === 'function') {
            promise.then(() => {
                renderComments(getComments(), commentsEl);
            });
        }
      }
    }
  });

  // Кнопки редактирования
  commentsEl.addEventListener('click', function (event) {
    const editButton = event.target.closest('.edit-button');
    if (editButton) {
      event.stopPropagation();
      const index = parseInt(editButton.getAttribute('data-index'));
      if (!isNaN(index)) {
        enableEditMode(index);
        renderComments(getComments(), commentsEl);
      }
    }
  });

  // Кнопки сохранения
  commentsEl.addEventListener('click', function (event) {
    const saveButton = event.target.closest('.save-button');
    if (saveButton) {
      event.stopPropagation();
      const index = parseInt(saveButton.getAttribute('data-index'));
      if (!isNaN(index)) {
        const textarea = document.querySelector(`.edit-textarea[data-index="${index}"]`);
        if (textarea) {
          saveComment(index, textarea.value);
          renderComments(getComments(), commentsEl);
          initEventListeners();
        }
      }
    }
  });

  // Ответы на комментарии
  commentsEl.addEventListener('click', function (event) {
    if (event.target.closest('.like-button') ||
        event.target.closest('.edit-button') ||
        event.target.closest('.save-button') ||
        event.target.closest('.edit-textarea')) {
      return;
    }
    if (event.target.closest('.comment')) {
      const commentCard = event.target.closest('.comment');
      const index = parseInt(commentCard.getAttribute('data-index'));
      const comments = getComments();
      if (!isNaN(index) && !comments[index].isEdit) {
        replyToComment(index);
        renderAddForm(getIsLoading(), getFormData(), addFormContainer);
        setupFormListeners();
      }
    }
  });
}

function setupFormListeners() {
  const inputNameEl = document.getElementById('input-name');
  const inputCommentEl = document.getElementById('input-comment');
  const buttonEl = document.getElementById('button');

  if (inputNameEl && inputCommentEl && buttonEl) {
    buttonEl.addEventListener('click', addCommentViaAPI);

    inputNameEl.addEventListener('input', function (e) {
      const formData = getFormData();
      formData.name = e.target.value;
      setFormData(formData);
      updateButtonState();
    });
    
    inputCommentEl.addEventListener('input', function (e) {
      const formData = getFormData();
      formData.text = e.target.value;
      setFormData(formData);
      updateButtonState();
    });

    updateButtonState();
    
    const handleEnterKey = (e) => {
      if (e.key === 'Enter' && !getIsLoading() && !buttonEl.disabled) {
        addCommentViaAPI();
      }
    };
    
    inputNameEl.addEventListener('keyup', handleEnterKey);
    inputCommentEl.addEventListener('keyup', handleEnterKey);
  }
}

function addCommentViaAPI() {
  const validationResult = validateForm();
  if (!validationResult) return;

  setIsLoading(true);
  renderAddForm(getIsLoading(), getFormData(), addFormContainer);

  postComment(validationResult.name, validationResult.text)
    .then(() => {
      return fetchAndRenderComments();
    })
    .then(() => {
      setFormData({ name: '', text: '' });
      setIsLoading(false);
      renderAddForm(getIsLoading(), getFormData(), addFormContainer);
      setupFormListeners();
    })
    .catch((error) => {
      console.error("Ошибка отправки комментария", error);

      setIsLoading(false);

      if (error === 'Failed to fetch' || 
          error.message === 'NetworkError when attempting to fetch resource' ||
          (error.message && error.message.includes('NetworkError')) ||
          (error.message && error.message.includes('Failed to fetch'))) {
        alert('Нет соединения с интернетом. Попробуйте позже.');
      } else if (error === '400: Имя и комментарий должны содержать минимум 3 символа' || 
                (error.message && error.message.includes('400'))) {
        alert('Ошибка 400: Слишком короткое имя или комментарий. Минимум 3 символа.');
      } else if (error === '500: Ошибка сервера' || 
                (error.message && error.message.includes('500'))) {
        alert('Ошибка сервера 500. Комментарий не отправлен. Попробуйте позже.');
      } else {
        alert('Не удалось отправить комментарий. Попробуйте позже');
      }

      renderAddForm(getIsLoading(), getFormData(), addFormContainer);
      setupFormListeners();
    });
}

function fetchAndRenderComments() {
  return fetchComments()
    .then((fetchedComments) => {
      setComments(fetchedComments);
      renderComments(getComments(), commentsEl);
      initEventListeners();
    })
    .catch((error) => {
      console.error('Ошибка загрузки комментариев:', error);

      if (error === 'Ошибка сервера 500 при загрузке комментариев') {
        alert('Ошибка сервера 500 при загрузке комментариев. Попробуйте позже.');
      } else if (error === 'Failed to fetch' || error.message === 'Failed to fetch') {
        alert('Нет соединения с интернетом. Проверьте соединение и попробуйте снова'); 
      } else {
        alert('Не удалось загрузить комментарии. Попробуйте позже');
      }
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  renderAddForm(getIsLoading(), getFormData(), addFormContainer);
  setupFormListeners();
  fetchAndRenderComments();

  // Обработчик Enter
  document.addEventListener('keyup', function(e) {
    if (e.key === 'Enter' && !getIsLoading()) {
      const buttonEl = document.getElementById('button');
      if (buttonEl && !buttonEl.disabled) {
        addCommentViaAPI();
      }
    }
  });

  // Удаление последнего комментария
  deleteButtonEl.addEventListener('click', () => {
    const comments = getComments();
    if (comments.length > 0) {
      comments.pop();
      setComments([...comments]);
      renderComments(getComments(), commentsEl);
      initEventListeners();
    }
  });
});