import ChatContent from "./ChatContent";

export const metadata = {
  title: "Chat - Dashboard Pelanggan",
  description: "Hubungi support atau seller langsung dari dashboard.",
};

export default function ChatPage() {
  return (
    <div className="-m-6 md:-m-10 h-[calc(100%-0px)] flex flex-col overflow-hidden">
      <div className="mb-5 flex items-center gap-4 px-6 md:px-10 pt-0">
        <h1 className="text-[#191c1d] font-semibold tracking-tight"
          style={{ fontSize: "30px", lineHeight: "1.2" }}>
          Chat
        </h1>
      </div>
      <div className="flex-1 px-6 md:px-10 pb-6 md:pb-10">
        <ChatContent />
      </div>
    </div>
  );
}
