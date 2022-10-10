import {listen, Event} from "@tauri-apps/api/event";
import {Box, Button, Container, HStack, VStack} from "@chakra-ui/react";
import {Scatter} from "react-chartjs-2";
import {Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Legend, Tooltip} from "chart.js";
import {useCallback, useEffect, useRef, useState} from "react";
import Zoom from "chartjs-plugin-zoom";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Legend, Tooltip, Zoom);

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

type DataPlotProps = {
    connectionName: string
};

const DataPlot = ({connectionName}: DataPlotProps) => {
    const [points, setPoints] = useState<Data>({datasets: []});
    const chartRef = useRef(null);

    const newDataCallback = useCallback((event: Event<unknown>) => {
        const pl = event.payload as { x: number, y: number, quantity: string, connection: string };

        if (pl.connection != connectionName) return;

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
    }, [connectionName]);

    useEffect(() => {
        const unlistenFnPromise = listen("data", newDataCallback);

        return () => {
            unlistenFnPromise
                .then(f => f())
                .catch(e => console.error(e));
        };
    }, [newDataCallback]);

    const clearPlotData = () => {
        setPoints({datasets: []});
    };

    const resetZoom = () => {
        // @ts-ignore
        chartRef.current?.resetZoom();
    }

    return (
        <VStack spacing="10">
            <Box shadow="md" borderWidth="1px" h="300px" w="100%">
                <Container w="100%" centerContent maxW="100%" h="100%">
                    <Scatter data={points}
                             ref={chartRef}
                             options={{
                                 maintainAspectRatio: false,
                                 responsive: true,
                                 animation: false,
                                 plugins: {
                                     zoom: {
                                         zoom: {
                                             mode: "xy",
                                             wheel: {
                                                 enabled: true
                                             }
                                         },
                                         pan: {
                                             enabled: true,
                                             mode: "xy",
                                         },
                                     }
                                 }
                             }}></Scatter>
                </Container>
            </Box>

            <HStack>
                <Button onClick={clearPlotData}>Clear plot data</Button>
                <Button onClick={resetZoom}>Reset zoom</Button>
            </HStack>
        </VStack>
    );
};

export default DataPlot;