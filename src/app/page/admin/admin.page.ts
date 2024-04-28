import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, LoadingController, NavController, ToastController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  pairedList: any;
  listToggle: boolean = false;
  pairedDeviceId: number = 0;
  dataSend = "";
  isModalOpen = false;
  isDeviceConnected: boolean = false;
  connectionCheckInterval: any;
  fingers: Persona[] = [];
  bytes: String = '';
  private _storage: Storage | null = null;
  name: String = '';
  storageLenght: any;

  

  constructor(private storage: Storage, private router: Router, public navCtrl: NavController, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
    this.checkIsConnected();
    this.init();
    this.connectionCheckInterval = setInterval(() => {
      this.checkIsConnected();
    }, 5000);

  }

  async getStoredIds() {
    this.fingers = [];
    this.storage.forEach((key, value) => {
      let item: Persona = {id: value, nombre: key};
      this.fingers.push(item);
    });
      }

  async getStorageLenght() {
    await this.storage.length().then(result => {
      this.storageLenght = result;
    });
  }

  async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.getStorageLenght();
    this.getStoredIds()
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
      this.showToast("Conectado correctamente.", 4000);
    }, error => {
      loading.dismiss();
      this.showToast("Algo ha fallado, asegurate que sea un dispositivo iDoor.", 4000);
    })
  }

  // Verifica si el dispositivo se encuentra conectado o no y cambio el boton en HTML con *ngIf y el this.isDeviceConnected.
  checkIsConnected() {
    this.bluetoothSerial.isConnected().then(success => {
      this.isDeviceConnected = true;
    }, error => {
      this.isDeviceConnected = false;
    });
  }

  // Dispositivo conectado!.
  deviceConnected() {
    this.bluetoothSerial.subscribe("\n").subscribe(success => {
      this.showToast("Conectado correctamente", 4000)
    }, error => {
      this.showError(error);
    })
  }

  // Desconecta el dispositivo.
  deviceDisconnect() {
    this.bluetoothSerial.disconnect();
    this.isDeviceConnected = false;
    this.showToast("Se ha desconectado del dispositivo", 4000);
  }

  addFinger(id: any) {
    this.bluetoothSerial.subscribe('\n').subscribe(
      data => {
        this.showToast(data, 10000);
        if (data.toString().trim() == 'Exito') {
          this.set(id.toString(), this.name).then( () => {
            this.getStoredIds()
          });
        }
      }
    );
  }

  async removeFinger(id: any) {
    await this.storage.remove(id).then( ()=> {
      this.getStoredIds()
    });
  }

  // Enviar byte segun sea necesario el caso. 'a': Nueva huella. 'b': Mostrar Usuarios. 'c': Eliminar un usuario en especifico.
  sendByte(dataToSend: String, id: any) {
    this.bluetoothSerial.isConnected().then(success => {
      this.bluetoothSerial.write(dataToSend).then(success => {
        switch (dataToSend) {
          case 'a':
            this.getStorageLenght();
            this.bluetoothSerial.write(this.storageLenght.toString());
            this.addFinger(id);
            break;
          case 'b':
            this.bluetoothSerial.write(id);
            this.removeFinger(id);
            this.showToast('Eliminado correctamente!', 5000);

            break;
          default:
            break;
        }
      }, error => {
        this.showToast(error, 3000);
      })
    }, error => {
      this.showToast("Asegurate de que el dispositivo este conectado.", 3000);
    })

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
  async showToast(message: string, duration: number) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'bottom',
      buttons: this.toastButtons

    });
    (await toast).present();
  }

  // Abre el modal del HTML donde se encuentran los dispositivos BT.
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  public toastButtons = [
    {
      text: 'Ocultar',
      role: 'cancel',
    },
  ];

}

interface pairedList {
  'class': number,
  'id': String,
  'address': String,
  'name': String
};
type Persona = {
  id: string;
  nombre: string;
};

