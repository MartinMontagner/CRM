import { ReactNode } from "react";
import { motion } from "framer-motion";

type AuthProps = {
    title: string;
    children: ReactNode;
};

function AuthLayout({ title, children }: AuthProps) {
    return (
        <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.2 }} className="flex h-screen w-screen overflow-hidden flex-col bg-grey-200">
            {/* Sección lateral con logo */}
            <div className="flex items-center justify-center h-auto md:hidden xl:w-1/4 bg-tertiary-600">
                <div className="w-full flex justify-center items-center md:justify-start">
                <img
                        src="/logos/logoAuthSmall.webp"
                        alt="CoCreadores"
                        className="block md:hidden h-2/5 max-h-40 py-4" 
                    />
                </div>
            </div>

            {/* Sección del formulario */}
            <div className="w-full md:w-3/5 flex flex-col h-full overflow-hidden p-8 md:p-12 justify-center self-center lg:p-16 xl:p-24">
                <div className="flex-grow flex flex-col justify-center self-center">
                    <div className="flex justify-center items-center mb-4">
                        <img
                            src="/logos/logoAuthBanner.webp"
                            alt="CoCreadores"
                            className="w-1/2 hidden md:flex xl:w-2/5"
                        />
                    </div>
                    <h1 className="text-center text-xl font-semibold text-tertiary-600 pb-4">
                        {title}
                    </h1>
                    <div className="flex flex-col justify-center gap-6 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default AuthLayout;