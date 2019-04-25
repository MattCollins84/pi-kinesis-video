import { SNS } from 'aws-sdk';

export class FacialRecognition {

  private sns: SNS = null;

  constructor() {
    this.sns = new SNS();
  }

  async processSNSEvent(event): Promise<any> {

    event.Records.forEach(record => {

      // Kinesis data is base64 encoded so decode here
      const load = new Buffer(record.kinesis.data, 'base64').toString('ascii');
      const payload = JSON.parse(load);

      const faces = payload.FaceSearchResponse;
      if (faces === null || faces.length === 0) return 'No Faces found'
      
      console.log(faces.length, 'faces found')
      const opts = {
        Message: JSON.stringify(faces),
        TopicArn: process.env.snsTopic
      };

      return this.sns.publish(opts).promise();

    });

  }

}