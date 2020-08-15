import { Component, OnInit } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';

import { map } from 'rxjs/operators';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  client: RxStomp;
  notifications: string[] = [];

  constructor() {}

  ngOnInit(): void {}

  connect() {
    let isDisconnected = !this.client || this.client.connected;
    if (isDisconnected) {
      this.client = new RxStomp();
      this.client.configure({
        webSocketFactory: () =>
          new SockJS('http://localhost:8081/notifications'),
        debug: (msg: string) => console.log(msg),
      });
      this.client.activate();
      this.notificationListener();
      this.start();
    }
  }

  disconnect() {
    const isConnected = this.client && this.client.connected;
    if (isConnected) {
      this.stop();
      this.client.deactivate();
      this.client = null;
    }
  }

  notificationListener() {
    this.client
      .watch('/user/topic/notifications')
      .pipe(
        map((response) => {
          const text: string = JSON.parse(response.body).text;
          return text;
        })
      )
      .subscribe((notification: string) =>
        this.notifications.push(notification)
      );
  }

  private start() {
    this.client.publish({ destination: '/app/start' });
  }

  private stop() {
    let isConnected = this.client && this.client.connected;
    if (isConnected) {
      this.client.publish({ destination: '/app/stop' });
    }
  }
}
