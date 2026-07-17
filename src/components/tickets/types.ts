import type { ChatMessage } from "@/components/chat/types";

/** Tipe tiket bantuan sesuai response backend (/api/tickets) */
export type TicketCategory = "PEMBELIAN" | "PENGIRIMAN" | "LAINNYA";
export type TicketPriority = "URGENT" | "SEDANG" | "LOW";
export type TicketStatus = "OPEN" | "RESOLVED" | "CLOSED";

export type TicketUser = {
  id: string;
  name: string;
  email?: string;
  avatar: string | null;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: TicketUser & { role?: string };
};

export type Ticket = {
  id: string;
  number: number;
  userId: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  createdAt: string;
  updatedAt: string;
  user?: TicketUser;
  messages?: TicketMessage[];
  unreadCount?: number;
};

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  PEMBELIAN: "Pembelian",
  PENGIRIMAN: "Pengiriman",
  LAINNYA: "Lainnya",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  URGENT: "Urgent",
  SEDANG: "Sedang",
  LOW: "Low",
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Terbuka",
  RESOLVED: "Selesai",
  CLOSED: "Ditutup",
};

/** Kelas warna badge prioritas */
export const PRIORITY_BADGE: Record<TicketPriority, string> = {
  URGENT: "bg-red-100 text-red-700",
  SEDANG: "bg-amber-100 text-amber-700",
  LOW: "bg-gray-100 text-gray-600",
};

/** Kelas warna badge status */
export const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN: "bg-green-100 text-green-700",
  RESOLVED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-gray-200 text-gray-600",
};

/** Konversi TicketMessage → bentuk ChatMessage agar MessageBubble bisa dipakai ulang */
export function toChatMessage(msg: TicketMessage): ChatMessage {
  return {
    id: msg.id,
    senderId: msg.senderId,
    receiverId: "",
    message: msg.message,
    imageUrl: msg.imageUrl,
    videoUrl: null,
    productId: null,
    product: null,
    isDeleted: false,
    isRead: msg.isRead,
    createdAt: msg.createdAt,
    sender: msg.sender,
  };
}
