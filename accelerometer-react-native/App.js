import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';

import RNSensors from 'react-native-sensors';
import DeviceInfo from 'react-native-device-info';

const { Accelerometer, Gyroscope } = RNSensors;
let accelerationObservable;

let gyroscopeObservable;

const accelData = [];
let uniqueId;
let url;

function postData(data, url) {

  if (typeof uniqueId !== 'undefined') {
    url = `${url}?device=${uniqueId}`
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      acceleration: {
        x: 'unknown',
        y: 'unknown',
        z: 'unknown',
      },
      gyroscope: {
        x: 'unknown',
        y: 'unknown',
        z: 'unknown',
      },
      postAttempt: 0,
      successfulAttempt: 0,
      failedAttempt: 0,
      updateInterval: '100',
      postFrequency: '2000',
      postUrl: 'https://p7uk7d6b6k.execute-api.us-east-1.amazonaws.com/demo/stream',
    };
  }

  runAccelAndGyro() {

    if (accelerationObservable) {
      accelerationObservable.stop();
    }

    if (gyroscopeObservable) {
      gyroscopeObservable.stop();
    }

    accelerationObservable = new Accelerometer({
      updateInterval: parseInt(this.state.updateInterval),
    });

    gyroscopeObservable = new Gyroscope({
      updateInterval: parseInt(this.state.updateInterval),
    });

    accelerationObservable
      .subscribe(acceleration => {
        this.setState({
          acceleration,
        });
        const sendObject = {
          acceleration: this.state.acceleration,
          gyroscope: this.state.gyroscope,
        };

        accelData.push(sendObject);
        const compilePostMax = this.state.postFrequency / this.state.updateInterval;
        if (accelData.length >= compilePostMax) {
          const copyData = [];
          Object.assign(copyData, accelData);

          postData(copyData, this.state.postUrl)
            .then((responseText) => {
              console.log(`response ${responseText}`);
              this.setState((prevState) => {
                return { successfulAttempt: prevState.successfulAttempt + 1 };
              });
            })
            .catch((error) => {
              this.setState((prevState) => {
                return { failedAttempt: prevState.successfulAttempt + 1 };
              });
            });

          accelData = [];
          this.setState((prevState) => {
            return { postAttempt: prevState.postAttempt + 1 };
          });
        }

      });

    gyroscopeObservable
      .subscribe(gyroscope => {
        this.setState({
          gyroscope,
        });
      });
  }

  componentDidUpdate(prevState) {
    if(this.state.updateInterval != prevState.updateInterval) {
      this.runAccelAndGyro();
    }
  }

  componentWillMount() {
    uniqueId = DeviceInfo.getUniqueID();
    this.runAccelAndGyro();
  }

  render() {
    const {
      acceleration,
      gyroscope,
      postAttempt,
      successfulAttempt,
      failedAttempt,
      updateInterval,
      postFrequency,
      postUrl,
    } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container}>
        <Text>{'Posting to url: ' + this.state.postUrl}</Text>
        <TextInput
          defaultValue={postUrl}
          onSubmitEditing={(event) => this.setState({ postUrl: event.nativeEvent.text })}
          style={styles.inputBox}
        />
        <Text>{`Posts every ${this.state.postFrequency} ms`}</Text>
        <TextInput
          style={styles.inputBox}
          defaultValue={postFrequency}
          onSubmitEditing={(event) => this.setState({ postFrequency: event.nativeEvent.text })}
        />
        <Text>{`Reads data every ${this.state.updateInterval} ms`}</Text>
        <TextInput
          style={styles.inputBox}
          defaultValue={updateInterval}
          onSubmitEditing={(event) => this.setState( {updateInterval: event.nativeEvent.text})}
        />
        <Text style={styles.welcome}>
          Acceleration:
        </Text>
        <Text style={styles.textSmall}>
          {'x: ' + acceleration.x}
        </Text>
        <Text style={styles.textSmall}>
          {'y: ' + acceleration.y}
        </Text>
        <Text style={styles.textSmall}>
          {'z: ' + acceleration.z}
        </Text>
        <Text style={styles.welcome}>
          Gyroscope:
        </Text>
        <Text style={styles.textSmall}>
          {'x: ' + gyroscope.x}
        </Text>
        <Text style={styles.textSmall}>
          {'y: ' + gyroscope.y}
        </Text>
        <Text style={styles.textSmall}>
          {'z: ' + gyroscope.z}
        </Text>
        <Text style={styles.welcome}>
          Posted Data Attempts: {postAttempt}
        </Text>
        <Text style={styles.success}>
          Successes: {successfulAttempt}
        </Text>
        <Text style={styles.fail}>
          Fails: {failedAttempt}
        </Text>
      </KeyboardAvoidingView>
    );
  }

  componentWillUnmount() {
    accelerationObservable.stop();
    gyroscopeObservable.stop();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    marginLeft: 15,
    marginTop: 30,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'left',
    margin: 7,
  },
  success: {
    fontSize: 20,
    textAlign: 'left',
    margin: 7,
    color: '#ff0033',

  },
  fail: {
    fontSize: 20,
    textAlign: 'left',
    margin: 7,
    color: '#00ff33',

  },
  instructions: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
  },
  textSmall: {
    fontSize: 15,
    textAlign: 'left',
    color: '#993366',
    marginBottom: 3,
  },
  inputBox: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
  }
});
