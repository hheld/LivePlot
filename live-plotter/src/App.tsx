import {
    Box,
    Button, CloseButton,
    Container,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Tab,
    TabList, TabPanel, TabPanels,
    Tabs,
    VStack
} from "@chakra-ui/react";
import React, {ChangeEvent, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {State, useStore} from "./store";
import ConnectionControl from "./ConnectionControl";

const addConnectionSelector = (state: State) => state.addConnection;
const removeConnectionSelector = (state: State) => state.removeConnection;
const connectionsSelector = (state: State) => state.connections;

const App = () => {
    const storeConnection = useStore(addConnectionSelector);
    const removeConnection = useStore(removeConnectionSelector);
    const storedConnections = useStore(connectionsSelector);

    const [connection, setConnection] = useState("");

    const handleConnection = (event: ChangeEvent<HTMLInputElement>) => {
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

    const disconnect = async (connectionName: string) => {
        try {
            await invoke("disconnect", {connection: connectionName});
            removeConnection(connectionName);
        } catch (err) {
            console.error(`could not disconnect from ${connectionName}`);
        }
    };

    const tabs = storedConnections.map((c, i) => (
        <Tab key={i}>
            {c.name} <CloseButton size="sm" onClick={() => disconnect(c.name)}/>
        </Tab>
    ));

    const tabContents = storedConnections.map((c, i) => (
        <TabPanel key={i}>
            <ConnectionControl connectionName={c.name}/>
        </TabPanel>
    ));

    return (
        <Box>
            <VStack align="stretch" spacing="10">
                <Container shadow="md" borderWidth="1px" w="30%">
                    <Stack align="baseline">
                        <FormControl isRequired>
                            <FormLabel>Connection</FormLabel>
                            <Input value={connection} onChange={handleConnection}/>
                        </FormControl>
                        <Button onClick={connect}>Connect</Button>
                    </Stack>
                </Container>

                <Tabs variant="enclosed-colored">
                    <TabList>
                        {tabs}
                    </TabList>
                    <TabPanels>
                        {tabContents}
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
}

export default App;
