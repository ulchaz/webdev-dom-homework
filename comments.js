import { delay } from './utils.js';

const state = {
  serverComments: [],
  localState: new Map(),
  formData: { name: '', text: '' },
  isLoading: false
};

export function getComments() {
  return state.serverComments.map(comment => {
    const local = state.localState.get(comment.id) || {
      isLiked: false,
      likes: comment.likes || 0,
      isEdit: false,
      isLikeLoading: false
    };
    
    return {
      ...comment,
      ...local
    };
  });
}

export function setComments(newServerComments) {
  state.serverComments = newServerComments;
  
  newServerComments.forEach(serverComment => {
    const existingLocal = state.localState.get(serverComment.id);
    
    if (!existingLocal) {
      state.localState.set(serverComment.id, {
        isLiked: false,
        likes: serverComment.likes || 0,
        isEdit: false,
        isLikeLoading: false
      });
    } else {
      existingLocal.likes = serverComment.likes || existingLocal.likes;
      state.localState.set(serverComment.id, existingLocal);
    }
  });
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
  const comment = state.serverComments[index];
  if (!comment) return Promise.resolve();

  const localState = state.localState.get(comment.id) || {
    isLiked: false,
    likes: 0,
    isLikeLoading: false
  };

  if (localState.isLikeLoading) return Promise.resolve();

  const willBeLiked = !localState.isLiked;

  localState.isLikeLoading = true;
  localState.isLiked = willBeLiked;
  localState.likes = willBeLiked ? localState.likes + 1 : Math.max(0, localState.likes - 1);
  
  state.localState.set(comment.id, localState);

  return delay(300).then(() => {
    localState.isLikeLoading = false;
    state.localState.set(comment.id, localState);
  });
}

export function enableEditMode(index) {
  const comment = state.serverComments[index];
  if (!comment) return;

  state.localState.forEach((local, id) => {
    local.isEdit = false;
    state.localState.set(id, local);
  });
  
  const localState = state.localState.get(comment.id) || {
    isLiked: false,
    likes: 0,
    isEdit: false,
    isLikeLoading: false
  };
  
  localState.isEdit = true;
  state.localState.set(comment.id, localState);
}

export function saveComment(index, newText) {
  const comment = state.serverComments[index];
  if (comment && newText.trim()) {
    comment.text = newText.trim();
    
    const localState = state.localState.get(comment.id);
    if (localState) {
      localState.isEdit = false;
      state.localState.set(comment.id, localState);
    }
    
    return delay(300);
  }
}

export function replyToComment(index) {
  const comment = state.serverComments[index];
  if (comment) {
    state.formData.text = '>' + comment.text + '\n\n' + comment.name + ', ';
  }
}

export function updateButtonState() {
  const inputNameEl = document.getElementById('input-name');
  const inputCommentEl = document.getElementById('input-comment');
  const buttonEl = document.getElementById('button');
  
  if (inputNameEl && inputCommentEl && buttonEl) {
    buttonEl.disabled = !inputNameEl.value.trim() || !inputCommentEl.value.trim();
  }
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