import { delay } from './utils.js';

const state = {
  comments: [],
  formData: { name: '', text: '' },
  isLoading: false
};

export function getComments() {
  return state.comments;
}

export function setComments(newComments) {
  state.comments = newComments;
}

export function getFormData() {
  return state.formData;
}

export function setFormData(data) {
  Object.assign(state.formData, data);
}

export function getIsLoading() {
  return state.isLoading;
}

export function setIsLoading(value) {
  state.isLoading = value;
}

export function toggleLike(index) {
  const comments = getComments();
  const comment = comments[index];
  if (comment.isLikeLoading) return Promise.resolve();

  const willBeLiked = !comment.isLiked;
  const updatedComments = comments.map((c, i) => 
    i === index ? { ...c, isLikeLoading: true } : c
  );
  setComments(updatedComments);

  return delay(1000).then(() => {
    const finalComments = getComments().map((c, i) => {
      if (i === index) {
        return {
          ...c,
          isLiked: willBeLiked,
          likes: willBeLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          isLikeLoading: false
        };
      }
      return c;
    });
    setComments(finalComments);
  });
}

export function enableEditMode(index) {
  state.comments.forEach(c => c.isEdit = false);
  state.comments[index].isEdit = true;
}

export function saveComment(index, newText) {
  if (newText.trim()) {
    state.comments[index].text = newText.trim();
  }
  state.comments[index].isEdit = false;
}

export function replyToComment(index) {
  const comment = state.comments[index];
  state.formData.text = '>' + comment.text + '\n\n' + comment.name + ', ';
}

export function updateButtonState() {
  const inputNameEl = document.getElementById('input-name');
  const inputCommentEl = document.getElementById('input-comment');
  const buttonEl = document.getElementById('button');
  if (!inputNameEl || !inputCommentEl || !buttonEl) return;
  
  buttonEl.disabled = !inputNameEl.value.trim() || !inputCommentEl.value.trim();
}

export function validateForm() {
  const inputNameEl = document.getElementById('input-name');
  const inputCommentEl = document.getElementById('input-comment');
  if (!inputNameEl || !inputCommentEl) return false;

  const nameValue = inputNameEl.value.trim();
  const commentValue = inputCommentEl.value.trim();

  if (nameValue.length < 3) {
    alert('Имя должно содержать минимум 3 символа');
    return false;
  }
  if (commentValue.length < 3) {
    alert('Комментарий должен содержать минимум 3 символа');
    return false;
  }

  return { name: nameValue, text: commentValue };
}