import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AfterCreate
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Company from "./Company";
import Queue from "./Queue";
import TicketTraking from "./TicketTraking";
import { buildCompanyPublicUrl } from "../utils/buildBackendUrl";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: number;

  @Column(DataType.STRING)
  remoteJid: string;

  @Column(DataType.STRING)
  participant: string;

  @Column(DataType.STRING)
  dataJson: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      return buildCompanyPublicUrl(this.companyId, this.getDataValue("mediaUrl"));
    }
    return null;
  }

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => TicketTraking)
  @Column
  ticketTrakingId: number;

  @BelongsTo(() => TicketTraking, "ticketTrakingId")
  ticketTraking: TicketTraking;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;
  
  @Column
  wid: string;

  @Default(false)
  @Column
  isPrivate: boolean;

  @Default(false)
  @Column
  isEdited: boolean;

  @Default(false)
  @Column
  isForwarded: boolean;

  // Mantem Ticket.lastMessageAt = data desta mensagem, independente do
  // canal (WhatsApp, Facebook, API oficial etc.) - ponto unico em vez de
  // replicar em cada um dos ~40 lugares que atualizam ticket.lastMessage.
  // silent:true evita tocar Ticket.updatedAt so por causa disso (updatedAt
  // e usado por outras rotinas, como reatribuicao automatica de fila).
  @AfterCreate
  static async touchTicketLastMessageAt(message: Message): Promise<void> {
    if (!message.ticketId) return;
    await Ticket.update(
      { lastMessageAt: message.createdAt || new Date() },
      { where: { id: message.ticketId }, silent: true }
    );
  }
}

export default Message;
