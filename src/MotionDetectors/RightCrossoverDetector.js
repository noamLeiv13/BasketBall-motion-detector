import {Positions} from "../Config/config";
import {createOrAddToKey, isNotEmpty} from "../Utils/utils";
import {diffBetweenPoses} from "../Utils/MotionDetactor";


export class RightCrossoverDetector {

    constructor(minScore) {
        this.minScore = minScore;
        this.wristThreshold = 35;
        this.detect = this.detect.bind(this);
    }

    async detect(lastPose, currentPose, diffState) {
        diffState["isDetectMotion"] = false;
        let rightHandPosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.rightWrist, this.minScore);
        if (diffState["frameCounter"] > 10) {
            diffState[Positions.rightWrist] = 0;
            diffState["frameCounter"] = 0;
        } else if (isNotEmpty(rightHandPosesDiff) && rightHandPosesDiff.x > 0) {
            diffState = await createOrAddToKey(diffState, Positions.rightWrist, rightHandPosesDiff.x);
            diffState = await this.resetDistanceIfNeeded(rightHandPosesDiff, diffState);
            diffState["isDetectMotion"] = await this.checkMovement(diffState);
            diffState = await createOrAddToKey(diffState, "frameCounter", 1);
            console.log("wrist pose diff:", rightHandPosesDiff, diffState[Positions.rightWrist]);
        }
        return diffState;
    }

    resetDistanceIfNeeded(rightHandPosesDiff, diffState) {
        if (isNotEmpty(rightHandPosesDiff) && rightHandPosesDiff.x < 0) {
            diffState[Positions.rightWrist] = 0;
            diffState["frameCounter"] = 0;
        }

        return diffState;
    }


    checkMovement(difState) {
        return (isNotEmpty(difState[Positions.rightWrist]) &&
            difState[Positions.rightWrist] > this.wristThreshold &&
            difState[Positions.rightWrist] < 100);
    }

}


