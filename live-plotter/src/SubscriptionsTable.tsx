import {listen, Event} from "@tauri-apps/api/event";
import {useCallback, useEffect} from "react";
import {Box, Switch, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import {invoke} from "@tauri-apps/api/tauri";
import {useConnectionActions, useConnections, useConnectionsWithName} from "./store";

const subscribe = async (connectionName: string, topic: string) => {
    await invoke("subscribe", {connection: connectionName, quantity: topic});
};

const unsubscribe = async (connectionName: string, topic: string) => {
    await invoke("unsubscribe", {connection: connectionName, quantity: topic});
};

type SubscriptionsTableProps = {
    connectionName: string
};

interface KnownSubscription {
    quantity: string;
    subscribed: boolean;
}

const SubscriptionsTable = ({connectionName}: SubscriptionsTableProps) => {
    const connectionData = useConnectionsWithName(connectionName);
    const {
        addQuantityToConnection,
        addSubscriptionToConnection,
        removeSubscriptionFromConnection
    } = useConnectionActions();

    const newQuantitiesCallback = useCallback((event: Event<unknown>) => {
        const pl = event.payload as { quantity: string, connection: string };
        addQuantityToConnection(pl.connection, pl.quantity, false);
    }, []);

    const getAvailableQuantities = useCallback(async () => await invoke("known_quantities", {connection: connectionName}), [connectionName]);

    useEffect(() => {
        const knownQuantities = getAvailableQuantities();

        knownQuantities.then((q) => {
            (q as KnownSubscription[])
                .forEach((kn) => addQuantityToConnection(connectionName, kn.quantity, kn.subscribed));
        });
    }, [connectionName, getAvailableQuantities]);

    useEffect(() => {
        const unlistenFnPromise = listen("newQuantity", newQuantitiesCallback);

        return () => {
            unlistenFnPromise
                .then(f => f())
                .catch(e => console.error(e));
        };
    }, [newQuantitiesCallback]);

    const subscriptions = connectionData?.subscriptions;

    const addSubscription = (quantity: string) => {
        addSubscriptionToConnection(connectionName, quantity);
    };

    const removeSubscription = (quantity: string) => {
        removeSubscriptionFromConnection(connectionName, quantity);
    };

    const quantitiesTable = connectionData?.quantities?.map(q => (
        <Tr key={q}>
            <Td>{q}</Td>
            <Td><Switch size='sm' isChecked={subscriptions?.find(s => s === q) !== undefined}
                        onChange={(e) => e.currentTarget.checked
                            ? subscribe(connectionName, q).then(() => addSubscription(q))
                            : unsubscribe(connectionName, q).then(() => removeSubscription(q))
                        }/></Td>
        </Tr>
    ));

    return (
        <Box shadow="md" borderWidth="1px">
            <TableContainer>
                <Table variant="striped">
                    <TableCaption>
                        Available quantities
                    </TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Quantity</Th>
                            <Th>Subscribe</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {quantitiesTable}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default SubscriptionsTable;
