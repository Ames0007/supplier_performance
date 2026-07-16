/**
 * Mail integration seam (Outlook / Microsoft Graph). Documented port only;
 * the concrete sender is implemented alongside the Notifications phase (P9).
 */
export interface MailMessage {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

export interface MailSender {
  send(message: MailMessage): Promise<void>;
}
