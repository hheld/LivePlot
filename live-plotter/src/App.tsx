import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {listen} from "@tauri-apps/api/event";
import {availableQuantities, storeAvailableQuantity} from "./availableQuantitiesStore";

await listen("data", (event) => {
    console.log("got event!!", event.payload);
});

await listen("newQuantity", (event) => {
    console.log("got new quantity", event.payload);
    storeAvailableQuantity(event.payload as string);
    console.log("available quantities", availableQuantities());
});

const App = () => {
    const [topic, setTopic] = useState("");

    const subscribe = async () => {
        await invoke("subscribe", {quantity: topic});
    };

    const unsubscribe = async () => {
        await invoke("unsubscribe", {quantity: topic});
    };

    return (
        <div className="container">
            <div className="row">
                <div>
                    <input
                        onChange={(e) => setTopic(e.currentTarget.value)}
                        placeholder="Enter a topic ..."
                    />
                    <button type="button" onClick={() => subscribe()}>
                        Subscribe
                    </button>
                    <button type="button" onClick={() => unsubscribe()}>
                        Unsubscribe
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
