import { logger } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import EventSource from "react-native-sse";
import { USER_AGENT } from "../constants";

type NxapiEvents = "friend" | "title";

interface Title {
    id: string;
    name: string;
    image_url: string;
    url: string;
    since: string;
};

export default new class NxapiStreamManager {
    eventSource?: EventSource<NxapiEvents>;

    start() {
        if (this.eventSource) {
            logger.info("Closing EventSource");
            this.eventSource.close();
        }

        logger.info("Opening EventSource");
        
        const eventSource = new EventSource<NxapiEvents>("https://nx.catvibers.me/api/presence/8178ef7b6a3153f0/events", { headers: { "User-Agent": USER_AGENT }});
        this.eventSource = eventSource;

        eventSource.addEventListener("open", (event) => {
            logger.info("EventSource opened");
        });

        eventSource.addEventListener("friend", (event) => {
            if (event.type !== "friend") return
            logger.verbose("Recieved friend event");

        });

        eventSource.addEventListener("title", (event) => {
            if (event.type !== "title") return
            logger.verbose("Recieved title event");
            const title = JSON.parse(event.data) as Title | null;

            if (title) {
                showToast(title.name, { uri: title.image_url } as any as number);
            };
        });

        eventSource.addEventListener("close", (event) => {
            logger.info("EventSource closed");
        })

        eventSource.addEventListener("error", (event) => {
            if (event.type === "error") {
                logger.error("Connection error:", event.message);
            } else if (event.type === "exception") {
                logger.error("Error:", event.message, event.error);
            }
        })
    }

    stop() {
        this.eventSource?.close();
        this.eventSource = null;
    }
}
