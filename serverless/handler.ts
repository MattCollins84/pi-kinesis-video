console.log('Loading function');
import { FacialRecognition } from './lib/FacialRecognition';

export const facialRecognition = async (event) => {
  const lib = new FacialRecognition();
  return await lib.processSNSEvent(event);
}