import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {listen} from "@tauri-apps/api/event";
import AvailableQuantities from "./AvailableQuantities";

await listen("data", (event) => {
    console.log("got event!!", event.payload);
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

            <AvailableQuantities/>
        </div>
    );
}

export default App;
