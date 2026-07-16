import type { EventRegistrationSnapshot } from "./types";

/** Начальное состояние до ответа BFF — без мок-данных. */
export const EMPTY_EVENT_REGISTRATION_SNAPSHOT: EventRegistrationSnapshot = {
    eventCodes: [],
    setupRunTags: [],
    unprocessedEvents: [],
    rollOptions: [],
    rollCatalog: [],
    scrapRollDefault: "",
    activeRollDefault: "",
    lineCount: 0,
    lineNumberOptions: [],
    sideOptions: [],
    sideDefault: "PM",
    cardColorOptions: [],
    cardColorCatalog: [],
    initialJournal: [],
};
