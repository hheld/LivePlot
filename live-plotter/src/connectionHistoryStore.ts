import create from "zustand";
import {persist} from "zustand/middleware";
import produce from "immer";

export interface ConnectionHistoryState {
    connections: string[]

    addConnectionToHistory: (connectionName: string) => void
    removeConnectionFromHistory: (connectionName: string) => void
}

export const useConnectionHistoryStore = create<ConnectionHistoryState>()(
    persist(
        (set) => ({
            connections: [],

            addConnectionToHistory: (connectionName: string) => set(produce((state: ConnectionHistoryState) => {
                const conn = state.connections.find(c => c === connectionName);
                if (conn) return;

                state.connections = [...state.connections, connectionName].sort();
            })),

            removeConnectionFromHistory: (connectionName: string) => set(produce((state: ConnectionHistoryState) => {
                state.connections = state.connections.filter(c => c !== connectionName);
            })),
        }),
        {
            name: "connections"
        }
    )
);