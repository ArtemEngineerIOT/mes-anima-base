import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import "./index.css";

async function enableMocking() {
    if (import.meta.env.PROD) {
        return;
    }

    // MSW should be explicitly enabled in dev.
    // Otherwise it will intercept requests to the real backend and you will see
    // "from service worker" in Network.
    if (import.meta.env.VITE_ENABLE_MSW !== "true") {
        return;
    }

    const { worker } = await import("@/shared/api/mocks/browser");
    return worker.start();
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>,
    );
});
