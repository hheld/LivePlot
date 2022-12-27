import create from "zustand";
import {persist} from "zustand/middleware";
import produce from "immer";

interface HistoryState {
    connections: string[]
    lastImageSaveFile: string
    lastCsvSaveFile: string

    actions: {
        addConnectionToHistory: (connectionName: string) => void
        removeConnectionFromHistory: (connectionName: string) => void

        setLastImageSaveFile: (fileName: string) => void
        setLastCsvSaveFile: (fileName: string) => void
    }
}

const useHistoryStore = create<HistoryState>()(
    persist(
        (set) => ({
            connections: [],
            lastCsvSaveFile: "",
            lastImageSaveFile: "",

            actions: {
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
            }
        }),
        {
            name: "history",
            partialize: (state) => ({
                connections: state.connections,
                lastImageSaveFile: state.lastImageSaveFile,
                lastCsvSaveFile: state.lastCsvSaveFile
            }),
        }
    )
);

export const useHistoryActions = () => useHistoryStore((state: HistoryState) => state.actions);
export const useHistoryConnections = () => useHistoryStore((state: HistoryState) => state.connections);
export const useLastImageSaveFile = () => useHistoryStore((state: HistoryState) => state.lastImageSaveFile);
export const useLastCsvSaveFile = () => useHistoryStore((state: HistoryState) => state.lastCsvSaveFile);
