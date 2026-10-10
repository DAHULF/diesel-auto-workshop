import { type Language, type LangItem, translate } from "../languages";

import "./applicationForm.css";
import textContentMap from "./text-content-map.json";

type ServicesDataItem = {
    id: number;
    name: LangItem;
};

type ValidationItem = {
    element: HTMLElement;
    validationResult: string;
};

type FieldErrorItem = {
    name: string;
    errorMessage: LangItem;
};

type SubmitHook = (formData: FormData) => void;

function debounce(callback: (...args: unknown[]) => unknown, delay: number) {
    let timerId: number;

    return function(...args: unknown[]) {
        clearTimeout(timerId);

        timerId = setTimeout(() => {
            callback(...args);
        }, delay);
    }
}

export class ApplicationForm {
    #element: HTMLElement;
    #appForm: HTMLFormElement;

    #servicesData: ServicesDataItem[] = [];

    #onSubmit: SubmitHook | null = null;
    #isBlocked = false;

    #fieldsError: FieldErrorItem[] = [];
    #globalError: LangItem | null = null;

    #textContentMap = textContentMap;
    #lang: Language = "ru";

    #MAX_BRIEF = 500;
    #INPUT_DEBOUNCE_TIMEOUT = 600;

    #storageMessageSent = false;

    constructor() {
        this.#element = document.createElement("section");
        this.#element.classList.add("dialog__section-app-form", "scrollable");

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");

        this.#element.innerHTML = `
            <button type="button" class="back-btn">
                <span>Назад</span>
            </button>

            <form class="app-form" novalidate>
                <h3 class="app-form__title">Заявка на консультацию</h3>

                <label class="app-form__item">
                    <span class="form-item__title">Услуга</span>
                    <select id="form-item__service-type" class="form-item__service-type" name="service-type" aria-describedby="service-type__error" required></select>
                    <span id="service-type__error" class="form-item__error service-type__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <span class="form-item__title">Предпочтительная дата</span>
                    <input id="form-item__date" type="date" lang="ru" min="${yyyy}-${mm}-${dd}" class="form-item__date" name="date" aria-describedby="date__error" required />
                    <span id="date__error" class="form-item__error date__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <span class="form-item__title">Предпочтительное время</span>
                    <input id="form-item__time" type="time" lang="ru" min="08:00" max="18:00" step="300" class="form-item__time" name="time" aria-describedby="time__error" required />
                    <span id="time__error" class="form-item__error time__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <span class="form-item__title">Кратко опишите проблему</span>
                    <textarea id="form-item__brief-description" class="form-item__brief-description" name="brief-description" maxlength="${this.#MAX_BRIEF}" placeholder="Краткое описание вашей проблемы" aria-describedby="brief-description__error"></textarea>
                    <span id="brief-description__error" class="form-item__error brief-description__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <span class="form-item__title">Номер телефона</span>
                    <input id="form-item__phone" type="tel" class="form-item__phone" name="phone" placeholder="+7 (000) 000-00 00" aria-describedby="phone__error" required />
                    <span id="phone__error" class="form-item__error phone__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <span class="form-item__title">Адрес электронной почты</span>
                    <input id="form-item__email" type="email" class="form-item__email" name="email" placeholder="username@gmail.com" aria-describedby="email__error" />
                    <span id="email__error" class="form-item__error email__error" aria-live="polite"></span>
                </label>

                <label class="app-form__item">
                    <input id="form-item__save-contact" type="checkbox" class="form-item__save-contact" name="save-contact" />
                    <span class="form-item__title">Запомнить контактные данные</span>
                </label>

                <p class="app-form__info">Выбираемые дата и время являются предварительными. После оставления заявки мастер свяжется с вами и согласует точное время.</p>

                <p class="app-form__global-error" hidden></p>

                <button type="submit" class="primary-btn app-form__submit">
                    <span>Оставить заявку</span>

                    <div class="submit__loader-container">
                        <i data-lucide="loader-circle"></i>
                    </div>
                </button>
            </form>
        `;

        const appForm = this.#element.querySelector<HTMLFormElement>(".app-form");
        if (appForm === null) {
            throw new Error("Error: Application form not found.");
        }

        this.#appForm = appForm;
        this.#appForm.addEventListener("submit", this.#onFormSubmit);

        const saveContactsCheckbox = this.#appForm.elements.namedItem("save-contact");
        if (saveContactsCheckbox === null || !(saveContactsCheckbox instanceof HTMLInputElement)) {
            throw new Error(`Error: Save contacts checkbox not found.`);
        }

        const checked = this.#getValue(saveContactsCheckbox.name);
        if (checked !== null) {
            saveContactsCheckbox.checked = checked === "true";
        }

        saveContactsCheckbox.addEventListener("change", () => {
            this.#removeValue(saveContactsCheckbox.name);
            this.#saveValue(saveContactsCheckbox.name, String(saveContactsCheckbox.checked), this.#getStorage(saveContactsCheckbox));

            const phone = this.#appForm.elements.namedItem("phone");
            if (phone === null || !(phone instanceof HTMLInputElement)) {
                throw new Error(`Error: Phone input not found.`);
            }

            this.#removeValue(phone.name);
            this.#saveValue(phone.name, phone.value, this.#getStorage(phone));

            const email = this.#appForm.elements.namedItem("email");
            if (email === null || !(email instanceof HTMLInputElement)) {
                throw new Error(`Error: Email input not found.`);
            }

            this.#removeValue(email.name);
            this.#saveValue(email.name, email.value, this.#getStorage(email));
        });

        for(const element of this.#appForm.elements) {
            const validator = this.#validatorsMap.get(element.id);
            if (!validator) {
                continue;
            }

            if (
                (element instanceof HTMLInputElement) ||
                (element instanceof HTMLTextAreaElement)
            ) {
                const validateElement = () => {
                    this.#toggleErrorMessage({
                        element,
                        validationResult: validator(element.value)
                    });

                    this.#saveValue(element.name, element.value, this.#getStorage(element));
                };

                element.addEventListener("input", debounce(validateElement, this.#INPUT_DEBOUNCE_TIMEOUT));

                const value = this.#getValue(element.name);
                if (value !== null) {
                    element.value = value;
                    validateElement();
                }
            } else if (element instanceof HTMLSelectElement) {
                element.addEventListener("change", () => {
                    this.#toggleErrorMessage({
                        element,
                        validationResult: validator(element.value)
                    });

                    this.#saveValue(element.name, element.value, this.#getStorage(element));
                });

                const value = this.#getValue(element.name);
                if (value !== null && this.#servicesData.some((item) => item.id === +value)) {
                    element.value = value;
                }
            }
        }

        this.#updateServiceOptions();
    }

    setLang(lang: Language): void {
        this.#lang = lang;
        this.#updateServiceOptions();

        translate(this.#element, this.#textContentMap, this.#lang);

        this.displayFieldErrors(this.#fieldsError);

        if (this.#globalError !== null) {
            this.displayGlobalError(this.#globalError);
        }
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    setServicesData(servicesData: ServicesDataItem[]): void {
        const setSaved = this.#servicesData.length === 0;

        this.#servicesData = servicesData;
        this.#updateServiceOptions();

        if (setSaved) {
            const serviceSelect = this.#element.querySelector<HTMLSelectElement>(".form-item__service-type");
            if (serviceSelect === null) {
                throw new Error("Error: Service select not found.");
            }

            const value = this.#getValue(serviceSelect.name);
            if (value !== null && this.#servicesData.some((item) => item.id === +value)) {
                serviceSelect.value = value;
            }
        }
    }

    selectService(sergviceId: number): void {
        const serviceSelect = this.#appForm.elements.namedItem("service-type");
        if (serviceSelect === null || !(serviceSelect instanceof HTMLSelectElement)) {
            throw new Error(`Error: Service select not found.`);
        }

        if (this.#servicesData.some((item) => item.id === sergviceId)) {
            serviceSelect.value = sergviceId.toString();
            this.#saveValue(serviceSelect.name, serviceSelect.value, this.#getStorage(serviceSelect));
        }
    }

    clearData(): void {
        for(const element of this.#appForm.elements) {
            if (
                (!(element instanceof HTMLInputElement) &&
                !(element instanceof HTMLSelectElement) &&
                !(element instanceof HTMLTextAreaElement))
            ) {
                continue;
            }

            const isPersistemt = this.#getStorage(element) === localStorage;

            if (!isPersistemt) {
                this.#removeValue(element.name);
                element.value = (element instanceof HTMLSelectElement) ? "-1" : "";
            }

            if (this.#validatorsMap.has(element.id)){
                this.#toggleErrorMessage({
                    element,
                    validationResult: ""
                });
            }
        }

        this.#fieldsError = [];
        this.displayGlobalError(null);
    }

    setBlocked(block: boolean): void {
        const submitBtn = this.#element.querySelector<HTMLButtonElement>(".app-form__submit");
        if (submitBtn === null) {
            throw new Error(`Error: Submit button not found.`);
        }

        submitBtn.disabled = block;
        this.#isBlocked = block;
    }

    setOnSubmit(hook: SubmitHook): void {
        this.#onSubmit = hook;
    }

    displayFieldErrors(errorsData: FieldErrorItem[]): void {
        this.#fieldsError = errorsData;

        this.#fieldsError.forEach((field) => {
            const element = this.#appForm.elements.namedItem(field.name);
            if (element === null || !(element instanceof HTMLElement)) {
                return;
            }

            this.#toggleErrorMessage({ element, validationResult: field.errorMessage[this.#lang] });
        });
    }

    displayGlobalError(errorMessage: LangItem | null): void {
        this.#globalError = errorMessage;

        const errorParagraph = this.#element.querySelector<HTMLParagraphElement>(".app-form__global-error");
        if (errorParagraph === null) {
            throw new Error(`Error: Global error paragraph not found.`);
        }

        errorParagraph.textContent = errorMessage?.[this.#lang] ?? "";
        errorParagraph.hidden = errorMessage === null;
    }

    #onFormSubmit = (event: SubmitEvent) => {
        event.preventDefault();

        if (this.#isBlocked) {
            throw new Error(`Error: Application form is blocked.`);
        }

        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const validator = this.#formValidator(form);
        let iteration = validator.next();

        while (!iteration.done) {
            this.#toggleErrorMessage(iteration.value);
            iteration = validator.next();
        }

        if (!iteration.value) {
            const firstInvalid = this.#element.querySelector<HTMLLabelElement>(".app-form__item:has(.form-item--invalid)");
            if (firstInvalid === null) {
                throw new Error(`Error: Unknown error.`);
            }
            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

            return;
        }

        if (this.#onSubmit === null) {
            throw new Error(`Error: Set on submit handler first.`);
        }

        this.#onSubmit(new FormData(this.#appForm));
    };

    #toggleErrorMessage(validationItem: ValidationItem): void {
        const isInvalid = validationItem.validationResult !== "";

        validationItem.element.classList.toggle("form-item--invalid", isInvalid);
        validationItem.element.setAttribute("aria-invalid", String(isInvalid));

        const errorSpan = this.#element.querySelector<HTMLSpanElement>(`#${validationItem.element.id} + .form-item__error`);
        if (errorSpan === null) {
            throw new Error(`Error: Error span for #${validationItem.element.id} element not found.`);
        }

        if (errorSpan.textContent !== "" && validationItem.validationResult === "") {
            const transitionendHandler = () => {
                if (!validationItem.element.classList.contains("form-item--invalid")) {
                    errorSpan.textContent = validationItem.validationResult;
                }

                errorSpan.removeEventListener("transitionend", transitionendHandler);
            };

            errorSpan.addEventListener("transitionend", transitionendHandler);
        } else {
            errorSpan.textContent = validationItem.validationResult;
        }
    }

    *#formValidator(form: HTMLFormElement): Generator<ValidationItem, boolean, void> {
        let generalResult: boolean = true;

        for (const element of form.elements) {
            if (
                (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)
                && this.#validatorsMap.has(element.id)
            ) {
                const validationResult = this.#validatorsMap.get(element.id)?.(element.value);
                if (validationResult !== undefined) {
                    generalResult = generalResult && (validationResult === "");

                    yield {
                        element,
                        validationResult
                    } as ValidationItem;
                }
            }
        }

        return generalResult;
    }

    #validateServiceSelect = (selectedValue: string): string => {
        if (+selectedValue !== +selectedValue || +selectedValue < 0) {
            return this.#lang === "ru" ? "Необходимо выбрать услугу" : "You need to select a service.";
        }

        return "";
    };

    #validateDate = (dateValue: string): string => {
        if (dateValue === "") {
            return this.#lang === "ru" ? "Необходимо выбрать предпочтительную дату консультации" : "You need to select a preferred date for the consultation";
        }

        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const value = new Date(dateValue);

        if (value < tomorrow) {
            return this.#lang === "ru" ? "Запись минимум за день" : "Booking at least one day in advance";
        }

        if (value.getFullYear() > ((new Date()).getFullYear() + 100)) {
            return this.#lang === "ru" ? "Запись максимум на сто лет вперёд" : "Booking up to a maximum of one hundred years in advance";
        }

        return "";
    };

    #validateTime = (timeValue: string): string => {
        if (timeValue === "") {
            return this.#lang === "ru" ? "Необходимо выбрать предпочтительное время консультации" : "You need to select a preferred time for the consultation";
        }

        const [hours, minutes] = timeValue.split(":");
        if (!hours || !minutes) {
            return this.#lang === "ru" ? "Неизвестная ошибка ввода времени" : "Unknown time input error";
        }

        if (
            (+hours >= 0 && +hours < 8) ||
            (+hours > 17 && +hours <= 23)
        ) {
            return this.#lang === "ru" ? "Выбранное время должно быть от 08:00 до 18:00" : "The selected time must be between 08:00 and 18:00.";
        }

        if (+minutes % 5 !== 0) {
            return this.#lang === "ru" ? "Минуты должны быть кратны 5" : "The minutes must be multiples of 5";
        }

        return "";
    };

    #validateBrief = (briefValue: string): string => {
        if (briefValue.length > this.#MAX_BRIEF) {
            return this.#lang === "ru" ? "Максимум 500 символов" : "Maximum 500 characters";
        }

        return "";
    }

    #validatePhone = (phoneValue: string): string => {
        if (phoneValue === "") {
            return this.#lang === "ru" ? "Необходимо указать номер телефона" : "You must provide a phone number.";
        }

        const phoneRegex = /^(\+7|8)?\s?\(?9\d{2}\)?\s?\d{3}\s?\d{2}\s?\d{2}$/;

        if (!phoneRegex.test(phoneValue)) {
            return this.#lang === "ru" ? "Некорректный номер телефона" : "Invalid phone number";
        }

        return "";
    };

    #validateEmail = (emailValue: string): string => {
        if (emailValue === "") {
            return "";
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(emailValue)) {
            return this.#lang === "ru" ? "Некорректный адрес электронной почты" : "Invalid email address";
        }

        return "";
    };

    #validatorsMap = new Map([
        ["form-item__service-type", this.#validateServiceSelect],
        ["form-item__date", this.#validateDate],
        ["form-item__time", this.#validateTime],
        ["form-item__brief-description", this.#validateBrief],
        ["form-item__phone", this.#validatePhone],
        ["form-item__email", this.#validateEmail]
    ]);

    #updateServiceOptions(): void {
        const serviceSelect = this.#element.querySelector<HTMLSelectElement>(".form-item__service-type");
        if (serviceSelect === null) {
            throw new Error("Error: Service select not found.");
        }

        const currentSelected = +serviceSelect.value;

        const serviceOptions =
        [
            {
                id: -1,
                name: {
                    ru: "(Услуга не выбрана)",
                    en: "(Service not selected)"
                }
            },
            ...this.#servicesData
        ].map((item) => {
            const option = document.createElement("option");
            option.textContent = item.name[this.#lang];
            option.value = item.id.toString();
            option.selected = currentSelected === item.id;

            return option;
        });

        serviceSelect.replaceChildren(...serviceOptions);
    }

    #saveValue(name: string, data: string, storage: Storage): void {
        try {
            storage.setItem(name, data);
        } catch {
            if (!this.#storageMessageSent) {
                console.warn(`Browser storages aren't enabled.`);
                this.#storageMessageSent = true;
            }
        }
    }

    #getValue(name: string): string | null {
        try {
            const element = this.#appForm.elements.namedItem(name);
            if (element === null || !(element instanceof HTMLElement)) {
                return null;
            }

            return this.#getStorage(element).getItem(name);
        } catch {
            if (!this.#storageMessageSent) {
                console.warn(`Browser storages aren't enabled.`);
                this.#storageMessageSent = true;
            }

            return null;
        }
    }

    #removeValue(name: string): void {
        try {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
        } catch {
            if (!this.#storageMessageSent) {
                console.warn(`Browser storages aren't enabled.`);
                this.#storageMessageSent = true;
            }
        }
    }

    #getStorage(element: HTMLElement): Storage {
        const select = this.#appForm.elements.namedItem("save-contact");
        const saveContacts = (select as HTMLInputElement)?.checked ?? false;

        if (
            element === select ||

            (saveContacts &&
                (element === this.#appForm.elements.namedItem("phone") ||
                    element === this.#appForm.elements.namedItem("email")))
        ) {
            return localStorage;
        }

        return sessionStorage;
    }
}