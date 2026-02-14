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

  const newCommentsEl = commentsEl.cloneNode(true);
  commentsEl.parentNode.replaceChild(newCommentsEl, commentsEl);

  newCommentsEl.addEventListener('click', function(event) {
    const target = event.target;

    // Обработка лайков
    const likeButton = target.closest('.like-button');
    if (likeButton) {
      event.preventDefault();
      event.stopPropagation();
      
      const index = likeButton.dataset.index;
      if (index !== undefined) {
        handleLike(parseInt(index));
      }
      return;
    }

    // Обработка редактирования
    const editButton = target.closest('.edit-button');
    if (editButton) {
      event.preventDefault();
      event.stopPropagation();
      
      const index = editButton.dataset.index;
      if (!getIsAuthenticated()) {
        alert('Авторизуйтесь для редактирования');
        return;
      }
      
      if (index !== undefined) {
        handleEdit(parseInt(index));
      }
      return;
    }

    // Обработка сохранения
    const saveButton = target.closest('.save-button');
    if (saveButton) {
      event.preventDefault();
      event.stopPropagation();
      
      const index = saveButton.dataset.index;
      if (index !== undefined) {
        handleSave(parseInt(index));
      }
      return;
    }

    // Обработка ответа на комментарий
    const commentCard = target.closest('.comment');
    if (commentCard && !target.closest('button') && !target.closest('textarea')) {
      event.preventDefault();
      
      if (!getIsAuthenticated()) {
        alert('Авторизуйтесь для ответа на комментарий');
        return;
      }
      
      const index = commentCard.dataset.index;
      if (index !== undefined && !commentCard.querySelector('.edit-textarea')) {
        handleReply(parseInt(index));
      }
    }
  });

  // Обработчик для кнопки авторизации
  const authButton = document.getElementById('auth-button');
  if (authButton) {
    const newAuthButton = authButton.cloneNode(true);
    authButton.parentNode.replaceChild(newAuthButton, authButton);
    
    newAuthButton.addEventListener('click', () => {
      appElement.innerHTML = renderLoginPage();
      import('./loginPage.js').then(({ initLoginListeners }) => {
        initLoginListeners(fetchAndRenderComments);
      });
    });
  }
}

function handleReply(index) {
  replyToComment(index);
  
  const formData = getFormData();
  const textarea = document.getElementById('input-comment');
  if (textarea) {
    textarea.value = formData.text;
  }
  

  const formContainer = document.getElementById('add-form-container');
  if (formContainer) {
    formContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

// Обработка лайка
async function handleLike(index) {
  try {
    await toggleLike(index);
    
    const currentComments = getComments();
    const commentsHtml = renderComments(currentComments);
    const commentsEl = document.getElementById('comments');
    
    if (commentsEl) {
      commentsEl.outerHTML = `<ul id="comments" class="comments">${commentsHtml}</ul>`;
    }
    
    initEventListeners();
  } catch (error) {
    console.error('Ошибка лайка:', error);
  }
}

// Обработка редактирования
function handleEdit(index) {
  enableEditMode(index);
  
  const currentComments = getComments();
  const commentsHtml = renderComments(currentComments);
  const commentsEl = document.getElementById('comments');
  
  if (commentsEl) {
    commentsEl.outerHTML = `<ul id="comments" class="comments">${commentsHtml}</ul>`;
  }
  
  initEventListeners();
}

// Обработка сохранения
function handleSave(index) {
  const textarea = document.querySelector(`.edit-textarea[data-index="${index}"]`);
  if (textarea && textarea.value.trim()) {
    saveComment(index, textarea.value);
    
    const updatedComments = getComments();
    const commentsHtml = renderComments(updatedComments);
    const commentsEl = document.getElementById('comments');
    
    if (commentsEl) {
      commentsEl.outerHTML = `<ul id="comments" class="comments">${commentsHtml}</ul>`;
    }
    
    initEventListeners();
  } else {
    alert('Комментарий не может быть пустым');
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
      
      const commentsWithLocalState = getComments();
      const commentsHtml = renderComments(commentsWithLocalState);
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
      
      setTimeout(() => {
        initEventListeners();
        if (getIsAuthenticated()) {
          setupFormListeners();
        }
      }, 50);
      
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
  }
  
  fetchAndRenderComments();
});
