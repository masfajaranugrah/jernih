import ChatContent from "./ChatContent";

export const metadata = {
  title: "Chat - Dashboard Pelanggan",
  description: "Hubungi support atau seller langsung dari dashboard.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-5 flex items-center gap-4">
        <h1 className="text-[#191c1d] font-semibold tracking-tight"
          style={{ fontSize: "30px", lineHeight: "1.2" }}>
          Chat
        </h1>
      </div>
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex flex-col">
          <ChatContent />
        </div>
      </div>
    </div>
  );
}
