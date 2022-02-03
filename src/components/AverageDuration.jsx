

const AverageDuration = (props) => {
    return props.averageTime > 0 && (
        <div className="wrapper">
            <div>Average duration, sec: {props.averageTime}</div>
            <div>Duration all calls, sec: {props.durationAll}</div>
        </div>
    );
}

export default AverageDuration;