export const saveCache = (key: string, data: any) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    })
  );
};

export const loadCache = (key: string) => {
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};