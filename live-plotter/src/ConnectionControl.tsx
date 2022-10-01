import SubscriptionsTable from "./SubscriptionsTable";

type ConnectionControlProps = {
    connectionName: string
};

const ConnectionControl = ({connectionName}: ConnectionControlProps) => {
    return (
        <div>
            <SubscriptionsTable connectionName={connectionName}/>
        </div>
    );
};

export default ConnectionControl;