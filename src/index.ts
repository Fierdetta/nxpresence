import { logger } from "@vendetta";
import Settings from "./Settings";
import NxapiStreamManager from "./lib/NxapiStreamManager";

export default {
    onLoad: () => {
        NxapiStreamManager.start()
    },
    onUnload: () => {
    },
    settings: Settings,
}