import { useAppStore } from '@/state/store';

const UserProfile = () => {
    const user = useAppStore((state) => state.user);
    return (
        <div className="w-full flex">
            <div className="aspect-square w-32 h-32">
                <img
                    src={user?.imageUrl || "/logos/avatar.jpg"}
                    alt="foto-perfil"
                    className="w-full h-full object-cover rounded-full bg-primary-200"
                />
            </div>
            <div className="w-full max-w-4xl bg-white p-6 flex flex-col items-start sm:items-start">
                <h2 className="text-xl font-semibold text-black pb-4">Mi perfil</h2>
                <p className="text-lg font-semibold text-black pb-2">
                    {user?.name || 'Nombre Apellido'}
                </p>
                <p className="text-grey-600">{user?.email || 'usuario@mail.com'}</p>
            </div>
        </div>
    );
};

export default UserProfile;