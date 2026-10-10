const API_STATES_TUPLE = [
    "idle",
    "pending",
    "success",
    "error"
] as const;

type ApiState = typeof API_STATES_TUPLE[number];

type ApiItem = {
    readonly source: string;
    state: ApiState;
    data?: unknown;
};

export class Api {
    static API_STATES: { [TState in ApiState]: ApiState } = Object.fromEntries(
        API_STATES_TUPLE.map((stateT) => [stateT, stateT])
    ) as { [TState in ApiState]: ApiState };

    #apiItems: ApiItem[] = [];

    addApi(source: string): void {
        this.#apiItems.push({
            source,
            state: "idle",
            data: null
        });
    }

    async sendRequest(request: { source: string, data?: unknown }): Promise<unknown> {
        const api = this.#apiItems.find((item) => item.source === request.source);

        try {
            if (api === undefined) {
                throw new Error(`Error: Api with source ${request.source} not found.`);
            }

            const handler = this.#sourcesHandlers.get(request.source);
            if (handler === undefined) {
                throw new Error(`Error: Handler for ${request.source} not found.`);
            }

            api.state = "pending";

            const answer = await handler(request.data);

            api.data = answer;
            api.state = "success";

            return answer;
        } catch (error) {
            if (api !== undefined) {
                api.state = "error";
            }

            throw error;
        }
    }

    getApiState(source: string): ApiState | null {
        return this.#apiItems.find((item) => item.source === source)?.state ?? null;
    }

    #appFormRequestHandler = (formData: unknown) => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                if (!(formData instanceof FormData)) {
                    rej(new Error(`Error: Data are not instance of FormData object.`));
                    return;
                }

                const dateValue = formData.get("date");
                if (dateValue === null) {
                    rej(new Error(`Error: Date data not found.`));
                    return;
                }

                const timeValue = formData.get("time");
                if (timeValue === null) {
                    rej(new Error(`Error: Time data not found.`));
                    return;
                }

                const [hours, minutes] = timeValue.toString().split(":");
                if (!hours || !minutes) {
                    rej(new Error(`Error: The time data does not match the data pattern.`));
                    return;
                }

                const errorsData: {
                    name: string;
                    errorMessage: {
                        ru: string,
                        en: string
                    }
                }[] = [];

                const date = new Date(dateValue.toString());
                if (
                    date.getDate() === 10 &&
                    date.getMonth() === 11 &&
                    date.getFullYear() === 2101
                ) {
                    errorsData.push({
                        name: "date",
                        errorMessage: {
                            ru: "Демонстрационная ошибка даты",
                            en: "Date demo error"
                        }
                    });
                }

                if (+hours === 12 && +minutes === 30) {
                    errorsData.push({
                        name: "time",
                        errorMessage: {
                            ru: "Мы забыли, у нас обед в это время",
                            en: "We forgot—we have lunch at this time"
                        }
                    });
                }

                const brief = formData.get("brief-description");
                if (brief !== null && brief.toString() === "Global error") {
                    rej({
                        errorMessage: {
                            ru: "Что-то глобально пошло не так",
                            en: "Something went fundamentally wrong"
                        }
                    });
                }

                if (errorsData.length !== 0) {
                    rej(errorsData);
                }

                res(true);
            }, 4000);
        });
    };

    #sourcesHandlers = new Map([
        ["appForm", this.#appFormRequestHandler]
    ]);
}