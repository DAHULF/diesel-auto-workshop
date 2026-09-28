import { type Language } from "./languages";

type LangItem = {
	[Lang in Language]: string;
};

type ServiceData = {
    id: number;
    name: LangItem;
    priceFrom: LangItem;
    icon: string;
    background: string;
    detailedInfo: LangItem;
    detailedPrice: LangItem
};

export class Detailed {
    #element: HTMLElement;

    #lang: Language = "ru";

    constructor() {
        this.#element = document.createElement("section");
        this.#element.classList.add("dialog__section-detailed");

        this.#element.innerHTML = `
            <div class="detailed-inner scrollable">
                <div class="detailed__main-info">
                    <div class="main-info__background"></div>

                    <div class="main-info__foreground">
                        <div class="foreground__inner">
                            <button type="button" class="back-btn">
                                <span>Назад</span>
                            </button>

                            <img class="main-info__icon" />

                            <div class="main-info__content">
                                <h2 class="service-title"></h2>
                                <p class="service-info"></p>
                                <p class="service-price"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="detailed__gallery">
                    <h2 class="section-title gallery__title">Галерея работ</h2>

                    <div class="page__gallery-list">
                        <button type="button" class="swipe-btn swipe-left-btn" aria-label="Пролистать галерею влево">
                        <i data-lucide="chevron-left" class="swipe-left-icon"></i>
                        </button>

                        <button type="button" class="swipe-btn swipe-right-btn" aria-label="Пролистать галерею вправо">
                        <i data-lucide="chevron-right" class="swipe-right-icon"></i>
                        </button>
                        
                        <div class="gallery-list__content scrollable">
                        <button type="button" class="photo-btn">
                            <img src="main-section-foreground.png" alt="Фото" class="gallery-photo" />
                        </button>

                        <button type="button" class="photo-btn">
                            <img src="main-section-foreground.png" alt="Фото" class="gallery-photo" />
                        </button>

                        <button type="button" class="photo-btn">
                            <img src="main-section-foreground.png" alt="Фото" class="gallery-photo" />
                        </button>

                        <button type="button" class="photo-btn">
                            <img src="main-section-foreground.png" alt="Фото" class="gallery-photo" />
                        </button>

                        <button type="button" class="photo-btn">
                            <img src="main-section-foreground.png" alt="Фото" class="gallery-photo" />

                            <div class="gallery-list__more">
                            <p>67+</p>
                            </div>
                        </button>
                        </div>
                    </div>

                    <button type="button" class="more-btn all-photo-btn">
                        <span>Все фотографии</span>
                    </button>
                </div>

                <div class="detailed__reviews">
                    <h2 class="section-title reviews__title">Отзывы</h2>

                    <div class="page__reviews-grid">
                        <button type="button" class="review-btn">
                        <h4 class="review__name">Данил ДанилДанилДанилДанил</h4>

                        <div class="review__rating">
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star"></i>
                        </div>

                        <p class="review__metadata">
                            <span class="metadata__service">Покраска автомобиля</span> ·
                            <span class="metadata__date">16 сентября 2026</span>
                        </p>

                        <p class="review__text">
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                        </p>
                        </button>
                    
                        <button type="button" class="review-btn">
                        <h4 class="review__name">Данил</h4>

                        <div class="review__rating">
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star"></i>
                        </div>

                        <p class="review__metadata">
                            <span class="metadata__service">Покраска автомобиля</span> ·
                            <span class="metadata__date">16 сентября 2026</span>
                        </p>

                        <p class="review__text">
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                        </p>
                        </button>

                        <button type="button" class="review-btn">
                        <h4 class="review__name">Данил</h4>

                        <div class="review__rating">
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star"></i>
                        </div>

                        <p class="review__metadata">
                            <span class="metadata__service">Покраска автомобиля</span> ·
                            <span class="metadata__date">16 сентября 2026</span>
                        </p>

                        <p class="review__text">
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                        </p>
                        </button>

                        <button type="button" class="review-btn">
                        <h4 class="review__name">Данил</h4>

                        <div class="review__rating">
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star review__star--filled"></i>
                            <i data-lucide="star" class="review__star"></i>
                        </div>

                        <p class="review__metadata">
                            <span class="metadata__service">Покраска автомобиля</span> ·
                            <span class="metadata__date">16 сентября 2026</span>
                        </p>

                        <p class="review__text">
                            Провели консультацию, помогли с выбором подходящего цвета
                            расчитали приемлемую цену. Работу сделали быстро и без
                            изъянов. Всем рекомендую мастера.
                        </p>
                        </button>
                    </div>

                    <button type="button" class="more-btn all-reviews-btn">
                        <span>Все отзывы</span>
                    </button>
                </div>

                <button type="button" class="primary-btn submit-app-btn"><span>Оставить заявку</span></button>
            </div>
        `;
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    setLang(lang: Language): void {
        this.#lang = lang;
    }

    setServiceData(data: ServiceData): void {
        const background = this.#element.querySelector<HTMLDivElement>(".main-info__background");
        if (background === null) {
            throw new Error("Error: Detailed background div not found.");
        }

        background.style.setProperty(
            "--service-background",
            `url("${data.background}")`
        );

        const icon = this.#element.querySelector<HTMLImageElement>(".main-info__icon");
        if (icon === null) {
            throw new Error("Error: Service icon not found.");
        }

        icon.src = data.icon;
        icon.alt = data.name[this.#lang];

        const title = this.#element.querySelector<HTMLHeadingElement>(".service-title");
        if (title === null) {
            throw new Error("Error: Service title not found.");
        }

        title.textContent = data.name[this.#lang];

        const info = this.#element.querySelector<HTMLParagraphElement>(".service-info");
        if (info === null) {
            throw new Error("Error: Service info paragraph not found.");
        }

        info.textContent = data.detailedInfo[this.#lang];

        const price = this.#element.querySelector<HTMLParagraphElement>(".service-price");
        if (price === null) {
            throw new Error("Error: Service price paragraph not found.");
        }

        price.textContent = `${data.priceFrom[this.#lang]} - ${data.detailedPrice[this.#lang]}`;
    }
}