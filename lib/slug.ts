import { customAlphabet } from 'nanoid';
export const makeSlug = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);
