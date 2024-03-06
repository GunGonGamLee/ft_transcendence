export default function deepCopy(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item));
  } else if (isObject(obj)) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = deepCopy(obj[key]);
      return acc;
    }, {});
  } else {
    return obj;
  }
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
