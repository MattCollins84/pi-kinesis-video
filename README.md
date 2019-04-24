# pi-kinesis-video
Facial Recognition using a Raspberry Pi and Amazon Kinesis Video Streams

# Pre-requisites
AWS account
aws cli setup

## Create video stream
aws kinesisvideo create-stream --stream-name PiStream --data-retention-in-hours 1
aws kinesisvideo describe-stream --stream-name PiStream
{
    "StreamInfo": {
        "Status": "ACTIVE", 
        "StreamName": "PiStream", 
        "CreationTime": 1555582668.214, 
        "Version": "GUZUpewmw6iaJkwsm6vS", 
        "StreamARN": "arn:aws:kinesisvideo:eu-west-1:804937996574:stream/PiStream/1555582668214", 
        "KmsKeyId": "arn:aws:kms:eu-west-1:804937996574:alias/aws/kinesisvideo", 
        "DataRetentionInHours": 1
    }
}


## Rekognition face collection
aws rekognition create-collection --collection-id faces
aws rekognition index-faces --cli-input-json file://./index.json
aws rekognition index-faces --collection-id faces --external-image-id Matt-1 --image-bytes fileb://./matt.jpg
aws rekognition index-faces --collection-id faces --external-image-id Matt-2 --image-bytes fileb://./matt-2.jpg
aws rekognition index-faces --collection-id faces --external-image-id Matt-3 --image-bytes fileb://./matt-3.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-1 --image-bytes fileb://./mike.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-2 --image-bytes fileb://./mike-2.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-3 --image-bytes fileb://./mike-3.jpg

aws rekognition list-faces --collection-id faces

aws rekognition search-faces --collection-id faces --max-faces 1 --face-match-threshold 70 --face-id d99465fc-d4e0-4468-b140-c73bc336187c

aws rekognition search-faces-by-image --collection-id faces --image-bytes fileb://./matt-4.jpg

## Kinesis Data Stream
aws kinesis create-stream --stream-name FacialRecognition --shard-count 1
aws kinesis list-streams
{
    "StreamNames": [
        "FacialRecognition"
    ]
}
aws kinesis describe-stream --stream-name FacialRecognition

## Stream processor
aws rekognition create-stream-processor --cli-input-json file://processor.json
{
    "StreamProcessorArn": "arn:aws:rekognition:eu-west-1:804937996574:streamprocessor/FacialRecognitionStreamProcessor"
}
{
   "Name": "FacialRecognitionStreamProcessor",
   "Input": {
    "KinesisVideoStream": {
       "Arn": "arn:aws:kinesisvideo:eu-west-1:804937996574:stream/PiStream/1555582668214"
    }
   },
   "Output": {
    "KinesisDataStream": {
       "Arn": "arn:aws:kinesis:eu-west-1:804937996574:stream/FacialRecognition"
    }
   },
   "RoleArn": "arn:aws:iam::804937996574:role/FacialRecognitionBlog",
   "Settings": {
    "FaceSearch": {
       "CollectionId": "faces",
       "FaceMatchThreshold": 85.5
    }
   }
}

aws rekognition list-stream-processors
{
    "StreamProcessors": [
        {
            "Status": "STOPPED", 
            "Name": "FacialRecognitionStreamProcessor"
        }
    ]
}

aws rekognition start-stream-processor --name FacialRecognitionStreamProcessor
aws rekognition list-stream-processors
{
    "StreamProcessors": [
        {
            "Status": "RUNNING", 
            "Name": "FacialRecognitionStreamProcessor"
        }
    ]
}

aws rekognition stop-stream-processor --name FacialRecognitionStreamProcessor