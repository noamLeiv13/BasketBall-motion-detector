import {Positions} from "../Config/config";
import {diffBetweenPoses} from "../Utils/MotionDetactor";
import {createOrAddToKey, isNotEmpty} from "../Utils/utils";


export class PumpFakeDetector {

    constructor(minScore) {
        this.minScore = minScore;
        this.minDistance = -40;
        this.detect = this.detect.bind(this);
    }

    async detect(lastPose, currentPose, diffState) {
        diffState["isDetectMotion"] = false;
        let rightWristPosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.rightWrist, this.minScore);
        let leftWristPosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.leftWrist, this.minScore);
        if (isNotEmpty(rightWristPosesDiff) && rightWristPosesDiff.y < 0)
            diffState = await createOrAddToKey(diffState, Positions.rightWrist, rightWristPosesDiff.y);
        if (isNotEmpty(leftWristPosesDiff) && leftWristPosesDiff.y < 0)
            diffState = await createOrAddToKey(diffState, Positions.leftWrist, leftWristPosesDiff.y);
        diffState = await this.resetDistanceIfNeeded(rightWristPosesDiff, leftWristPosesDiff, diffState);
        diffState["isDetectMotion"] = await this.checkMovement(diffState);
        return diffState;
    }


    resetDistanceIfNeeded(rightWristPosesDiff, leftWristPosesDiff, diffState) {
        if ((isNotEmpty(rightWristPosesDiff) && rightWristPosesDiff.y > 0) ||
            (isNotEmpty(leftWristPosesDiff) && leftWristPosesDiff.y > 0)) {
            diffState[Positions.rightWrist] = 0;
            diffState[Positions.leftWrist] = 0;
        }
        return diffState;
    }

    checkMovement(difState) {
        return (isNotEmpty(difState[Positions.rightWrist]) &&
            difState[Positions.rightWrist] < this.minDistance) ||
            (isNotEmpty(difState[Positions.leftWrist]) &&
                difState[Positions.leftWrist] < this.minDistance);
    }

}



