import {
    Box,
    Button, Center,
    Container,
    FormControl,
    FormLabel, HStack,
    Input,
    Stack,
    Tab,
    TabList, TabPanel, TabPanels,
    Tabs, Text,
    VStack
} from "@chakra-ui/react";
import React, {ChangeEvent, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {confirm} from '@tauri-apps/plugin-dialog';
import {useConnectionActions, useConnections} from "./store";
import ConnectionControl from "./ConnectionControl";
import {CloseIcon} from "@chakra-ui/icons";
import ConnectionHistory from "./ConnectionHistory";
import {useHistoryActions} from "./historyStore";

const App = () => {
    const {addConnection, removeConnection} = useConnectionActions();
    const storedConnections = useConnections();
    const {addConnectionToHistory} = useHistoryActions();

    const [connection, setConnection] = useState("");

    const handleConnection = (event: ChangeEvent<HTMLInputElement>) => {
        setConnection(event.target.value);
    };

    const connectionIsValid = () => {
        const re_validConnection = /^(?:tcp:\/\/(.+):\d+|ipc:\/\/(.+))$/;
        return re_validConnection.test(connection);
    };

    const connect = async () => {
        try {
            await invoke("connect", {connection});
            addConnection(connection);
            addConnectionToHistory(connection);
            setConnection("");
        } catch (err) {
            console.error(`could not connect to ${connection}`);
        }
    };

    const disconnect = async (connectionName: string) => {
        const confirmed = await confirm(`Are you sure to close the connection ${connectionName}?`, "Close connection");

        if (!confirmed) return;

        try {
            await invoke("disconnect", {connection: connectionName});
            removeConnection(connectionName);
        } catch (err) {
            console.error(`could not disconnect from ${connectionName}`);
        }
    };

    const tabs = storedConnections.map((c, i) => (
        <Tab key={i}>
            <HStack align="normal" spacing="2">
                <Text>{c.name}</Text>
                <CloseIcon w="2" h="2" color="red.500" onClick={() => disconnect(c.name)}/>
            </HStack>
        </Tab>
    ));

    const tabContents = storedConnections.map((c, i) => (
        <TabPanel key={i}>
            <ConnectionControl connectionName={c.name}/>
        </TabPanel>
    ));

    return (
        <Box>
            <VStack align="stretch" spacing="10" marginTop="4">
                <Center>
                    <HStack align="stretch" marginRight="4" marginLeft="4" spacing="10">
                        <Box>
                            <Container shadow="md" borderWidth="1px">
                                <Stack align="baseline">
                                    <FormControl isRequired>
                                        <FormLabel>Connection</FormLabel>
                                        <Input value={connection} onChange={handleConnection}
                                               isInvalid={!connectionIsValid()}
                                               onKeyDown={(e) => {
                                                   const ct = e.currentTarget;
                                                   if (connectionIsValid() && e.key === "Enter") connect().then(() => ct.blur());
                                               }}/>
                                    </FormControl>
                                    <Button onClick={connect} disabled={!connectionIsValid()}>Connect</Button>
                                </Stack>
                            </Container>
                        </Box>

                        <Box>
                            <Container shadow="md" borderWidth="1px">
                                <ConnectionHistory/>
                            </Container>
                        </Box>
                    </HStack>
                </Center>

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
