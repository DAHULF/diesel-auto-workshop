export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

export function isLanguage(value: string): value is Language {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export type LangItem = {
	[Lang in Language]: string;
};

export function isLangItem(value: unknown): value is LangItem {
    const isLangItem =
        typeof value === "object"
        && value !== null
        && Object.keys(value).every((key) => SUPPORTED_LANGUAGES.some((lang) => lang === key));

    return isLangItem;
}

export type TextContentItem = {
    element: string;
    attribute?: string;
} & {
	[Lang in Language as `${Lang}-lang`]: string;
};

export function translate(transElement: Element | Document, textContentMap: TextContentItem[], lang: Language): void {
    textContentMap.forEach((item) => {
        const element = transElement.querySelector(item.element);
        if (element === null) {
            return;
        }

        if (item.attribute === undefined) {
            element.textContent = item[`${lang}-lang`];
        } else {
            element.setAttribute(item.attribute, item[`${lang}-lang`]);
        }
    });
}