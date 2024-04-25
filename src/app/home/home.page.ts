import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  isDeviceConnected: boolean = false;
  connectionCheckInterval: any;



  constructor(private router: Router, public navCtrl: NavController, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
    this.isConnected();
  }

  ngOnInit() {
    this.connectionCheckInterval = setInterval(() => {
      this.isConnected();
    }, 15000);
  }

  // Revisa que el BT del dispositivo.
  checkBluetoothEnable() {
    this.bluetoothSerial.isEnabled().then(success => {
      this.setOpen(true);
      this.listPairedDevices();
    }, error => {
      this.showError("Por favor, activa el Bluetooth");
    })
  }

  // Lista los dispositivos BT vinculados (no mostrara por el momento dispositivos no vinculados desde el BT del celular).
  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
    }, error => {
      this.showError(error);
      this.listToggle = false;
    })
  }

  // Se conecta al dispositivo i-esimo de la lista (Revise el codigo HTML donde se encuentra el *ngFor="let device of this.pairedList")
  selectDevice(pairedDeviceId: any) {
    let connectedDevice = this.pairedList[pairedDeviceId];
    if (!connectedDevice.address) {
      this.showError("Selecciona un dispositivo al que conecterse");
      return;
    }

    let address = connectedDevice.address;
    this.connect(address);
  }

  // Conecta con el dispositivo.
  async connect(address: any) {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.bluetoothSerial.connect(address).subscribe(success => {
      this.deviceConnected();
      this.isDeviceConnected = true;
      loading.dismiss();
      this.setOpen(false);
      this.showToast("Conectado correctamente.");
    }, error => {
      loading.dismiss();
      this.showToast("Algo ha fallado, asegurate que sea un dispositivo iDoor.");
    })
  }

  // Verifica si el dispositivo se encuentra conectado o no y cambio el boton en HTML con *ngIf y el this.isDeviceConnected.
  isConnected() {
    this.bluetoothSerial.isConnected().then(success => {
      this.isDeviceConnected = true;
    }, error => {
      this.isDeviceConnected = false;
      this.showToast("Asegurate de que el dispositivo este conectado.");
    })
  }
  // Dispositivo conectado!.
  deviceConnected() {
    this.bluetoothSerial.subscribe("\n").subscribe(success => {
      this.showToast("Conectado correctamente")
    }, error => {
      this.showError(error);
    })
  }

  // Desconecta el dispositivo.
  deviceDisconnect() {
    this.bluetoothSerial.disconnect();
    this.isDeviceConnected = false;
    this.showToast("Se ha desconectado del dispositivo");
  }

  handleData() {
    this.bluetoothSerial.read().then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    })
  }

  // Envia datos al arduino.
  sendData(dataToSend: String) {
    this.bluetoothSerial.write(dataToSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    })
    this.handleData();
  }

  // Alerta de error.
  async showError(message: string) {
    let alert = this.alertCtrl.create({
      header: "¡Error!",
      message: message,
      buttons: ['dismiss']
    });
    (await alert).present();
  }

  // Alerta de mensajes de exito tipo toast.
  async showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    (await toast).present();
  }

  // Abre el modal del HTML donde se encuentran los dispositivos BT.
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  adminPage() {
    this.router.navigate(['/configuracion']);
  }
}

interface pairedList {
  'class': number,
  'id': String,
  'address': String,
  'name': String
}