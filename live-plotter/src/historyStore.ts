import create from "zustand";
import {persist} from "zustand/middleware";
import produce from "immer";

export interface HistoryState {
    connections: string[]
    lastImageSaveFile: string
    lastCsvSaveFile: string

    addConnectionToHistory: (connectionName: string) => void
    removeConnectionFromHistory: (connectionName: string) => void

    setLastImageSaveFile: (fileName: string) => void
    setLastCsvSaveFile: (fileName: string) => void
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set) => ({
            connections: [],
            lastCsvSaveFile: "",
            lastImageSaveFile: "",

            addConnectionToHistory: (connectionName: string) => set(produce((state: HistoryState) => {
                const conn = state.connections.find(c => c === connectionName);
                if (conn) return;

                state.connections = [...state.connections, connectionName].sort();
            })),

            removeConnectionFromHistory: (connectionName: string) => set(produce((state: HistoryState) => {
                state.connections = state.connections.filter(c => c !== connectionName);
            })),

            setLastImageSaveFile: (fileName: string) => set(produce((state: HistoryState) => {
                state.lastImageSaveFile = fileName;
            })),

            setLastCsvSaveFile: (fileName: string) => set(produce((state: HistoryState) => {
                state.lastCsvSaveFile = fileName;
            })),
        }),
        {
            name: "history"
        }
    )
);