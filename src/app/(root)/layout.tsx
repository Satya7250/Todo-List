import { onBoardUser } from "@/actions/onboarding";


export default async function RootGroupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await onBoardUser();

    return children
}