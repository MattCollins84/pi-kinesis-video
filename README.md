# pi-kinesis-video
Use a Raspberry Pi and Amazon Kinesis Video Streams to perform facial recognition on a live video stream.

[Link to article (Part 1)](https://medium.com/@matt.collins/facial-recognition-with-a-raspberry-pi-and-kinesis-video-streams-part-1-662f0bec5488)

[Link to article (Part 2)](https://medium.com/@matt.collins/facial-recognition-with-a-raspberry-pi-and-kinesis-video-streams-part-2-9c9a631e8c24)

Uses the following tech:

* Raspberry Pi and Camera Module
* Node.js (less than 50 lines of code)
* Several AWS services such as Kinesis, Lambda, SNS, and Rekognition

## Pre-requisites
* Raspberry Pi and Camera Module
* Node.js
* AWS account
* AWS CLI

You can install the AWS CLI like so (you will need you access/secret keys):

```
# Install the AWS CLI
sudo pip install awscli

# Configure the CLI
aws configure
```

You will also need to export your AWS credentials as environment variables (these can be added to your `~/.bashrc` startup file if you wish):

```
export AWS_ACCESS_KEY_ID=YourAccessKeyId
export AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
export AWS_DEFAULT_REGION=eu-west-1
```

## Quick command reference
A full breakdown of all of the steps is provided in the article itself, but a quick reference for each of the commands mentioned can be found below.

**Note: These commands are not neccessarily shown in the correct order, and should just be used as a reference**

### Create a Video Stream

```
# Create Stream
aws kinesisvideo create-stream --stream-name PiStream --data-retention-in-hours 1

# Describe Stream
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
```

### Setup the C++ Prodicer SDK

```
# Clone the C++ SDK
git clone https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git

# Install dependencies
sudo apt-get install -y cmake g++ glib-2.0 libssl-dev libcurl4-openssl-dev liblog4cplus-1.1-9 liblog4cplus-de
sudo apt-get install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev gstreamer1.0-plugins-base-apps
sudo apt-get install -y gstreamer1.0-plugins-bad gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools
sudo apt-get install -y gstreamer1.0-omx

# Download PEM file
wget https://www.amazontrust.com/repository/SFSRootCAG2.pem

# Move to correct location
sudo cp SFSRootCAG2.pem /etc/ssl/cert.pem

# Build producer example
cd amazon-kinesis-video-streams-producer-sdk-cpp/kinesis-video-native-build
./min-install-script

# Run producer example
./kinesis_video_gstreamer_sample_app PiStream -w 640 -h 480 -f 15
```

### Troubleshoot Raspberry Pi Camera

```
# This means that the camera is not attached
ls /dev/video*
> ls: cannot access '/dev/video*': No such file or directory

# This confirms that the camera is supported
cgencmd get_camera
> supported=1 detected=1

# This will re-attach the camera
sudo modprobe bcm2835-v4l2

# Camera confirmed attached
ls /dev/video*
> /dev/video0
```

### Rekognition face collection

```
# Create collection
aws rekognition create-collection --collection-id faces

# Index new faces into the collection
aws rekognition index-faces --collection-id faces --external-image-id Matt-1 --image-bytes fileb://matt.jpg
aws rekognition index-faces --collection-id faces --external-image-id Matt-2 --image-bytes fileb://matt-2.jpg
aws rekognition index-faces --collection-id faces --external-image-id Matt-3 --image-bytes fileb://matt-3.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-1 --image-bytes fileb://mike.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-2 --image-bytes fileb://mike-2.jpg
aws rekognition index-faces --collection-id faces --external-image-id Mike-3 --image-bytes fileb://mike-3.jpg

# List the indexed faces
aws rekognition list-faces --collection-id faces

# Return a list of indexed faces that match a given face ID
aws rekognition search-faces --collection-id faces --max-faces 1 --face-match-threshold 70 --face-id d99465fc-d4e0-4468-b140-c73bc336187c

# return a list of indexed faces that can be found in the provided image
aws rekognition search-faces-by-image --collection-id faces --image-bytes fileb://matt-4.jpg
```

### Kinesis Data Stream

```
# Create a Kinesis Data Stream
aws kinesis create-stream --stream-name FacialRecognition --shard-count 1

# List the available streams
aws kinesis list-streams

# Get more information on a specific stream
aws kinesis describe-stream --stream-name FacialRecognition
```

### Rekognition Stream processor

```
# Create a new stream processor
aws rekognition create-stream-processor --cli-input-json file://processor.json

# processor.json
{
   "Name": "FacialRecognitionStreamProcessor",
   "Input": {
    "KinesisVideoStream": {
       "Arn": "<Kinesis Video Stream ARN>"
    }
   },
   "Output": {
    "KinesisDataStream": {
       "Arn": "<Kinesis Data Stream ARN>"
    }
   },
   "RoleArn": "<AWS Role ARN>",
   "Settings": {
    "FaceSearch": {
       "CollectionId": "faces",
       "FaceMatchThreshold": 85.5
    }
   }
}

# list available processors
aws rekognition list-stream-processors

# Start and stop processors
aws rekognition start-stream-processor --name FacialRecognitionStreamProcessor
aws rekognition stop-stream-processor --name FacialRecognitionStreamProcessor
```

### Serverless framework

More detalis at www.serverless.com

```
# Install serverless
sudo npm install -g serverless
```

```
# clone this repository
git clone https://github.com/MattCollins84/pi-kinesis-video.git

# install dependencies
npm install

# install typescript cli
sudo npm install -g typescript

# Deploy the Serverless service
serverless deploy
```

### SNS Topic

```
# Create SNS Topic
aws sns create-topic --name FacialRecognition

# Subscribe to an email address
aws sns subscribe --topic-arn <SNS Topic ARN> --protocol email --notification-endpoint you@your-company.com

# Publish to this topic
aws sns publish --topic-arn <SNS Topic ARN> --message "Hello, World!"
```