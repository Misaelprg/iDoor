import { Component } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  pairedList: any;
  listToggle: boolean = false;
  pairedDeviceId: number = 0;
  dataSend = "";
  isModalOpen = false;



  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
    this.checkBluetoothEnable();
  }

  checkBluetoothEnable() {
    this.bluetoothSerial.isEnabled().then(success => {
      this.listPairedDevices();
    }, error => {
      this.showError("Por favor, activa el Bluetooth");
    })
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      console.log(this.pairedList);
      this.listToggle = true;
    }, error => {
      this.showError(error);
      this.listToggle = false;
    })
  }

  selectDevice(pairedDeviceId: any) {
    let connectedDevice = this.pairedList[pairedDeviceId];
    if (!connectedDevice.address) {
      this.showError("Selecciona un dispositivo al que conecterse");
      return;
    }

    let address = connectedDevice.address;
    let name = connectedDevice.name;
    this.connect(address);
  }

  async connect(address: any) {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.bluetoothSerial.connect(address).subscribe(success => {
      this.deviceConnected();
      loading.dismiss();
      this.showToast("Conectado correctamente.");
    }, error => {
      loading.dismiss();
      this.showToast("Algo ha fallado, asegurate que sea un dispositivo iDoor.");
    })
  }

  deviceConnected() {
    this.bluetoothSerial.subscribe("\n").subscribe(success => {
      this.handleData(success);
      this.showToast("Conectado correctamente")
    }, error => {
      this.showError(error);
    })
  }

  deviceDisconnect() {
    this.bluetoothSerial.disconnect();
    this.showToast("Se ha desconectado del dispositivo");
  }

  handleData(data: any) {
    //Montar aquí el sistema para tratar la entrada desde el dispositivo al que nos hemos conectado.
    this.showToast(data);
  }

  sendData(dataToSend: String) {

    this.bluetoothSerial.write(dataToSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    })
  }


  async showError(message: string) {
    let alert = this.alertCtrl.create({
      header: "¡Error!",
      message: message,
      buttons: ['dismiss']
    });
    (await alert).present();
  }

  async showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    (await toast).present();
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

}

interface pairedList {
  'class': number,
  'id': String,
  'address': String,
  'name': String
}