import {Moves} from "../Config/config"
import {LeftJabDetector} from "../MotionDetectors/LeftJabDetector";
import {PumpFakeDetector} from "../MotionDetectors/DetectPumpFake";
import {LeftCrossoverDetector} from "../MotionDetectors/LeftCrossoverDetector";
import {RightCrossoverDetector} from "../MotionDetectors/RightCrossoverDetector";
import {isNotEmpty} from "./utils";
import {RightJabDetector} from "../MotionDetectors/RightJabDetector";

export async function detectPose(lastPose, currentPose, targetPose, minScore, diffState) {
    if (targetPose === Moves.pump_fake) {
        let pumpFakeDetector = new PumpFakeDetector(minScore);
        return await pumpFakeDetector.detect(lastPose, currentPose, diffState);
    }
    if (targetPose === Moves.left_jab) {
        let leftJabDetector = new LeftJabDetector(minScore);
        return await leftJabDetector.detect(lastPose, currentPose, diffState);
    }
    if (targetPose === Moves.right_jab) {
        let rightJabDetector = new RightJabDetector(minScore);
        return await rightJabDetector.detect(lastPose, currentPose, diffState);
    }
    if (targetPose === Moves.right_crossover) {
        let rightCrossoverDetector = new RightCrossoverDetector(minScore);
        return await rightCrossoverDetector.detect(lastPose, currentPose, diffState);
    }
    if (targetPose === Moves.left_crossover) {
        let leftCrossoverDetector = new LeftCrossoverDetector(minScore);
        return await leftCrossoverDetector.detect(lastPose, currentPose, diffState)
    }
}

export function getPoseBodyPart(pose, targetPositions, minScore) {
    let targetPart = undefined;
    if (pose && isNotEmpty(pose.keypoints)) {
        pose.keypoints.forEach((bodyPart) => {
            if (bodyPart.part === targetPositions && bodyPart.score > minScore)
                targetPart = {part: bodyPart.part, position: bodyPart.position, score: bodyPart.score};
        });
        return targetPart;
    }
}


export function diffBetweenPoses(lastPose, currentPose, position, minScore) {
    let lastPoseBodyPart = getPoseBodyPart(lastPose, position, minScore);
    let currPoseBodyPart = getPoseBodyPart(currentPose, position, minScore);
    if (isNotEmpty(lastPoseBodyPart) && isNotEmpty(currPoseBodyPart)) {
        let xDifference = currPoseBodyPart.position.x - lastPoseBodyPart.position.x;
        let yDifference = currPoseBodyPart.position.y - lastPoseBodyPart.position.y;
        return {x: xDifference, y: yDifference}
    }

}