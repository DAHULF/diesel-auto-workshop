const SHOW_TYPES = ["slideFromRight", "slideFromBottom", "scaling", "instant"] as const;
type ShowType = typeof SHOW_TYPES[number];

function isShowType(value: string): value is ShowType {
    return SHOW_TYPES.some((type) => type === value);
}

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

    #sectionsHistory: HTMLElement[] = [];

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

    addSection(section: HTMLElement, showType: string = "instant"): void {
        if (!isShowType(showType)) {
            throw new Error(`Error: Show type "${showType}" not found.`);
        }

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
        if (this.#dialog.classList.contains("page__dialog--opened")) {
            const currentSection = this.#sectionContainer.querySelector("section");
            if (currentSection === null) {
                return;
            }

            this.#sectionsHistory.push(currentSection);
            this.#dialog.classList.remove("page__dialog--opened");

            this.#afterContentTransition(() => {
                this.showSection(section);
            });

            return;
        }

        const showingSection = this.#sections.find((sec) => sec.section === section);
        if (showingSection === undefined) {
            return;
        }

        this.#sectionContainer.classList.add("dialog__content--preparing");

        this.#sectionContainer.replaceChildren(showingSection.section);

        this.#dialog.style.setProperty(
            "--transform-value",
            this.#SHOW_TRANSFORM_VALUES.get(showingSection.showType) ?? "instant"
        );

        if (!this.#dialog.open) {
            this.#dialog.showModal();
        }

        void this.#sectionContainer.offsetHeight;
        this.#sectionContainer.classList.remove("dialog__content--preparing");
        void this.#sectionContainer.offsetHeight;

        requestAnimationFrame(() => {
            this.#dialog.classList.add("page__dialog--opened");
        });
    }

    close = (): void => {
        this.#dialog.classList.remove("page__dialog--opened");

        this.#afterContentTransition(() => {
            if (this.#sectionsHistory.length === 0) {
                this.#dialog.close();
            } else {
                this.showSection(this.#sectionsHistory.pop()!);
            }
        });
    }

    isOpen(): boolean {
        return this.#dialog.open;
    }

    #afterContentTransition(callback: () => void): void {
        const handler = (event: TransitionEvent): void => {
            if (event.target !== this.#sectionContainer || event.propertyName !== "transform") {
                return;
            }

            this.#sectionContainer.removeEventListener("transitionend", handler);

            callback();
        }

        this.#sectionContainer.addEventListener("transitionend", handler);
    }
}