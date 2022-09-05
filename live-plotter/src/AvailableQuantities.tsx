import {listen} from "@tauri-apps/api/event";
import {availableQuantities, availableQuantitiesStore, storeAvailableQuantity} from "./availableQuantitiesStore";
import {useEffect, useState} from "react";
import {Switch, TableCaption, TableContainer, Tbody, Td, Thead, Tr, Table, Th} from "@chakra-ui/react";
import {invoke} from "@tauri-apps/api/tauri";

await listen("newQuantity", (event) => {
    storeAvailableQuantity(event.payload as string);
});

const subscribe = async (topic: string) => {
    await invoke("subscribe", {quantity: topic});
};

const unsubscribe = async (topic: string) => {
    await invoke("unsubscribe", {quantity: topic});
};

const AvailableQuantities = () => {
    const [quantities, setQuantities] = useState(availableQuantities());

    useEffect(() => {
        availableQuantitiesStore.subscribe(
            state => setQuantities(state.availableQuantities),
        );
    }, []);

    const quantitiesTable = quantities.map(q => (
        <Tr key={q}>
            <Td>{q}</Td>
            <Td><Switch size='sm' onChange={(e) => e.currentTarget.checked ? subscribe(q) : unsubscribe(q)}/></Td>
        </Tr>
    ));

    return (
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
    );
}

export default AvailableQuantities;
