import { fetchComments, postComment } from './api.js';
import { 
  renderComments, 
  renderAddForm, 
  renderAuthPrompt, 
  renderLoginPage, 
  renderRegisterPage 
} from './render.js';
import { 
  getComments, setComments, getFormData, setFormData,
  getIsLoading, setIsLoading,
  toggleLike, enableEditMode, saveComment, replyToComment,
  updateButtonState, validateForm
} from './comments.js';
import { initAuth, getIsAuthenticated, getCurrentUser } from './auth.js';
import { initLoginListeners, initRegisterListeners } from './loginPage.js'; 

const appElement = document.getElementById('app');

// Инициализация обработчиков событий на комментариях
function initEventListeners() {
  const commentsEl = document.getElementById('comments');
  if (!commentsEl) return;

  // Лайки
  commentsEl.addEventListener('click', (event) => {
    const likeButton = event.target.closest('.like-button');
    if (likeButton) {
      event.stopPropagation();
      const index = parseInt(likeButton.getAttribute('data-index'));
      if (!isNaN(index)) {
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

  // Редактирование
  commentsEl.addEventListener('click', function (event) {
    const editButton = event.target.closest('.edit-button');
    if (editButton) {
      event.stopPropagation();
      if (!getIsAuthenticated()) {
        alert('Чтобы редактировать комментарии, необходимо авторизоваться');
        return;
      }
      const index = parseInt(editButton.getAttribute('data-index'));
      if (!isNaN(index)) {
        enableEditMode(index);
        renderComments(getComments(), commentsEl);
        initEventListeners();
      }
    }
  });

  // Сохранение редактирования
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

  // Ответ на комментарий
  commentsEl.addEventListener('click', function (event) {
    if (event.target.closest('.like-button') ||
        event.target.closest('.edit-button') ||
        event.target.closest('.save-button') ||
        event.target.closest('.edit-textarea')) {
      return;
    }
    
    if (event.target.closest('.comment')) {
      if (!getIsAuthenticated()) {
        alert('Чтобы ответить на комментарий, необходимо авторизоваться');
        return;
      }
      
      const commentCard = event.target.closest('.comment');
      const index = parseInt(commentCard.getAttribute('data-index'));
      const comments = getComments();
      if (!isNaN(index) && !comments[index].isEdit) {
        replyToComment(index);
        fetchAndRenderComments();
      }
    }
  });

  // Обработчик для кнопки "Авторизоваться"
  const authButton = document.getElementById('auth-button');
  if (authButton) {
    authButton.addEventListener('click', () => {
      appElement.innerHTML = renderLoginPage();
      import('./loginPage.js').then(({ initLoginListeners }) => {
        initLoginListeners(fetchAndRenderComments);
      });
    });
  }
}

// Настройка обработчиков формы добавления
function setupFormListeners() {
  const inputNameEl = document.getElementById('input-name');
  const inputCommentEl = document.getElementById('input-comment');
  const buttonEl = document.getElementById('button');

  if (inputNameEl && inputCommentEl && buttonEl) {
    if (getIsAuthenticated()) {
      inputNameEl.readOnly = true;
    }

    const newButton = buttonEl.cloneNode(true);
    buttonEl.parentNode.replaceChild(newButton, buttonEl);
    newButton.addEventListener('click', addCommentViaAPI);

    inputNameEl.addEventListener('input', handleNameInput);
    inputCommentEl.addEventListener('input', handleCommentInput);

    updateButtonState();
  }
}

function handleNameInput(e) {
  const formData = getFormData();
  formData.name = e.target.value;
  setFormData(formData);
  updateButtonState();
}

function handleCommentInput(e) {
  const formData = getFormData();
  formData.text = e.target.value;
  setFormData(formData);
  updateButtonState();
}

// Отправка комментария
function addCommentViaAPI() {
  if (!getIsAuthenticated()) {
    alert('Чтобы добавить комментарий, необходимо авторизоваться');
    fetchAndRenderComments();
    return;
  }

  const validationResult = validateForm();
  if (!validationResult) return;

  setIsLoading(true);
  
  // Индикатор загрузки
  const formData = getFormData();
  const commentsHtml = renderComments(getComments());
  appElement.innerHTML = `
    <div class="container">
      <ul id="comments" class="comments">${commentsHtml}</ul>
      <div id="add-form-container">
        ${renderAddForm(true, formData, true)}
      </div>
    </div>
  `;

  postComment(validationResult.name, validationResult.text)
    .then(() => {
      setFormData({ name: getCurrentUser().name, text: '' });
      setIsLoading(false);
      return fetchAndRenderComments();
    })
    .catch((error) => {
      console.error("Ошибка отправки комментария", error);
      setIsLoading(false);
      
      if (error.includes('401')) {
        alert('Необходима авторизация');
      } else if (error.includes('400')) {
        alert('Имя и комментарий должны содержать минимум 3 символа');
      } else if (error.includes('500')) {
        alert('Ошибка сервера. Попробуйте позже');
      } else {
        alert('Не удалось отправить комментарий');
      }
      
      return fetchAndRenderComments();
    });
}

// Загрузка и отрисовка комментариев
export function fetchAndRenderComments() {
  return fetchComments()
    .then((fetchedComments) => {
      setComments(fetchedComments);
      const commentsHtml = renderComments(getComments());
      const formData = getFormData();
      
      let contentHtml;
      if (getIsAuthenticated()) {
        contentHtml = `
          <div class="container">
            <ul id="comments" class="comments">${commentsHtml}</ul>
            <div id="add-form-container">
              ${renderAddForm(getIsLoading(), formData, true)}
            </div>
          </div>
        `;
      } else {
        contentHtml = `
          <div class="container">
            <ul id="comments" class="comments">${commentsHtml}</ul>
            <div id="add-form-container">
              ${renderAuthPrompt()}
            </div>
          </div>
        `;
      }
      
      appElement.innerHTML = contentHtml;
      initEventListeners();
      
      if (getIsAuthenticated()) {
        setupFormListeners();
      }
      
      return true;
    })
    .catch((error) => {
      console.error('Ошибка загрузки комментариев:', error);
      return false;
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const isAuth = initAuth();
  
  if (isAuth) {
    const user = getCurrentUser();
    setFormData({ name: user.name, text: '' });
    fetchAndRenderComments();
  } else {
    fetchAndRenderComments();
  }
});