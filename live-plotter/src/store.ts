import {create} from "zustand";
import {produce} from "immer";

export interface ConnectionData {
    name: string
    quantities: string[]
    subscriptions: string[]
}

interface State {
    connections: ConnectionData[]

    actions: {
        addConnection: (connectionName: string) => void
        removeConnection: (connectionName: string) => void
        addQuantityToConnection: (connectionName: string, quantity: string, subscribed: boolean) => void
        addSubscriptionToConnection: (connectionName: string, quantity: string) => void
        removeSubscriptionFromConnection: (connectionName: string, quantity: string) => void
    }
}

const useStore = create<State>()((set) => ({
    connections: [],

    actions: {
        addConnection: (connectionName) => set(produce((state) => {
            state.connections.push({
                name: connectionName,
                quantities: [],
                subscriptions: []
            } as ConnectionData);
        })),

        removeConnection: (connectionName: string) => set(produce((state: State) => {
            state.connections = state.connections.filter(c => c.name !== connectionName);
        })),

        addQuantityToConnection: (connectionName: string, quantity: string, subscribed: boolean) => set(produce((state: State) => {
            let cd = state.connections.find(c => c.name === connectionName);
            if (!cd) return;

            cd.quantities = [...cd?.quantities.filter(q => q !== quantity), quantity].sort();

            if (subscribed) {
                cd.subscriptions = [...cd?.subscriptions.filter(s => s !== quantity), quantity].sort();
            }
        })),

        addSubscriptionToConnection: (connectionName: string, quantity: string) => set(produce((state: State) => {
            let cd = state.connections.find(c => c.name === connectionName);
            if (!cd) return;

            cd.subscriptions = [...cd?.subscriptions.filter(s => s !== quantity), quantity].sort();
        })),

        removeSubscriptionFromConnection: (connectionName: string, quantity: string) => set(produce((state: State) => {
            let cd = state.connections.find(c => c.name === connectionName);
            if (!cd) return;

            cd.subscriptions = [...cd?.subscriptions.filter(s => s !== quantity)].sort();
        })),
    }
}));

export const useConnectionActions = () => useStore((state: State) => state.actions);
export const useConnections = () => useStore((state: State) => state.connections);
export const useConnectionsWithName = (connectionName: string) => useStore((state: State) => state.connections.find(c => c.name === connectionName));
