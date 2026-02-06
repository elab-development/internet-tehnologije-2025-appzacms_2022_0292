export function getLayoutClass(template, key, fallback = '') {
  return template?.config?.layout?.[key] || fallback;
}

export function getStyleClass(template, type, fallback = '') {
  const styles = template?.config?.styles || {};
  const v = styles[type];
  if (typeof v === 'string') return v;
  return fallback;
}

export function getHeadingClass(template, level) {
  const v = template?.config?.styles?.heading;
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v[`h${level}`] || '';
}
