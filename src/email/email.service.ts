import { HttpService, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sg from "@sendgrid/mail";
import { PrismaService } from "../prisma.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly senderDetails = {
    from: "noreply@kaaprojects.com",
  };

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    sg.setApiKey(configService.get("SENDGRID_API_KEY"));
  }

  async sendPasswordReset(email: string, url: string): Promise<void> {
    const msg: sg.MailDataRequired = {
      to: email,
      from: this.senderDetails.from,
      templateId: "d-23b2ee8457644ac6bf899152be8bffe1",
      dynamicTemplateData: {
        url,
      },
    };

    const res = await sg.send(msg);
    if (res[0].statusCode !== 202)
      this.logger.error(`Password reset could not be sent to ${email} `);
  }

  async sendPasswordResetConfirmation(email: string): Promise<void> {
    const msg: sg.MailDataRequired = {
      to: email,
      from: this.senderDetails.from,
      templateId: "d-6cee48833dd14f81adf52e03f6ace3b5",
    };

    const res = await sg.send(msg);
    if (res[0].statusCode !== 202)
      this.logger.error(
        `Password reset confirmation could not be sent to ${email}`,
      );
  }

  async sendEmailVerification(email: string, url: string): Promise<void> {
    const msg: sg.MailDataRequired = {
      to: email,
      from: this.senderDetails.from,
      templateId: "d-f952919c46154fe48f36d3adc759f1c5",
      dynamicTemplateData: {
        url,
      },
    };

    const res = await sg.send(msg);
    if (res[0].statusCode !== 202)
      this.logger.error(`Email verification could not be sent to ${email}`);
  }
}
