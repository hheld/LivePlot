import {State, useStore} from "./store";
import {useCallback, useEffect} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {listen, Event} from "@tauri-apps/api/event";

type ConnectionControlProps = {
    connectionName: string
};

interface KnownSubscription {
    quantity: string;
    subscribed: boolean;
}

const addQuantityToConnectionSelector = (state: State) => state.addQuantityToConnection;

const ConnectionControl = ({connectionName}: ConnectionControlProps) => {
    const connectionSelector = useCallback((state: State) => state.connections.find(c => c.name === connectionName), [connectionName]);
    const connectionData = useStore(connectionSelector);
    const addQuantityToConnection = useStore(addQuantityToConnectionSelector);

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

    const quantities = connectionData?.quantities?.map((q, i) => (
        <p key={i}>{q}</p>
    ));

    return (
        <div>
            <h1>{connectionName}</h1>
            {quantities}
        </div>
    );
};

export default ConnectionControl;