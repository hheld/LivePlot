import {ConnectionHistoryState, useConnectionHistoryStore} from "./connectionHistoryStore";
import {Button, FormControl, FormLabel, HStack, Select, Stack} from "@chakra-ui/react";
import {invoke} from "@tauri-apps/api/tauri";
import {State, useStore} from "./store";
import {ChangeEvent, useState} from "react";
import {confirm} from '@tauri-apps/api/dialog';

const addConnectionSelector = (state: State) => state.addConnection;
const connectionsSelector = (state: ConnectionHistoryState) => state.connections;
const forgetConnectionSelector = (state: ConnectionHistoryState) => state.removeConnectionFromHistory;

const ConnectionHistory = () => {
    const storeConnection = useStore(addConnectionSelector);
    const storedConnections = useConnectionHistoryStore(connectionsSelector);
    const forgetConnection = useConnectionHistoryStore(forgetConnectionSelector);

    const [connection, setConnection] = useState("");

    const options = [
        (<option key="-1" disabled value="">Select previous connection</option>),
        ...storedConnections.map((c, i) => (
            <option key={i}>{c}</option>
        ))];

    const handleConnection = (event: ChangeEvent<HTMLSelectElement>) => {
        setConnection(event.target.value);
    };

    const connect = async () => {
        try {
            await invoke("connect", {connection});
            storeConnection(connection);
            setConnection("");
        } catch (err) {
            console.error(`could not connect to ${connection}`);
        }
    };

    const forget = async () => {
        const confirmed = await confirm(`Are you sure to forget the connection ${connection}?`, "Forget connection");
        if (!confirmed) return;

        forgetConnection(connection);
        setConnection("");
    };

    return (
        <Stack align="baseline">
            <FormControl>
                <FormLabel>Connect to a previous connection</FormLabel>
                <Select value={connection} onChange={handleConnection}>
                    {options}
                </Select>
            </FormControl>
            <HStack>
                <Button onClick={connect} disabled={connection === ""}>Connect</Button>
                <Button onClick={forget} disabled={connection === ""}>Forget</Button>
            </HStack>
        </Stack>
    );
};

export default ConnectionHistory;