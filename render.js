import { escapeHtml } from './utils.js';

export function renderComments(comments) {
  return comments.map((comment, index) => {
    let likeButtonClass = 'like-button';
    if (comment.isLiked) likeButtonClass += ' -active-like';
    if (comment.isLikeLoading) likeButtonClass += ' -loading-like';

    if (comment.isEdit) {
      return `
        <li class="comment" data-index="${index}">
          <div class="comment-header">
            <div>${escapeHtml(comment.name)}</div>
            <div>${comment.date}</div>
          </div>
          <div class="comment-body">
            <textarea class="edit-textarea" data-index="${index}">${escapeHtml(comment.text)}</textarea>
          </div>
          <div class="comment-footer">
            <button class="save-button" data-index="${index}">Сохранить</button>
            <div class="likes">
              <span class="likes-counter">${comment.likes}</span>
              <button class="${likeButtonClass}" data-index="${index}"${comment.isLikeLoading ? 'disabled' : ''}></button>
            </div>
          </div>
        </li>
      `;
    } else {
      return `
        <li class="comment" data-index="${index}">
          <div class="comment-header">
            <div>${escapeHtml(comment.name)}</div>
            <div>${comment.date}</div>
          </div>
          <div class="comment-body">
            <div class="comment-text">${escapeHtml(comment.text)}</div>
          </div>
          <div class="comment-footer">
            <button class="edit-button" data-index="${index}">Редактировать</button>
            <div class="likes">
              <span class="likes-counter">${comment.likes}</span>
              <button class="${likeButtonClass}" data-index="${index}"${comment.isLikeLoading ? 'disabled' : ''}></button>
            </div>
          </div>
        </li>
      `;
    }
  }).join('');
}

export function renderAddForm(isLoading, formData, isNameReadOnly = false) {
  if (isLoading) {
    return `<div class="loading"><div class="loading-text">Комментарий добавляется...</div></div>`;
  }
  
  return `
    <div class="add-form">
      <input id="input-name" type="text" class="add-form-name" placeholder="Введите ваше имя"
        value="${escapeHtml(formData?.name || '')}" ${isNameReadOnly ? 'readonly' : ''} />
      <textarea id="input-comment" class="add-form-text" placeholder="Введите ваш комментарий" rows="4">${escapeHtml(formData?.text || '')}</textarea>
      <div class="add-form-row">
        <button id="button" class="add-form-button">Написать</button>
      </div>
    </div>
  `;
}

export function renderAuthPrompt() {
  return `
    <div class="auth-prompt">
      <p class="auth-prompt-text">Чтобы добавить комментарий, необходимо авторизоваться</p>
      <button id="auth-button" class="auth-prompt-button">Авторизоваться</button>
    </div>
  `;
}

export function renderLoginPage() {
  return `
    <div class="container">
      <div class="auth" id="auth">
        <h2 class="auth-header">Форма входа</h2>
        <div class="auth-input-form">
          <input type="text" class="auth-input auth-input-login" id="login-input" placeholder="Логин">
          <input type="password" class="auth-input auth-input-password" id="password-input" placeholder="Пароль">
          <button class="auth-button" id="login-button">Войти</button>
          <p class="auth-text" id="switch-to-register">Зарегистрироваться</p>
        </div>
      </div>
    </div>
  `;
}

export function renderRegisterPage() {
  return `
    <div class="container">
      <div class="auth" id="auth">
        <h2 class="auth-header">Форма регистрации</h2>
        <div class="auth-input-form">
          <input type="text" class="auth-input auth-input-login" id="reg-login" placeholder="Логин">
          <input type="text" class="auth-input auth-input-name" id="reg-name" placeholder="Имя">
          <input type="password" class="auth-input auth-input-password" id="reg-password" placeholder="Пароль">
          <button class="auth-button" id="register-button">Зарегистрироваться</button>
          <p class="auth-text" id="switch-to-login">Войти</p>
        </div>
      </div>    
    </div>
  `;
}