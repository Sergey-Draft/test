import React, { useState } from "react";
import './App.scss';
import CallStats from "./components/CallStatistics";
import AverageDuration from "./components/AverageDuration";
import VideoChat from "./components/VideoChat";



const App = () => {

    const [call, manageCall] = useState({ isConnected: false, statistics: [], averageTime: 0 });

    const average = (arr) => {
        const result = arr.reduce((r, v) => r + v.durationSeconds, 0) / arr.length;
        return Math.floor(result * 10) / 10;
    }

    const durationAllCalls = (arr) => {
        const result = arr.reduce((r, item) => {
            return r + item.durationSeconds
        }, 0)
        return result;
    }

    const connected = (old) => {
        const startTime = new Date();
        const newCall = { key: old.statistics.length + 1, startTime, endTime: null, durationSeconds: 0 };
        const arr = [...old.statistics, newCall]
        const averageTime = average(arr);
        const durationAll = durationAllCalls(arr)

        return { isConnected: true, statistics: arr, averageTime, durationAll }
    }

    const disconnected = (old) => {
        const endTime = new Date();
        const lastCall = old.statistics.pop();
        lastCall.endTime = endTime;
        const datediff = lastCall.endTime - lastCall.startTime;
        lastCall.durationSeconds = Math.floor((datediff) / (1000));
        const arr = [...old.statistics, lastCall];
        const averageTime = average(arr);
        const durationAll = durationAllCalls(arr)

        return { isConnected: false, statistics: arr, averageTime, durationAll };
    }

    const deleteUser = (key) => {
        if (call.statistics) {
            var index = call.statistics.findIndex(item => item.key == key)
            if (index > -1) {
                call.statistics.splice(index, 1);
                const arr = [...call.statistics]
                const averageTime = average(arr);
                const durationAll = durationAllCalls(arr)
                manageCall(old => {
                    return {
                        ...old,
                        averageTime,
                        durationAll
                    }
                })
            }
        }
    }

    return (
        <div className="App">
            <div className="container">
                <div className="videoContainer">{call.isConnected
                    ? <VideoChat />
                    : <div className="infoText" >Press Join to connect<br/><a href="https://github.com/Sergey-Draft/test">Code on github</a></div>}</div>
                <div>Current status: {call.isConnected ? "Connected" : "Disconnected"}</div>
                <div>
                    <button className="btn btn-success" onClick={() => { manageCall((old) => connected(old)); }} disabled={call.isConnected}>Join</button>
                    <button className="btn btn-danger" onClick={() => { manageCall((old) => disconnected(old)); }} disabled={!call.isConnected}>Leave</button>
                    <br />
                    {call.statistics.length > 0 &&
                        (<div>
                            <table className="table table-hover" >
                                <tr>
                                    <th>Date</th>
                                    <th>Start at:</th>
                                    <th>End at:</th>
                                    <th>Duration</th>
                                </tr>
                                {call.statistics.map(s => <CallStats deleteUser={deleteUser} item={s} isConnected = {call.isConnected} />)}
                            </table>
                        </div>)
                    }
                    <br />
                    {!call.isConnected && <AverageDuration averageTime={call.averageTime} durationAll={call.durationAll} />}
                </div>
                <div>
                </div>
            </div>
        </div>
    );
};

export default App;