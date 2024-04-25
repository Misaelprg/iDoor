import { Component, OnInit } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  arreglo: any[] = ["Misael","Ximena","Hugo","Armando"];
  bytes: any;


  constructor(private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  handleData() {
    // Procesar los bytes recibidos según sea necesario
    this.bluetoothSerial.read().then(data => {
      this.bytes = data;
      for (let i = 0; i < this.bytes.length; i++) {
        this.arreglo.push(this.bytes.charAt(i));
    }

      alert(this.arreglo);
    }, error => {
      alert(error);
    })
  }

  async showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    (await toast).present();
  }

}
