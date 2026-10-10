import "./dialog.css";

const SHOW_TYPES = ["slideFromRight", "slideFromBottom", "scaling", "instant"] as const;
export type ShowType = typeof SHOW_TYPES[number];

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
    #isTransitioning = false;

    constructor() {
        this.#dialog = document.createElement("dialog");
        this.#dialog.classList.add("page__dialog");

        this.#dialog.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || event.repeat) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            this.close();
        }, {
            capture: true
        });

        this.#dialog.addEventListener("cancel", (event) => {
            if (
                event.target !== this.#dialog ||
                !event.cancelable
            ) {
                return;
            }

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

    showSection(section: HTMLElement, onShown?: () => void): void {
        if (this.#dialog.classList.contains("page__dialog--opened")) {
            if (this.#isTransitioning) {
                return;
            }

            const currentSection = this.#sectionContainer.querySelector("section");
            if (currentSection === null) {
                return;
            }

            this.#isTransitioning = true;
            this.#sectionsHistory.push(currentSection);
            this.#dialog.classList.remove("page__dialog--opened");

            this.#afterContentTransition(() => {
                this.#isTransitioning = false;
                this.showSection(section, onShown);
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
            const doc = document.documentElement;
            const scrollbarWidth = window.innerWidth - doc.clientWidth;

            doc.style.setProperty(
                "--scrollbar-width",
                `${scrollbarWidth}px`
            );

            doc.classList.add("dialog-open");

            this.#dialog.showModal();
        }

        void this.#sectionContainer.offsetHeight;
        this.#sectionContainer.classList.remove("dialog__content--preparing");
        void this.#sectionContainer.offsetHeight;

        requestAnimationFrame(() => {
            this.#dialog.classList.add("page__dialog--opened");
            onShown?.();
        });
    }

    close = (event?: Event): void => {
        if (event !== undefined) {
            const button = (event.target as HTMLButtonElement)?.closest("button");
            if (
                button !== null &&
                button instanceof HTMLButtonElement &&
                button.classList.contains("back-btn") &&
                button.dataset.fullClose !== undefined
            ) {
                this.#sectionsHistory = [];
            }
        }

        if (!this.#dialog.open || this.#isTransitioning) {
            return;
        }

        this.#isTransitioning = true;
        this.#dialog.classList.remove("page__dialog--opened");

        this.#afterContentTransition(() => {
            if (this.#sectionsHistory.length === 0) {
                this.#dialog.close();

                const doc = document.documentElement;
                doc.classList.remove("dialog-open");
                doc.style.removeProperty("--scrollbar-width");
            } else {
                this.showSection(this.#sectionsHistory.pop()!);
            }

            this.#isTransitioning = false;
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