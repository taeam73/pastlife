import strings from './ja.json';
import { english } from './en';

export const japanese = strings as Record<keyof typeof english, string>;
