// import { onBoardUser } from "@/actions/onboarding";


// export default async function RootGroupLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     await onBoardUser();

//     return children
// }

import { onBoardUser } from "@/actions/onboarding";
import { NavbarWrapper } from "@/components/home/navbar-wrapper";

export default async function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await onBoardUser();

  return (
    <>
      <NavbarWrapper />
      <main className="pt-24">
        {children}
      </main>
    </>
  );
}