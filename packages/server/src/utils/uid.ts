import { v7 as uuid } from "uuid";

export const uid = (prefix: string) => {
  return `${prefix}_${uuid()}`;
};
