import { ReactNode } from "react";
import Navbar from "./Navbar";

type NavbarLayoutProps = {
    children: ReactNode;
};

function NavbarLayout({ children }: NavbarLayoutProps) {
    return (
        <div className="flex flex-col sm:flex-row h-screen w-screen overflow-hidden bg-grey-100">
            <Navbar />
            <main className="w-full h-[calc(100vh-56px)] sm:h-full sm:w-[calc(100%-64px)] p-0 m-0 overflow-hidden">
                {children}
            </main>
        </div>
    );
}

export default NavbarLayout;