IoT Fuse Machine Learning Helper App
---

Installation
----
Clone this repo. 

At least 3 ways to run on device:

1. Follow instructions for [Build Projects with Native Code on React Native Quickstart guide](https://facebook.github.io/react-native/docs/getting-started.html) and use command

```
react-native run-android 
``` 
(or run-ios)
This option will allow you to make changes to code.

2. Open ./android with Android studio and run the project on a device. Likewise, open ./ios with Xcode and run. 

3. Open android/build/outputs/apk/app-debug.apk and install apk on your android.

Data
----
Each data point is a JSON object:
```
dataset = {
  acceleration: 
{
  timestamp: integer,
  x: float,
  y: float,
  z: float,
},
gyroscope: 
{
  timestamp: integer,
  x: float,
  y: float,
  z: float,
}
}[]
```
Data sends as an array of Accelerometer/Gyro objects. Timestamp for accelerometer object and gyroscope object are DIFFERENT. 

Each request has a device id attached as a parameter. 

**Example raw body:**
```json
[{"acceleration":{"timestamp":1523719520931,"z":9.883264541625977,"y":-0.1628057211637497,"x":-0.047884032130241394},"gyroscope":{"timestamp":1523719520891,"z":0,"y":0.0024434609804302454,"x":0}},{"acceleration":{"timestamp":1523719521031,"z":9.873687744140625,"y":-0.17238251864910126,"x":-0.07661445438861847},"gyroscope":{"timestamp":1523719520991,"z":0,"y":0.0024434609804302454,"x":0}},{"acceleration":{"timestamp":1523719521131,"z":9.864110946655273,"y":-0.15322890877723694,"x":-0.019153613597154617},"gyroscope":{"timestamp":1523719521091,"z":0,"y":0.0024434609804302454,"x":0}},{"acceleration":{"timestamp":1523719521231,"z":9.90241813659668,"y":-0.17238251864910126,"x":-0.038307227194309235},"gyroscope":{"timestamp":1523719521191,"z":0,"y":0.0024434609804302454,"x":0}},{"acceleration":{"timestamp":1523719521331,"z":9.864110946655273,"y":-0.181959331035614,"x":-0.07661445438861847},"gyroscope":{"timestamp":1523719521291,"z":0,"y":0.0024434609804302454,"x":0}}]
```

**Example request url:** http://requestbin.fullcontact.com/190q3ph1?device=1d44f40a57091017

