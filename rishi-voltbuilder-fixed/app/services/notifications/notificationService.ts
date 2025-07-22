export interface Notification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  constructor() {
    if (NotificationService.instance) {
      return NotificationService.instance;
    }
    NotificationService.instance = this;
  }

  static getInstance(): NotificationService {
    return new NotificationService();
  }

  async sendNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.push(newNotification);

    // In development, just log
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Notification] ${notification.type.toUpperCase()}: ${notification.title} - ${notification.message}`,
      );
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.read = true;
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default NotificationService;
