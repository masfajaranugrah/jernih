import TicketThread from "./TicketThread";

export const metadata = {
  title: "Detail Tiket - Dashboard Pelanggan",
  description: "Live chat kendala dengan tim support.",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketThread ticketId={id} />;
}
