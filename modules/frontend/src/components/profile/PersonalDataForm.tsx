import { useAppStore } from '@/state/store';

const PersonalDataForm = () => {
    const user = useAppStore((state) => state.user);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Datos personales</h3>
            <div className="mb-4">
                <label className="block text-grey-700">Nombre y apellido</label>
                <input
                    type="text"
                    readOnly
                    className="w-full p-2 border rounded-md bg-grey-100"
                    value={user?.name || 'Test Fixriver'}
                    placeholder="Nombre y apellido"
                />
            </div>
            <div className="mb-4">
                <label className="block text-grey-700">Usuario</label>
                <input
                    type="text"
                    readOnly
                    className="w-full p-2 border rounded-md bg-grey-100"
                    value={user?.username || 'Usuario Pruebas'}
                    placeholder="Usuario"
                />
            </div>
            <div className="mb-4">
                <label className="block text-grey-700">Correo electrónico</label>
                <input
                    type="email"
                    readOnly
                    className="w-full p-2 border rounded-md bg-grey-100"
                    value={user?.email || 'contacto@fixriver.com'}
                    placeholder="Correo electrónico"
                />
            </div>
        </div>
    );
};

export default PersonalDataForm;