import { type Language, type LangItem } from "../languages";
import { renderIcons } from "../icons";

import "./notifyer.css"

type NotifyData = {
    text: LangItem;
    icon: string;
};

export class Notifyer {
    #element: HTMLElement;

    #notifyData: NotifyData | null = null;

    #lang: Language = "ru";

    constructor() {
        this.#element = document.createElement("section");
        this.#element.classList.add("dialog__section-notifyer");

        this.#element.innerHTML = `
            <button type="button" class="back-btn" data-full-close>
                <span>Назад</span>
            </button>

            <div class="notifyer__content">
                <p></p>

                <div class="notifyer__icon-container"></div>
            </div>
        `;
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    setLang(lang: Language) {
        this.#lang = lang;

        this.#renderData();
    }

    setNotifyData(data: NotifyData): void {
        this.#notifyData = data;
        this.#renderData();
    }

    #renderData(): void {
        const textElement = this.#element.querySelector<HTMLParagraphElement>(".notifyer__content p");
        if (textElement === null) {
            throw new Error(`Error: Notify text paragraph not found.`);
        }
        textElement.textContent = this.#notifyData?.text[this.#lang] ?? "";

        const iconContainer = this.#element.querySelector<HTMLDivElement>(".notifyer__icon-container");
        if (iconContainer === null) {
            throw new Error(`Error: Notify icon container not found.`);
        }

        const notifyIcon = document.createElement("i");
        notifyIcon.dataset.lucide = this.#notifyData?.icon;

        iconContainer.replaceChildren(notifyIcon);

        renderIcons();
    }
}