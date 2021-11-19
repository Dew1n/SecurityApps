import { /* inject, */ BindingScope, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { MensajesEmpleados } from '../models';

@injectable({ scope: BindingScope.TRANSIENT })
export class NotificacionesService {
  constructor() { }

  /*
   * Servicio de mensajeria Twilio
   */
  
  EnviarNotificacionesSMS(celular:String): void {
    const accountSid = 'ACf178c2606b24aa9f9d6009021bb3b281'; // Your Account SID from www.twilio.com/console
    const authToken = '9d71685e2871b7762cfdd23e0ec41a3a'; // Your Auth Token from www.twilio.com/console

    const twilio = require('twilio');
    const client = new twilio(accountSid, authToken);

    client.messages
      .create({
        body: "Prueba 1",
        to: '+57'+ celular, // Text this number
        from: '+18022101179', // From a valid Twilio number
      })
      .then((message: any) => console.log(message.sid));



  }
}
