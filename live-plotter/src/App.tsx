import {listen, Event} from "@tauri-apps/api/event";
import AvailableQuantities from "./AvailableQuantities";
import {Box, Flex} from "@chakra-ui/react";
import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Legend, Tooltip} from "chart.js";
import {useCallback, useEffect, useState} from "react";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Legend, Tooltip);

interface DataItem {
    data: [{
        x: number;
        y: number;
    }];
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
            } else {
                current.forEach((value, index, arr) => {
                    arr[index].data.push({
                        x: (event.payload as { x: number, y: number }).x,
                        y: (event.payload as { x: number, y: number }).y
                    });
                });
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
        listen("data", newDataCallback);
    }, [newDataCallback]);

    return (
        <Flex>
            <Box shadow="md" borderWidth="1px">
                <AvailableQuantities/>
            </Box>

            <Box shadow="md" borderWidth="1px">
                <Scatter data={points} height="100%" options={{maintainAspectRatio: false}}></Scatter>
            </Box>
        </Flex>
    );
}

export default App;
