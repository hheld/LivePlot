import {listen} from "@tauri-apps/api/event";
import {useEffect, useState} from "react";
import {Switch, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import {invoke} from "@tauri-apps/api/tauri";

const listenToNewQuantities = async () => {
    await listen("newQuantity", (event) => {
        console.log("new quantity", event.payload);
        storeAvailableQuantity(event.payload as string);
    });
};

listenToNewQuantities();

const subscribe = async (topic: string) => {
    await invoke("subscribe", {quantity: topic});
};

const unsubscribe = async (topic: string) => {
    await invoke("unsubscribe", {quantity: topic});
};

const getAvailableQuantity = async () => {
    return await invoke("known_quantities");
};

interface KnownSubscription {
    quantity: string;
    subscribed: boolean;
}

const AvailableQuantities = () => {
    const [quantities, setQuantities] = useState(availableQuantities());
    const [subscriptions, setSubscriptions] = useState(new Set<string>());

    const addSubscription = (quantity: string) => {
        setSubscriptions(prev => new Set(prev.add(quantity)));
    };

    const removeSubscription = (quantity: string) => {
        setSubscriptions(prev => {
            return new Set([...prev].filter(s => s !== quantity));
        });
    };

    useEffect(() => {
        const alreadyAvailableQuantities = getAvailableQuantity();

        alreadyAvailableQuantities.then((q) => {
            const quantities = (q as KnownSubscription[]).map(qq => {
                    const {quantity, subscribed} = qq;

                    if (subscribed) {
                        addSubscription(quantity);
                    } else if (subscriptions.has(quantity)) {
                        removeSubscription(quantity);
                    }

                    return quantity;
                }
            );

            setQuantities(quantities);
        });

        availableQuantitiesStore.subscribe(
            state => setQuantities(state.availableQuantities),
        );
    }, []);

    const quantitiesTable = quantities.map(q => (
        <Tr key={q}>
            <Td>{q}</Td>
            <Td><Switch size='sm' isChecked={subscriptions.has(q)}
                        onChange={(e) => e.currentTarget.checked
                            ? subscribe(q).then(() => addSubscription(q))
                            : unsubscribe(q).then(() => removeSubscription(q))
                        }/></Td>
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
