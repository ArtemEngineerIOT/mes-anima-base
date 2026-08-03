/** Кэшированное окружение клиента (clientGetEnvironment). */
export type ClientEnvironment = {
    clientLogin: string;
    /** UUID каталога temp — передаётся в JB print как `pathFolder`. */
    tempFilesFolder: string;
    clientTimeZone: string;
};
