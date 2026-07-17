/** Tipe pesan chat sesuai response backend (/api/chat) */
export type ChatUser = {
  id: string;
  name: string;
  avatar: string | null;
};

export type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  images: string[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  imageUrl: string | null;
  videoUrl: string | null;
  productId: string | null;
  product: ChatProduct | null;
  isDeleted: boolean;
  isRead: boolean;
  createdAt: string;
  sender?: ChatUser;
  receiver?: ChatUser;
};

export type InboxItem = {
  lastMessage: ChatMessage;
  unreadCount: number;
};

/** Payload kirim pesan */
export type SendPayload = {
  receiverId: string;
  message: string;
  imageUrl?: string;
  videoUrl?: string;
  productId?: string;
};

export function formatChatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Preview teks untuk inbox jika pesan tanpa teks */
export function previewText(msg: ChatMessage): string {
  if (msg.isDeleted) return "Pesan telah dihapus";
  if (msg.message) return msg.message;
  if (msg.imageUrl) return "📷 Foto";
  if (msg.videoUrl) return "🎥 Video";
  if (msg.product) return `🛒 ${msg.product.name}`;
  return "";
}
