export function formatDate(value) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function statusClassName(status) {
  return status === 'published' ? 'badge badge-published' : 'badge badge-draft';
}
