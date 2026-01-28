import { escapeHtml } from './utils.js';

export function renderComments(comments, container) {
  const commentsHtml = comments.map((comment, index) => {
    let likeButtonClass = 'like-button';
    if (comment.isLiked) {
      likeButtonClass += ' -active-like';
    }
    if (comment.isLikeLoading) {
      likeButtonClass += ' -loading-like';
    }

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
            <div class="comment-text">
              ${escapeHtml(comment.text)}
            </div>
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

  container.innerHTML = commentsHtml;
}

export function renderAddForm(isLoading, formData, container) {
  if (isLoading) {
    container.innerHTML = `
      <div class="loading">
        <div class="loading-text">Комментарий добавляется...</div>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="add-form">
        <input
          id="input-name"
          type="text"
          class="add-form-name"
          placeholder="Введите ваше имя"
          value="${escapeHtml(formData.name)}"
        />
        <textarea
          id="input-comment"
          type="textarea"
          class="add-form-text"
          placeholder="Введите ваш комментарий"
          rows="4"
        >${escapeHtml(formData.text)}</textarea>
        <div class="add-form-row">
          <button id="button" class="add-form-button">Написать</button>
        </div>
      </div>`;
  }
}