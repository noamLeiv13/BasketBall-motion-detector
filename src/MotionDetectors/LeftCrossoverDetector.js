import {Positions} from "../Config/config";
import {createOrAddToKey, isNotEmpty} from "../Utils/utils";
import {diffBetweenPoses} from "../Utils/MotionDetactor";


export class LeftCrossoverDetector {

    constructor(minScore) {
        this.minScore = minScore;
        this.wristThreshold = -35;
        this.detect = this.detect.bind(this);
    }

    async detect(lastPose, currentPose, diffState) {
        diffState["isDetectMotion"] = false;
        let leftHandPosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.leftWrist, this.minScore);
        if (diffState["frameCounter"] > 20)
            this.resetState(diffState);
        if (isNotEmpty(leftHandPosesDiff) && leftHandPosesDiff.x > 0)
            diffState = await this.resetState(diffState);
        else if (isNotEmpty(leftHandPosesDiff) && leftHandPosesDiff.x < 0) {
            diffState = await createOrAddToKey(diffState, Positions.leftWrist, leftHandPosesDiff.x);
            diffState["isDetectMotion"] = await this.checkMovement(diffState);
        }
        diffState = await createOrAddToKey(diffState, "frameCounter", 1);
        return diffState;
    }

    resetState(diffState) {
        if (isNotEmpty(diffState)) {
            diffState[Positions.leftWrist] = 0;
            diffState["frameCounter"] = 0;
        }
        return diffState;
    }


    checkMovement(difState) {
        return (isNotEmpty(difState[Positions.leftWrist]) &&
            difState[Positions.leftWrist] < this.wristThreshold);
    }

}


