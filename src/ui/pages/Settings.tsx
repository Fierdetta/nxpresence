import { findByDisplayName, findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { General, Forms } from "@vendetta/ui/components";
import { USER_AGENT } from "../../lib/constants";

const { ScrollView, RefreshControl, Image } = General;
const { FormSection, FormRow, FormHint, FormDivider, FormInput, FormSwitchRow } = Forms;
const Status = findByDisplayName("Status")

const STATE_STATUS_MAPPING = {
    OFFLINE: "invisible",
    INACTIVE: "idle",
    ONLINE: "online",
    PLAYING: "online"
}

const debounce = findByProps("debounce").debounce

export default function Settings() {
    useProxy(storage);

    const [friend, setFriend] = React.useState(null)
    const [error, setError] = React.useState("")

    async function fetchFriend() {
        try {
            const headers = new Headers({
                "Accept": "application/json",
                "User-Agent": USER_AGENT
            })

            const response = await fetch(storage.presenceApiUrl, { headers: headers })

            if (!response.ok) throw new Error("No friend found")

            const data = await response.json()

            setFriend(data.friend)
        } catch (err) {
            setError(err.message)
            setFriend(null)
        }
    }

    // Debounced for api url input
    const debouncedFetchFriend = React.useCallback(debounce(fetchFriend, 200), [])

    // Load on first open
    React.useEffect(() => {
        if (!storage.presenceApiUrl) return

        fetchFriend()
    }, [])

    // Refresh shit
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = () => {
        setRefreshing(true)
        fetchFriend().then(() => setRefreshing(false))
    }

    return (<ScrollView
        refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />}
    >
        <FormSection>
            {friend && <>
                <FormRow
                    leading={<Image
                        source={{ uri: friend.imageUri }}
                        style={{ height: 48, width: 48, borderRadius: 24 }}
                    />}
                    label={friend.name}
                    trailing={friend.presence.game.imageUri ?
                        <Image
                            source={{ uri: friend.presence.game.imageUri }}
                            style={{ height: 48, width: 48 }}
                        /> :
                        <Status
                            size={24}
                            status={STATE_STATUS_MAPPING[friend.presence.state]}
                        />}
                />
                <FormDivider />
            </>}
            <FormInput
                value={storage.presenceApiUrl}
                onChange={(v: string) => {
                    storage.presenceApiUrl = v
                    if (error) setError("")
                    debouncedFetchFriend(v)
                }}
                error={error}
                placeholder="https://nx.catvibers.me/api/presence/5f6b0b4e201f2a7e"
                title="Presence API URL"
            />
        </FormSection>
        <FormHint>{"You must share your presence with the presence server user (\"Display online status to\" in Friend Settings)"}</FormHint>
        <FormSection title="Settings">
            <FormSwitchRow
                label="Automatically connect to presence server"
                onValueChange={(v) => {
                    storage.automaticallyConnect = v;
                }}
                value={storage.automaticallyConnect}
            />
        </FormSection>
    </ScrollView>)
}