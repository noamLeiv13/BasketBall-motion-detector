import React, {useState} from 'react'
import "./App.css"
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {useHistory} from "react-router-dom";


export default function App(props) {
    const [clock, setClock] = useState(null);
    const history = useHistory();

    const renderTime = (remainingTime) => {
        if (remainingTime === 0) {
            return <div className="timer"/>;
        }
        return (
            <div className="timer">
                <div className="text">The game starts in:</div>
                <div className="value">{remainingTime}</div>
                <div className="text">seconds</div>
            </div>);
    };

    const renderClock = () => {
        return (
            <div id={"container"} className={"container"}>
                <div className={"timer-wrapper"}>
                    <CountdownCircleTimer className={"counter"}
                                          style={{bottom: 10}}
                                          isPlaying
                                          size={328}
                                          strokeWidt={20}
                                          duration={5}
                                          colors={[
                                              ['#004777', 0.33],
                                              ['#F7B801', 0.33],
                                              ['#A30000', 0.33],
                                          ]}
                                          onComplete={() => {
                                              history.push("/game")
                                          }}>
                        {({remainingTime}) => renderTime(remainingTime)}
                    </CountdownCircleTimer>
                </div>
            </div>
        );
    };

    const startClock = () => {
        setClock(renderClock());
    };

    return (

        <div>
            <div id={"container"} className={"container"}>
                <h1 className={"gameName"} id={"gameName"}> Ball killer</h1>
                <button className={"start-game-button"} onClick={startClock}> start game</button>
                {clock}
            </div>
        </div>
    )
}
