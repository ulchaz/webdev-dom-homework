import { setToken, loginUser, registerUser } from './api.js';

let isAuthenticated = false;
let currentUser = null;

export function getIsAuthenticated() {
  return isAuthenticated;
}

export function getCurrentUser() {
  return currentUser;
}

export function setAuth(token, user) {
  setToken(token);
  isAuthenticated = true;
  currentUser = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  setToken(null);
  isAuthenticated = false;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function initAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    setToken(token);
    isAuthenticated = true;
    currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

export function register({ login, name, password }) {
  return registerUser({ login, name, password });
}

export function login({ login, password }) {
  return loginUser({ login, password });
}