import SubscriptionsTable from "./SubscriptionsTable";
import {VStack, Box} from "@chakra-ui/react";
import DataPlot from "./DataPlot";

type ConnectionControlProps = {
    connectionName: string
};

const ConnectionControl = ({connectionName}: ConnectionControlProps) => {
    return (
        <Box>
            <VStack align="stretch" spacing="10">
                <SubscriptionsTable connectionName={connectionName}/>
                <DataPlot connectionName={connectionName}/>
            </VStack>
        </Box>
    );
};

export default ConnectionControl;