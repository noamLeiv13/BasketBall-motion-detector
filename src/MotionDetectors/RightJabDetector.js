import {Positions} from "../Config/config";
import {createOrAddToKey, isNotEmpty} from "../Utils/utils";
import {diffBetweenPoses} from "../Utils/MotionDetactor";


export class RightJabDetector {

    constructor(minScore) {
        this.minScore = minScore;
        this.ankleThreshold = -60;
        this.detect = this.detect.bind(this);
    }

    async detect(lastPose, currentPose, diffState) {
        diffState["isDetectMotion"] = false;
        let rightAnklePosesDiff = await diffBetweenPoses(lastPose, currentPose, Positions.rightAnkle, this.minScore);
        if (isNotEmpty(rightAnklePosesDiff) && rightAnklePosesDiff.x < 0) {
            diffState = await this.resetDistanceIfNeeded(rightAnklePosesDiff, diffState);
            diffState = await createOrAddToKey(diffState, Positions.rightAnkle, rightAnklePosesDiff.x);
            diffState["isDetectMotion"] = await this.checkMovement(diffState);
        }
        if (diffState["isDetectMotion"])
            console.log("diff:", diffState[Positions.rightAnkle]);
        return diffState;
    }

    resetDistanceIfNeeded(rightAnklePosesDiff, diffState) {
        if (isNotEmpty(rightAnklePosesDiff) && rightAnklePosesDiff.x > 0)
            diffState[Positions.rightAnkle] = 0;

        return diffState;
    }


    checkMovement(diffState) {
        return (isNotEmpty(diffState[Positions.rightAnkle]) &&
            diffState[Positions.rightAnkle] < this.ankleThreshold);
    }

}


