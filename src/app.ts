import { type Language } from "./languages";

interface PageInterface {
    getElement(): HTMLDivElement;
    setLang(lang: Language): void;
}

export class App {
    #page: PageInterface;

    constructor(page: PageInterface) {
        this.#page = page;

        const app = document.querySelector<HTMLDivElement>("#app");

        if (app === null) {
            throw new Error("Error: div 'app' not found");
        }

        app.replaceChildren(this.#page.getElement());
    }
}