import { type Language } from "../languages";
import navigationNames from "./navigation-names.json";

type NavigationName = {
	[Lang in Language as `name-${Lang}`]: string;
};

type NavigationElement = NavigationName & {
	element: HTMLElement;
};

type ElementSelectedCallback = (element: HTMLElement) => void;

export class Navigation {
	#navigationNames: NavigationName[];
	#navigationElements: NavigationElement[] = [];

	#navigations: HTMLElement[] = [];

	#lang: Language = "ru";

    #navigationObserver: IntersectionObserver;

    #onElementSelected: ElementSelectedCallback[] = [];

    constructor() {
        this.#navigationNames = navigationNames;

        this.#navigationObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const navigationIndex = this.#navigationElements.findIndex((navElement) => {
                        return navElement.element === entry.target;
                    })

                    if (navigationIndex === -1) {
                        return;
                    }

                    this.#navigations.forEach((navigation) => {
                        const links = navigation.querySelectorAll<HTMLAnchorElement>("a");

                        links.forEach((link) => {
                            link.classList.toggle("link-current", false);
                        });

                        links.item(navigationIndex)?.classList.toggle("link-current", true);
                    });
                });
            },
            {
                root: null,
                rootMargin: "-45% 0px -45% 0px",
                threshold: 0
            }
        );
    }

    destroy() {
        for (let navElement of this.#navigationElements) {
            this.#navigationObserver.unobserve(navElement.element);
        }
    }

	setSections(sections: HTMLElement[]): void {
		if (sections.length !== this.#navigationNames.length) {
			throw new Error(
				"Error: The number of sections and their names do not match.",
			);
		}

        for (let navElement of this.#navigationElements) {
            this.#navigationObserver.unobserve(navElement.element);
        }

		this.#navigationElements = [];

		for (let i = 0; i < sections.length; i++) {
			this.#navigationElements.push({
				...this.#navigationNames[i]!,
				element: sections[i]!,
			});

            this.#navigationObserver.observe(sections[i]!);
		}

		this.#updateNavigations();
	}

	setLang(lang: Language): void {
		this.#lang = lang;
		this.#updateNavigations();
	}

	createNavigation(): HTMLElement {
		const nav = document.createElement("nav");

		this.#navigationElements.forEach((navElement) => {
			const link = document.createElement("a");
            const elementId = "#" + navElement.element.id;

			link.href = elementId;
			link.textContent = navElement[`name-${this.#lang}`];

            link.onclick = (event) => {
                event.preventDefault();

                const selectedElement = document.querySelector<HTMLElement>(elementId);
                if (selectedElement === null) {
                    return;
                }

                this.#onElementSelected.forEach((callback) => {
                    callback(selectedElement);
                });
            };

			nav.appendChild(link);
		});

		this.#navigations.push(nav);

		return nav;
	}

	removeNavigation(navigation: HTMLElement): boolean {
		let found = false;
		this.#navigations.filter((nav) => {
			if (nav === navigation) {
				found = true;
				return false;
			}

			return true;
		});

		return found;
	}

    setOnElementSelected(callback: ElementSelectedCallback): void {
        this.#onElementSelected.push(callback);
    }

    removeOnElementSelected(callback: ElementSelectedCallback): boolean {
        let found = false;
		this.#onElementSelected.filter((onElSel) => {
			if (onElSel === callback) {
				found = true;
				return false;
			}

			return true;
		});

		return found;
    }

	#updateNavigations(): void {
		this.#navigations.forEach((navigation) => {
			const links = navigation.querySelectorAll<HTMLAnchorElement>("a");
			if (links.length === this.#navigationElements.length) {
				for (let i = 0; i < links.length; i++) {
					links[i]!.href = "#" + this.#navigationElements[i]!.element.id;
					links[i]!.textContent =
						this.#navigationElements[i]![`name-${this.#lang}`];
				}
			}
		});
	}
}
