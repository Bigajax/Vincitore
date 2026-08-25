import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-ivory-2">{children}</div>;
}
