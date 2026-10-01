import "./services.css";

import { type Language, type LangItem } from "../languages";
import servicesData from "./services-data.json";

type ServiceData = {
    id: number;
    name: LangItem;
    priceFrom: LangItem;
    icon: string;
    background: string;
    detailedInfo: LangItem;
    detailedPrice: LangItem;
};

type ServiceSelectedCallback = (serviceId: number) => void;

export class Services {
    #servicesGrid: HTMLDivElement;
    #servicesData: ServiceData[];

    #lang: Language = "ru";

    #onServiceSelected: ServiceSelectedCallback | null = null;

    constructor() {
        this.#servicesData = servicesData;

        this.#servicesGrid = document.createElement("div");
        this.#servicesGrid.classList.add("services__container");
        this.#servicesGrid.addEventListener("click", this.#gridClickHandler);

        this.#servicesData.forEach((service) => {
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add("service-card");
            button.dataset.id = service.id.toString();
            button.ariaHasPopup = "dialog";

            const background = document.createElement("div");
            background.classList.add("service-card__background");
            background.style.setProperty(
                "--card-background",
                `url("${service.background}")`
            );

            const foreground = document.createElement("div");
            foreground.classList.add("service-card__foreground");
            
            const foregImg = document.createElement("img");
            foregImg.classList.add("service-card__icon");
            foregImg.src = service.icon;
            foregImg.alt = service.name[this.#lang];
            foreground.appendChild(foregImg);

            const foregH3 = document.createElement("h3");
            foregH3.classList.add("service-card__title");
            foregH3.textContent = service.name[this.#lang];
            foreground.appendChild(foregH3);

            const foregP = document.createElement("p");
            foregP.classList.add("service-card__price");
            foregP.textContent = service.priceFrom[this.#lang];
            foreground.appendChild(foregP);

            const detailedInfo = document.createElement("div");
            detailedInfo.classList.add("service-card__detailed-info");

            const detailedTitle = document.createElement("h3");
            detailedTitle.classList.add("detailed-info__title");
            detailedTitle.textContent = service.name[this.#lang];
            detailedInfo.appendChild(detailedTitle);

            const detailedText = document.createElement("p");
            detailedText.classList.add("detailed-info__text");
            detailedText.textContent = service.detailedInfo[this.#lang];
            detailedInfo.appendChild(detailedText);

            const detailedPrice = document.createElement("p");
            detailedPrice.classList.add("detailed-info__price");
            detailedPrice.textContent = service.detailedPrice[this.#lang];
            detailedInfo.appendChild(detailedPrice);

            button.appendChild(background);
            button.appendChild(foreground);
            button.appendChild(detailedInfo);

            button.ariaLabelledByElements = [foregH3, foregP];

            this.#servicesGrid.appendChild(button);
        });
    }

    setLang(lang: Language): void {
        this.#lang = lang;
        
        const serviceCards = this.#servicesGrid.querySelectorAll<HTMLButtonElement>(".service-card");
        serviceCards.forEach((serviceCard) => {
            const id = serviceCard.dataset.id;
            if (id === undefined) {
                return;
            }

            const serviceData = this.#servicesData.find((data) => data.id === +id);
            if (serviceData === undefined) {
                return;
            }

            const foregImg = serviceCard.querySelector<HTMLImageElement>(".service-card__icon");
            if (foregImg !== null) {
                foregImg.alt = serviceData.name[this.#lang];
            }

            const foregTitle = serviceCard.querySelector<HTMLHeadingElement>(".service-card__title");
            if (foregTitle !== null) {
                foregTitle.textContent = serviceData.name[this.#lang];
            }

            const foregPrice = serviceCard.querySelector<HTMLParagraphElement>(".service-card__price");
            if (foregPrice !== null) {
                foregPrice.textContent = serviceData.priceFrom[this.#lang];
            }

            const detailedTitle = serviceCard.querySelector<HTMLHeadingElement>(".detailed-info__title");
            if (detailedTitle !== null) {
                detailedTitle.textContent = serviceData.name[this.#lang];
            }

            const detailedText = serviceCard.querySelector<HTMLParagraphElement>(".detailed-info__text");
            if (detailedText !== null) {
                detailedText.textContent = serviceData.detailedInfo[this.#lang];
            }
            
            const detailedPrice = serviceCard.querySelector<HTMLParagraphElement>(".detailed-info__price");
            if (detailedPrice !== null) {
                detailedPrice.textContent = serviceData.detailedPrice[this.#lang];
            }
        })
    }

    getElement(): HTMLElement {
        return this.#servicesGrid;
    }

    getServiceData(id: number): ServiceData | undefined {
        return this.#servicesData.find((data) => data.id === id);
    }

    setOnServiceSelected(callback: ServiceSelectedCallback): void {
        this.#onServiceSelected = callback;
    }

    get servicesData() {
        return this.#servicesData;
    }

    #gridClickHandler = (event: Event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const serviceCard = target.closest<HTMLButtonElement>(".service-card");
        if (serviceCard === null) {
            return;
        }

        const id = serviceCard.dataset.id;
        if (id === undefined) {
            return;
        }

        if (this.#onServiceSelected !== null) {
            this.#onServiceSelected(+id);
        }
    }
}