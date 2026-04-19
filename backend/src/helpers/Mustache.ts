import Mustache from "mustache";
import Ticket from "../models/Ticket";

function makeid(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const msgsd = (): string => {
  let ms = "";

  const hh = new Date().getHours();

  if (hh >= 6) {
    ms = "Bom dia";
  }
  if (hh > 11) {
    ms = "Boa tarde";
  }
  if (hh > 17) {
    ms = "Boa noite";
  }
  if (hh > 23 || hh < 6) {
    ms = "Boa madrugada";
  }

  return ms;
};

export const control = (): string => {
  const Hr = new Date();

  const dd: string = ("0" + Hr.getDate()).slice(-2);
  const mm: string = ("0" + (Hr.getMonth() + 1)).slice(-2);
  const yyyy: string = Hr.getFullYear().toString();
  const minute: string = Hr.getMinutes().toString();
  const second: string = Hr.getSeconds().toString();
  const millisecond: string = Hr.getMilliseconds().toString();

  const ctrl = yyyy + mm + dd + minute + second + millisecond;
  return ctrl;
};

export const date = (): string => {
  const Hr = new Date();

  const dd: string = ("0" + Hr.getDate()).slice(-2);
  const mm: string = ("0" + (Hr.getMonth() + 1)).slice(-2);
  const yy: string = Hr.getFullYear().toString();

  const dates = dd + "-" + mm + "-" + yy;
  return dates;
};

export const hour = (): string => {
  const Hr = new Date();

  const hh: number = Hr.getHours();
  const min: string = ("0" + Hr.getMinutes()).slice(-2);
  const ss: string = ("0" + Hr.getSeconds()).slice(-2);

  const hours = hh + ":" + min + ":" + ss;
  return hours;
};

export const firstName = (ticket?: Ticket): string => {
  if (ticket && ticket?.contact?.name) {
    const nameArr = ticket.contact.name.split(" ");
    return nameArr[0];
  }
  return "";
};

export default (body: string, ticket?: Ticket): string => {
  const combinedDateTime = new Array(date(), hour()).join(" \u00e0s ");
  const protocolNumber = new Array(control(), ticket ? ticket.id.toString() : "").join("");
  const currentFirstName = firstName(ticket);
  const currentName = ticket ? ticket.contact?.name : "";
  const currentTicketId = ticket ? ticket.id : "";
  const currentUserName = ticket ? ticket.user?.name : "";
  const greeting = msgsd();
  const currentHour = hour();
  const currentDate = date();
  const currentQueue = ticket ? ticket.queue?.name : "";
  const currentConnection = ticket ? ticket.whatsapp?.name : "";
  const currentCompanyName = ticket ? ticket.company?.name : "";

  const view = {
    firstName: currentFirstName,
    primeiroNome: currentFirstName,
    name: currentName,
    nome: currentName,
    ticket_id: currentTicketId,
    numeroChamado: currentTicketId,
    numero_chamado: currentTicketId,
    userName: currentUserName,
    attendant: currentUserName,
    atendente: currentUserName,
    ms: greeting,
    saudacao: greeting,
    hour: currentHour,
    hora: currentHour,
    date: currentDate,
    data: currentDate,
    queue: currentQueue,
    setor: currentQueue,
    connection: currentConnection,
    conexao: currentConnection,
    data_hora: combinedDateTime,
    dataAgendamento: combinedDateTime,
    data_agendamento: combinedDateTime,
    protocol: protocolNumber,
    protocolo: protocolNumber,
    name_company: currentCompanyName
  };

  return Mustache.render(body, view);
};
