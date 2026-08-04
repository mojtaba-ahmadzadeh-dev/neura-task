export const deleteInvalidPropertyObject = <T extends object>(
  data: T = {} as T,
  blackList: unknown[] = [],
): void => {
  const nullList: unknown[] = [undefined, null, '', ' ', NaN, 0, false];

  (Object.keys(data) as Array<keyof T>).forEach((key) => {
    const value = data[key];

    if (blackList.includes(value)) {
      delete data[key];
      return;
    }

    if (typeof value === 'string') {
      (data as Record<keyof T, unknown>)[key] = value.trim();
    }

    if (nullList.includes(data[key])) {
      delete data[key];
    }
  });
};
