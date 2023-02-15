import { storage } from "@vendetta/plugin";
import Settings from "./components/Settings";

export default {
    onLoad: () => {
        storage.presenceApiUrl ??= ""
        storage.automaticallyConnect ??= false

    },
    onUnload: () => {

    },
    settings: Settings,
}