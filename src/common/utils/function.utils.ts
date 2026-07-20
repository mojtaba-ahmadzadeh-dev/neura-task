export const deleteInvalidPropertyObject = <T extends Record<string, any>>(
  data: T,
  blackList: any[] = [],
): T => {
  (Object.keys(data) as (keyof T)[]).forEach((key) => {
    let value = data[key];

    if (typeof value === "string") {
      value = value.trim();
      data[key] = value;
    }

    if (value === undefined || value === null) {
      Reflect.deleteProperty(data, key);
      return;
    }

    if (typeof value === "string" && value === "") {
      Reflect.deleteProperty(data, key);
      return;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
      Reflect.deleteProperty(data, key);
      return;
    }

    if (blackList.includes(value)) {
      Reflect.deleteProperty(data, key);
      return;
    }
  });

  return data;
};
