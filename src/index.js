import React from 'react';
import ReactDOM from 'react-dom';
import App from './Components/App/App';
import Game from './Components/Game/Game';
import {BrowserRouter as Router, Route} from "react-router-dom";


const routing = (
    <Router>
        <Route exact path={"/"} component={App}/>
        <Route exact path={"/game"} component={Game}/>
    </Router>
);

ReactDOM.render(
    routing, document.getElementById('root')
);