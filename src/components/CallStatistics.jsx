

const CallStats = (props) => {
    return props.item && (
        <>
            <tr>
                <td key={props.item.key}>{props.item.startTime.toLocaleDateString()}</td>
                <td>{props.item.startTime.toLocaleTimeString()}</td>
                <td>{props.item.endTime ? props.item.endTime.toLocaleTimeString() : null}</td>
                <td> {props.item.durationSeconds} </td>
                <td><button className="btn btn-outline-dark btn-sm" onClick={() => { props.deleteUser(props.item.key) }} disabled={props.isConnected} >delete call</button></td>
            </tr>
        </>

    );
}

export default CallStats;