import {Positions} from "../Config/config";
import {diffBetweenPoses} from "../Utils/MotionDetactor";
import {createOrAddToKey, isNotEmpty} from "../Utils/utils";


export class LeftJabDetector {

    constructor(minScore) {
        this.minScore = minScore;
        this.ankleThreshold = 50;
        this.detect = this.detect.bind(this);
    }

    async detect(lastPose, currentPose, diffState) {
        diffState["isDetectMotion"] = false;
        let leftAnklePosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.leftAnkle, this.minScore);
        if (isNotEmpty(leftAnklePosesDiff) && leftAnklePosesDiff.x > 0) {
            diffState = await this.resetDistanceIfNeeded(leftAnklePosesDiff, diffState);
            diffState = await createOrAddToKey(diffState, Positions.leftAnkle, leftAnklePosesDiff.x);
            diffState["isDetectMotion"] = await this.checkMovement(diffState);
        }
        return diffState;
    }

    resetDistanceIfNeeded(leftAnklePosesDiff, diffState) {
        if (isNotEmpty(leftAnklePosesDiff) && leftAnklePosesDiff.x < 0)
            diffState[Positions.leftAnkle] = 0;

        return diffState;
    }


    checkMovement(difState) {
        return (isNotEmpty(difState[Positions.leftAnkle]) &&
            difState[Positions.leftAnkle] > this.ankleThreshold);
    }

}









