export const normalizeEnum = (str: string) =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default normalizeEnum;
