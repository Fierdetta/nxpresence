import { findByDisplayName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { General, Forms } from "@vendetta/ui/components";
import { USER_AGENT } from "../lib/constants";

const { ScrollView, Image } = General;
const { FormSection, FormRow, FormHint, FormDivider, FormInput, FormSwitchRow } = Forms;
const Status = findByDisplayName("Status")

const STATE_STATUS_MAPPING = {
    OFFLINE: "invisible",
    INACTIVE: "idle",
    ONLINE: "online",
    PLAYING: "online"
}

export default function Settings() {
    useProxy(storage);

    const [friend, setFriend] = React.useState(null)
    const [error, setError] = React.useState("")

    React.useEffect(() => {
        setFriend(null)

        if (!storage.presenceApiUrl) return

        const fetchFriend = async function () {
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
            }
        }

        fetchFriend()
    }, [storage.presenceApiUrl])

    return (<ScrollView>
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
                {(["ONLINE", "PLAYING"].includes(friend.presence.state) && !friend.presence.game.name) && <>
                    <FormDivider />
                    <FormHint style={{ paddingBottom: 8 }}>You're not sharing your presence/play activity with the presence server user, you'll need to change that in User Settings/Play Activity Settings or make the presence server user a best friend.</FormHint>
                </>}
                <FormDivider />
            </>}
            <FormInput
                value={storage.presenceApiUrl}
                onChange={(v: string) => {
                    storage.presenceApiUrl = v
                    if (error) setError("")
                }}
                error={error}
                placeholder="https://nxapi-presence.fancy.org.uk/api/presence/5f6b0b4e201f2a7e"
                title="Presence API URL"
            />
        </FormSection>
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