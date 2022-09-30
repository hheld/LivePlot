import React from "react";
import ReactDOM from "react-dom/client";
import {ChakraProvider} from "@chakra-ui/react";
import App from "./App";

// disable context menu
document.addEventListener('contextmenu', event => event.preventDefault());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider>
            <App/>
        </ChakraProvider>
    </React.StrictMode>
);
