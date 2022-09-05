import {listen} from "@tauri-apps/api/event";
import AvailableQuantities from "./AvailableQuantities";
import {HStack} from "@chakra-ui/react";

await listen("data", (event) => {
    console.log("got event!!", event.payload);
});

const App = () => {
    return (
        <HStack>
            <AvailableQuantities/>
        </HStack>
    );
}

export default App;
