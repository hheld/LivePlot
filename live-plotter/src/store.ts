import create from 'zustand';

export interface ConnectionData {
    name: string
    quantities: string[]
    subscriptions: string[]
}

export interface State {
    connections: ConnectionData[]

    addConnection: (connectionName: string) => void
    addQuantityToConnection: (connectionName: string, quantity: string, subscribed: boolean) => void
}

export const useStore = create<State>()((set) => ({
    connections: [],

    addConnection: (connectionName) => set((state) => ({
        connections: [...state.connections, {
            name: connectionName,
            quantities: [],
            subscriptions: []
        } as ConnectionData],
    })),

    addQuantityToConnection: (connectionName: string, quantity: string, subscribed: boolean) => set((state) => ({
        connections: [
            ...state.connections.filter(c => c.name !== connectionName),
            ...state.connections.filter(c => c.name === connectionName).map(c => ({
                ...c,
                quantities: [...c.quantities.filter(q => q !== quantity), quantity].sort(),
                subscriptions: subscribed
                    ? [...c.subscriptions.filter(s => s !== quantity), quantity].sort()
                    : [...c.subscriptions.filter(s => s !== quantity)].sort()
            })),
        ]
    })),
}));
