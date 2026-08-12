import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { AppNotification } from '../api/notification-api.service';

@Injectable({ providedIn: 'root' })
export class NotificationWebSocketService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private stompClient: Client | null = null;

  readonly connected = signal(false);
  readonly notification$ = new Subject<AppNotification>();

  connect(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const token = this.getAccessToken();
    if (!token) return;

    if (this.stompClient?.active) return;

    const origin = window.location.origin;
    const wsProtocol = origin.startsWith('https') ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${new URL(origin).host}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.onConnect = () => {
      this.connected.set(true);
      this.stompClient!.subscribe(`/topic/notifications/user/${user.id}`, (message: IMessage) => {
        try {
          const notification: AppNotification = JSON.parse(message.body);
          this.notification$.next(notification);
        } catch {
          /* ignore */
        }
      });
    };

    this.stompClient.onDisconnect = () => this.connected.set(false);
    this.stompClient.onStompError = () => this.connected.set(false);
    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
    this.connected.set(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private getAccessToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }
}
