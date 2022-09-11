import {listen, Event} from "@tauri-apps/api/event";
import AvailableQuantities from "./AvailableQuantities";
import {Box, Button, HStack, Input, Text, VStack} from "@chakra-ui/react";
import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Legend, Tooltip} from "chart.js";
import {ChangeEvent, useCallback, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Legend, Tooltip);

interface DataItem {
    data: {
        x: number;
        y: number;
    }[];
    label: string,
    borderColor: string,
    showLine: boolean,
}

interface Data {
    datasets: DataItem[];
}

const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return `rgb(${r},${g},${b})`;
}

const App = () => {
    const [points, setPoints] = useState<Data>({datasets: []});
    const [connection, setConnection] = useState("");

    const handleConnection = (event: ChangeEvent<HTMLInputElement>) => {
        setConnection(event.target.value);
    };

    const connect = async () => {
        await invoke("connect", {connection});
    };

    const newDataCallback = useCallback((event: Event<unknown>) => {
        const pl = event.payload as { x: number, y: number, quantity: string };

        setPoints((prev) => {
            const others = prev.datasets.filter(d => d.label !== pl.quantity);
            let current = prev.datasets.filter(d => d.label === pl.quantity);

            if (current.length == 0) {
                const newEntry = {
                    label: pl.quantity,
                    borderColor: `${getRandomColor()}`,
                    showLine: true,
                    data: [
                        {
                            x: (event.payload as { x: number, y: number }).x,
                            y: (event.payload as { x: number, y: number }).y
                        }
                    ]
                };

                current = [newEntry as DataItem];
            } else if (current.length == 1) {
                const dv = current[0];

                current = [{
                    ...dv,
                    data: [...dv.data, {
                        x: (event.payload as { x: number, y: number }).x,
                        y: (event.payload as { x: number, y: number }).y
                    }]
                }];
            }

            return {
                datasets: [...others, ...current].sort((a, b) => {
                    if (a.label < b.label) return -1;
                    if (a.label > b.label) return 1;
                    return 0;
                })
            };
        });
    }, []);

    useEffect(() => {
        invoke("current_connection").then(v => setConnection(v as string));
    }, []);

    useEffect(() => {
        const unlistenFnPromise = listen("data", newDataCallback);

        return () => {
            unlistenFnPromise
                .then(f => f())
                .catch(e => console.error(e));
        };
    }, [newDataCallback]);

    return (
        <VStack align="stretch">
            <HStack>
                <Box shadow="md" borderWidth="1px" w="50%">
                    <AvailableQuantities/>
                </Box>

                <Box shadow="md" borderWidth="1px" w="50%">
                    <Text>Connection</Text>
                    <Input value={connection} onChange={handleConnection}/>
                    <Button onClick={connect}>Connect</Button>
                </Box>
            </HStack>

            <Box shadow="md" borderWidth="1px" h="500px">
                <Scatter data={points}
                         options={{maintainAspectRatio: false, responsive: true, animation: false}}></Scatter>
            </Box>
        </VStack>
    );
}

export default App;
