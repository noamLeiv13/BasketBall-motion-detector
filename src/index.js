import React from 'react';
import ReactDOM from 'react-dom';
import App from './Components/App/App';
import PoseNet from './Components/PoseNet/PoseNet';
import {BrowserRouter as Router, Route} from "react-router-dom";


const routing = (
    <Router>
        <Route exact path={"/"} component={App}/>
        <Route exact path={"/game"} component={PoseNet}/>
    </Router>
);

ReactDOM.render(
    routing, document.getElementById('root')
);