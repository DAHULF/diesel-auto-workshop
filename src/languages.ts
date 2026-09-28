export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

export function isLanguage(value: string): value is Language {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}