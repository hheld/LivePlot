import {listen} from "@tauri-apps/api/event";
import {availableQuantities, availableQuantitiesStore, storeAvailableQuantity} from "./availableQuantitiesStore";
import {useEffect, useState} from "react";

await listen("newQuantity", (event) => {
    storeAvailableQuantity(event.payload as string);
});

const AvailableQuantities = () => {
    const [quantities, setQuantities] = useState(availableQuantities());

    useEffect(() => {
        availableQuantitiesStore.subscribe(
            state => setQuantities(state.availableQuantities),
        );
    }, []);

    const quantitiesTable = quantities.map(q => (
        <tr key={q}>
            <td>{q}</td>
        </tr>
    ));

    return (
        <div>
            <h1>Available quantities</h1>
            <table>
                <thead>
                <tr>
                    <th>Quantity</th>
                </tr>
                </thead>
                <tbody>
                {quantitiesTable}
                </tbody>
            </table>
        </div>
    );
}

export default AvailableQuantities;
