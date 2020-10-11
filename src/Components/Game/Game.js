import React, {Component} from 'react'
import "./Game.css"
import * as tf from "@tensorflow/tfjs";
import {setWasmPath} from "@tensorflow/tfjs-backend-wasm";
import * as posenet from '@tensorflow-models/posenet'
import left_jab from "../../resources/Actions/left_jab.png"
import pump_fake from "../../resources/Actions/pump_fake.png"
import CrossOver from "../../resources/Actions/crossover.png"
import right_ball_protection from "../../resources/Actions/right_ball_protection.png"
import left_ball_protection from "../../resources/Actions/left_ball_protection.png"
import left_in_and_out from "../../resources/Actions/left_in_and_out.png"
import right_in_and_out from "../../resources/Actions/right_in_and_out.png"
import right_jab from "../../resources/Actions/right_jab.png"
import {getRandom, isNotEmpty} from "../../Utils/utils";
import gameSong from "../../resources/Songs/GameSong.mp3";
import {detectPose, getPoseBodyPart} from "../../Utils/MotionDetactor"
import {Moves, Positions} from "../../Config/config"
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import {BrowserRouter, Redirect, Router} from "react-router-dom";
import history from "../history/history";


export default class Game extends Component {
    static defaultProps = {
        videoWidth: 200,
        videoHeight: 200,
        flipHorizontal: false,
        algorithm: 'single-pose',
        showVideo: true,
        minPoseConfidence: 0.1,
        minPartConfidence: 0.4,
        outputStride: 32,
        imageScaleFactor: 0.5,
    };
    notifySuccess = () => toast.success('Good move', {containerId: 'Success', autoClose: 1200});
    notifyFailed = () => toast.error(':(', {containerId: 'Failed', autoClose: 1000});


    constructor(props) {
        // setWasmPath('/tfjs-backend-wasm.wasm');
        // tf.setBackend("wasm");
        // console.log('The Backend is', tf.getBackend());
        super(props, Game.defaultProps);
        this.open = false;
        this.changeImage = this.changeImage.bind(this);
        //*
        this.interval = this.interval.bind(this);
        this.startNewMovement = this.startNewMovement.bind(this);
        this.actionTime = 2500;
        const audio = new Audio(gameSong);
        // audio.play().then(r => console.log(r));
        this.state = {
            ActionsTarget: 7,
            intervalsTarget: 4,
            currentImage: 3,
            intervalCounter: 0,
            ActionCounter: 0,
            lastPose: null,
            lives: 5,
            isActionDone: false,
            detectionState: {},
            intervalID: undefined,
            gameOver: false,
            images: [
                {action: left_jab, actionName: Moves.left_jab},
                {action: right_jab, actionName: Moves.right_jab},
                {action: pump_fake, actionName: Moves.pump_fake},
                {action: CrossOver, actionName: Moves.right_crossover},
                // {action: right_ball_protection, actionName: Moves.left_crossover},
                // {action: right_in_and_out, actionName: Moves.right_in_and_out},
                // {action: left_ball_protection, actionName: Moves.left_ball_protection},
                // {action: left_in_and_out, actionName: Moves.left_in_and_out}
            ]
        };
    }


    changeImage(currentIndex) {
        let newImageIndex = currentIndex;
        while (currentIndex === newImageIndex) {
            newImageIndex = getRandom(0, this.state.images.length - 1)
        }
        this.setState({
            currentImage: newImageIndex
        });
    }


    getCanvas = elem => {
        this.canvas = elem
    };

    getVideo = elem => {
        this.video = elem
    };

    async componentDidMount() {
        try {
            await this.setupCamera();
            console.log("starting");
            this.setState({intervalID: setInterval(this.interval, this.actionTime)});
        } catch (error) {
            console.log("current error:", error.message);
            throw new Error(
                'This browser does not support video capture, or this device does not have a camera'
            )
        }
        try {
            this.posenet = await posenet.load();
        } catch (error) {
            throw new Error('Game failed to load')
        }
        if (!this.state.gameOver)
            this.detectPose();

    }

//*
    interval() {
        this.setState({
            intervalCounter: this.state.intervalCounter + 1
        });
        if (this.state.intervalCounter === this.state.intervalsTarget - 1) {
            this.setState({
                intervalCounter: 0,
                ActionCounter: this.state.ActionCounter + 1,
                initPose: null,
                isActionDone: false
            });
            if (!this.state.isActionDone) {
                if (this.state.lives === 1) {
                    clearInterval(this.state.intervalID);
                    history.push("/");
                    window.location.reload(false);
                }
                this.setState({
                    lives: this.state.lives - 1,
                    gameOver: true
                });
                this.notifyFailed();
            }
            this.startNewMovement();
        }
        //speed pace
        if (this.state.ActionCounter === this.state.ActionsTarget) {
            let updateIntervalsTarget = this.state.intervalsTarget - 1;
            if (this.state.intervalsTarget === 1)
                updateIntervalsTarget = 1;
            this.setState({
                intervalsTarget: updateIntervalsTarget,
                ActionCounter: 0
            });
        }
    }

    async setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Browser API navigator.mediaDevices.getUserMedia not available'
            )
        }
        const {videoWidth, videoHeight} = this.props;
        const video = this.video;
        video.width = videoWidth;
        video.height = videoHeight;
        video.srcObject = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user',
                width: videoWidth,
                height: videoHeight
            }
        });
        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play();
                resolve(video)
            }
        })
    }

    detectPose() {
        const {videoWidth, videoHeight} = this.props;
        const canvas = this.canvas;
        const canvasContext = canvas.getContext('2d');
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        this.poseDetectionFrame(canvasContext)
    }

    poseDetectionFrame(canvasContext) {
        const posenetModel = this.posenet;
        const video = this.video;

        function displayVideo(canvasContext, video, videoWidth, videoHeight) {
            canvasContext.save();
            canvasContext.scale(-1, 1);
            canvasContext.translate(-videoWidth, 0);
            canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);
            canvasContext.restore()
        }

        const findPoseDetectionFrame = async () => {
            const pose = await posenetModel.estimateSinglePose(video, this.props.imageScaleFactor,
                this.props.flipHorizontal,
                this.props.outputStride
            );
            if (isNotEmpty(this.state.lastPose) && isNotEmpty(pose)) {
                let detectionCurrState = {};
                detectionCurrState =
                    await detectPose(
                        this.state.lastPose,
                        pose,
                        this.state.images[this.state.currentImage].actionName,
                        this.props.minPartConfidence, this.state.detectionState);
                this.setState({detectionState: detectionCurrState});
                if (isNotEmpty(detectionCurrState) && detectionCurrState["isDetectMotion"] === true) {
                    console.log("detect motion");
                    console.log(" ");
                    await this.startNewMovement()
                    this.notifySuccess();
                }
            }
            if (isNotEmpty(pose) && pose.score > this.props.minPoseConfidence)
                this.setState({lastPose: pose});
            if (this.props.showVideo)
                displayVideo(canvasContext, video, this.props.videoWidth, this.props.videoHeight);
            requestAnimationFrame(findPoseDetectionFrame)
        };
        findPoseDetectionFrame();
    }


    startNewMovement() {
        this.setState({
            detectionState: {},
            intervalCounter: 0,
            ActionCounter: this.state.ActionCounter + 1,
            lastPose: null,
            isActionDone: false
        });
        //*
        this.changeImage(this.state.currentImage);
    }


    render() {
        return (
            <Router history={history}>
                <div id={"container"} className={"container"}>
                    <ToastContainer enableMultiContainer containerId={'Success'} position={toast.POSITION.TOP_LEFT}/>
                    <ToastContainer enableMultiContainer containerId={'Failed'} position={toast.POSITION.TOP_LEFT}/>
                    <div className={"headers"}>
                        <h1 className={"gameName"} id={"gameName"}> Ball killer</h1>
                        <h2>current lives: {this.state.lives}</h2>
                    </div>
                    <div>
                        <video id="videoNoShow" ref={this.getVideo}/>
                        <canvas className="webcam" ref={this.getCanvas}/>
                    </div>
                    <img id={"Action"} src={this.state.images[this.state.currentImage].action}/>
                </div>
            </Router>
        )
    }
}