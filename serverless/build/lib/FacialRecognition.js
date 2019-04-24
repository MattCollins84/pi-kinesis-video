"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
class FacialRecognition {
    constructor() {
        this.sns = null;
        this.sns = new aws_sdk_1.SNS();
    }
    processSNSEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.Records.forEach(record => {
                // Kinesis data is base64 encoded so decode here
                const load = new Buffer(record.kinesis.data, 'base64').toString('ascii');
                const payload = JSON.parse(load);
                const faces = payload.FaceSearchResponse;
                if (faces === null)
                    return 'No Faces found';
                console.log(faces.length, 'faces found');
                const opts = {
                    Message: JSON.stringify(faces),
                    TopicArn: process.env.snsTopic
                };
                return this.sns.publish(opts).promise();
            });
        });
    }
}
exports.FacialRecognition = FacialRecognition;
//# sourceMappingURL=FacialRecognition.js.map