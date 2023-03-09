import Settings from "./ui/pages/Settings";
import NxapiStreamManager from "./lib/NxapiStreamManager";

export default {
    onLoad: () => {
        NxapiStreamManager.start()
    },
    onUnload: () => {
    },
    settings: Settings,
}