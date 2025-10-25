import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Mock email service for development
   * In production, integrate with real email provider (SendGrid, SES, etc)
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    this.logger.log('📧 [MOCK EMAIL] ===================================');
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log('---');
    this.logger.log(options.html);
    this.logger.log('================================================');

    // Simulate async operation
    return Promise.resolve();
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    slug: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Bem-vindo à Plataforma de Excursões',
      html: `
        <h1>Olá ${name}!</h1>
        <p>Sua agência foi criada com sucesso!</p>
        <p><strong>Slug:</strong> ${slug}</p>
        <p>Você pode acessar sua agência em: <a href="https://${slug}.example.com">https://${slug}.example.com</a></p>
        <p>Próximos passos:</p>
        <ul>
          <li>Configure sua agência</li>
          <li>Adicione seus primeiros agentes</li>
          <li>Crie suas primeiras excursões</li>
        </ul>
      `,
    });
  }

  async sendInviteEmail(
    email: string,
    tenantName: string,
    token: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Convite para ${tenantName}`,
      html: `
        <h1>Você foi convidado!</h1>
        <p>Você recebeu um convite para administrar a agência <strong>${tenantName}</strong>.</p>
        <p>Clique no link abaixo para aceitar o convite:</p>
        <p><a href="https://example.com/auth/accept-invite?token=${token}">Aceitar Convite</a></p>
        <p>Este link expira em 7 dias.</p>
      `,
    });
  }
}
