import { Component } from '@angular/core';

import { WindowRefProvider } from '../../providers/window-ref/window-ref';
import { ApiProvider } from '../../providers/api/api';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  mode: string = 'training';
  on: HTMLAudioElement;
  off: HTMLAudioElement;
  overlay: boolean = false;

  sub: Subscription;
  recordData: boolean = true;
  strData: string;
  orientation: DeviceOrientationEvent;
  accelerationG: DeviceAcceleration;
  deviceID: string;

  data: {}[] = [];
  dataSent: number = 0;
  unsentData: {}[] = [];
  currentGyro: any;

  newMotionEvent: Subject<{
    acceleration: {
      x: any,
      y: any,
      z: any,
      timestamp: number,
    },
    gyroscope?: {
      x: any,
      y: any,
      z: any,
      timestamp: number,
    }
  }> = new Subject();
  constructor(public window: WindowRefProvider, public api: ApiProvider, public alertCtrl: AlertController) {
    this.deviceID = this.guid();
  }

  ionViewDidLoad() {
    this.deviceMovement();
    this.deviceOrientation();
    this.loadAudio();
  }

  deviceOrientation() {
    this.window.nativeWindow.addEventListener("deviceorientation", (event: DeviceOrientationEvent) => {
      this.orientation = event;
      const dataPoint = {
        gyroscope: {
          x: this.orientation.alpha,
          y: this.orientation.beta,
          z: this.orientation.gamma,
          timestamp: (new Date).getTime()
        }
      }
      this.currentGyro = dataPoint;

    });
  }

  deviceMovement() {
    this.window.nativeWindow.addEventListener("devicemotion", (event) => {
      this.accelerationG = event.accelerationIncludingGravity;
      const dataPoint = {
        acceleration: {
          x: this.accelerationG.x,
          y: this.accelerationG.y,
          z: this.accelerationG.z,
          timestamp: (new Date).getTime()
        }
      }

      this.overlay = Math.abs(dataPoint.acceleration.y) > 8.0;

      this.newMotionEvent.next({ ...dataPoint, ...this.currentGyro });

    })
  }

  startRecording() {
    this.on.play();
    this.eventCollection();
  }

  stopRecording() {
    this.off.play();
    this.sub.unsubscribe();
    if (this.mode == 'training') {
      this.showRadio();
    } else {
      this.data = [];
    }
  }

  toggleRecording() {
    if (this.data.length === 0) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  eventCollection() {
    this.sub = this.newMotionEvent.subscribe((event) => {
      if (this.data.length < 2000) { // arbitrary limit on data size, this is over 30 seconds of data which is more than enough
        this.data.push(event);
      }
      if (this.mode == 'guessing') {
        this.streamToApi();
      }
    })
  }

  sendToApi(classifier: string) {
    this.cleanGuid();
    this.api.shipIt(this.data, this.deviceID, classifier).subscribe(
      () => {
        console.log(`successfully posted ${this.data.length} data points`);
        this.dataSent += this.data.length;
        this.data = [];

      },
      (err) => {
        console.log(JSON.stringify(err));
        this.data = []; // for now just throw out unsent data

      })
  }

  streamToApi() {
    // devicemotion api reports every 16ms, so collecting 100 data points should take about 1.6 seconds
    if (this.data.length === 100) {
      this.cleanGuid();
      const dataToSend = this.data.splice(0, 100);
      this.api.streamIt(dataToSend, this.deviceID).subscribe(
        () => {
          console.log(`successfully posted ${dataToSend.length} data points`);
          this.dataSent += dataToSend.length;

        },
        (err) => {
          console.log(JSON.stringify(err));
          this.data = []; // for now just throw out unsent data
        })
    }
  }


  /**
  * @function _guid
  * @description Creates GUID for user based on several different browser variables
  * It will never be RFC4122 compliant but it is robust
  * @returns {Number}
  * 
  */
  guid(): string {

    const nav = this.window.nativeWindow.navigator;
    const screen = this.window.nativeWindow.screen;
    let guid = nav.mimeTypes.length.toString();
    guid += nav.userAgent.replace(/\D+/g, '');
    guid += nav.plugins.length;
    guid += screen.height || '';
    guid += screen.width || '';
    guid += screen.pixelDepth || '';

    return parseInt(guid).toString(16).substr(0,16);
  };

  cleanGuid() {
    this.deviceID = encodeURI(this.deviceID.substr(0,16).replace(/\W+/g, '-')) || this.guid();

  }

  pushDataPoint(dataPoint) {
    if (this.recordData) {
      this.data.push(dataPoint);
    }
  }

  showRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select movement type');

    alert.addInput({
      type: 'radio',
      label: 'Nodding Yes',
      value: 'yes',
      checked: true
    });

    alert.addInput({
      type: 'radio',
      label: 'Shaking Head No',
      value: 'no',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Neither',
      value: 'neither',
      checked: false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: choice => {
        this.sendToApi(choice);
      }
    });
    alert.present();
  }

  loadAudio() {
    this.on = new Audio();
    this.on.src = "../../../assets/sounds/modem.mp3";
    this.on.load();
    this.off = new Audio();
    this.off.src = "../../../assets/sounds/woof.mp3";
    this.off.load();
  }

}
