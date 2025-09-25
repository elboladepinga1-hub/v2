interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{ email: string }>;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;

  constructor() {
    // Check for token in window object (set via console)
    this.accessToken = (window as any).__GCAL_TOKEN || null;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    (window as any).__GCAL_TOKEN = token;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async createEvent(event: CalendarEvent): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Google Calendar não está autenticado. Execute: window.__GCAL_TOKEN="seu_token_aqui" no console.');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro do Google Calendar: ${error.error?.message || 'Erro desconhecido'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      throw error;
    }
  }

  async createBookingEvent(bookingData: any): Promise<any> {
    const startDateTime = new Date(`${bookingData.eventDate}T${bookingData.eventTime}`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours default

    const event: CalendarEvent = {
      summary: `📸 ${bookingData.eventType} - ${bookingData.clientName}`,
      description: `
Sessão fotográfica agendada via Wild Pictures Studio

Cliente: ${bookingData.clientName}
Email: ${bookingData.clientEmail}
Telefone: ${bookingData.phone || 'Não informado'}
Tipo: ${bookingData.eventType}
Pacote: ${bookingData.packageTitle || 'Não especificado'}
Valor: R$ ${bookingData.totalAmount?.toFixed(0) || '0'}

Observações: ${bookingData.message || 'Nenhuma observação adicional'}

Local: ${bookingData.eventLocation || 'A definir'}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      location: bookingData.eventLocation || '',
      attendees: [
        { email: bookingData.clientEmail },
        { email: 'wildpicturesstudio@gmail.com' }
      ],
    };

    return await this.createEvent(event);
  }
}

export const googleCalendar = new GoogleCalendarService();
