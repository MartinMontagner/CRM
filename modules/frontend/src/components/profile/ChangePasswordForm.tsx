import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ChangePasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 text-black">Cambiar contraseña</h3>
            
            <div className="mb-4">
                <label className="block text-gray-700">Contraseña</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full p-2 pr-10 border rounded-md bg-gray-100" 
                        placeholder="********" 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-gray-700">Repite contraseña</label>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full p-2 pr-10 border rounded-md bg-gray-100" 
                        placeholder="Repite tu contraseña" 
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>
            
            <div className="mb-4 opacity-0">
                <div className="w-full p-1"></div>
            </div>
            
            <div>
                <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
                    Cambiar contraseña
                </button>
            </div>
        </div>
    );
};

export default ChangePasswordForm;
