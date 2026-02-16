// utils.js
import { format, parseISO } from 'date-fns';

export function delay(interval = 300) {
  return new Promise(resolve => setTimeout(resolve, interval));
}

export function formatDateFromAPI(apiDate) {
  // Шведский формат: yyyy-MM-dd hh.mm.ss
  const date = parseISO(apiDate);
  return format(date, 'yyyy-MM-dd hh.mm.ss');
}

export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}