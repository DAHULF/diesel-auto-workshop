import { type Language } from "./languages";

const SHOW_TYPES = ["slideFromRight", "slideFromBottom", "scaling", "instant"] as const;
type ShowType = typeof SHOW_TYPES[number];

type DialogSection = {
    section: HTMLElement;
    showType: ShowType;
};

export class Dialog {
    static SECTION_SHOW_TYPES: { [TShow in ShowType]: ShowType } = Object.fromEntries(
        SHOW_TYPES.map((showT) => [showT, showT])
    ) as { [TShow in ShowType]: ShowType };

    #dialog: HTMLDialogElement;
    #sectionContainer: HTMLDivElement;

    #sections: DialogSection[] = [];

    #SHOW_TRANSFORM_VALUES: Map<ShowType, string> = new Map([
        ["slideFromRight", "translateX(100%)"],
        ["slideFromBottom", "translateY(100%)"],
        ["scaling", "scale(0.2)"],
        ["instant", "none"],
    ]);

    #lang: Language = "ru";

    constructor() {
        this.#dialog = document.createElement("dialog");
        this.#dialog.classList.add("page__dialog");

        this.#dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            this.close();
        });

        this.#sectionContainer = document.createElement("div");
        this.#sectionContainer.classList.add("dialog__content");
        this.#dialog.appendChild(this.#sectionContainer);
    }

    getElement(): HTMLDialogElement {
        return this.#dialog;
    }

    setLang(lang: Language): void {
        this.#lang = lang;
    }

    addSection(section: HTMLElement, showType: ShowType = "instant"): void {
        const dialogSection: DialogSection = {
            section, showType
        };

        this.#sections.push(dialogSection);

        const backBtn = dialogSection.section.querySelector<HTMLButtonElement>(".back-btn");
        if (backBtn === null) {
            throw new Error(`Error: Close button not found`);
        }

        backBtn.addEventListener("click", this.close);
    }

    showSection(section: HTMLElement): void {
        const showingSection = this.#sections.find((sec) => sec.section === section);
        if (showingSection === undefined) {
            return;
        }

        this.#sectionContainer.replaceChildren(showingSection.section);

        this.#dialog.style.setProperty(
            "--transform-value",
            this.#SHOW_TRANSFORM_VALUES.get(showingSection.showType) ?? "instant"
        );

        this.#dialog.showModal();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.#dialog.classList.add("page__dialog--opened");
            });
        });
    }

    close = (): void => {
        this.#dialog.classList.remove("page__dialog--opened");

        this.#sectionContainer.addEventListener(
          "transitionend",
          () => {
            this.#dialog.close();
          } ,
          { once: true }
        );
    }

    isOpen(): boolean {
        return this.#dialog.open;
    }
}