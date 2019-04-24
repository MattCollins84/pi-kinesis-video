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
console.log('Loading function');
const FacialRecognition_1 = require("./lib/FacialRecognition");
exports.facialRecognition = (event) => __awaiter(this, void 0, void 0, function* () {
    const lib = new FacialRecognition_1.FacialRecognition();
    return yield lib.processSNSEvent(event);
});
//# sourceMappingURL=handler.js.map