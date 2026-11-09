import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import PersonalDataForm from "@/components/profile/PersonalDataForm";
import UserProfile from "@/components/profile/UserProfile";
import NavbarLayout from "../components/layout/NavbarLayout";
import { motion } from "framer-motion";

function ProfilePage() {
    return (
        <NavbarLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }} className="bg-gray-200 flex h-full w-full flex-col items-center overflow-auto p-0 sm:px-10 sm:py-6 xl:px-12">
                <div className="w-full max-w-4xl h-full bg-white p-6 rounded-3xl">
                    <UserProfile />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <PersonalDataForm />
                        <ChangePasswordForm />
                    </div>
                </div>
            </motion.div>
        </NavbarLayout>
    );
}

export default ProfilePage;
