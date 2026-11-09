import { Role } from "@/model/auth/AuthData";
import { logOut } from "@/service/auth/AuthService";
import { useAppStore } from "@/state/store";
import { useCallback } from "react";
import { RiDatabase2Fill, RiVerifiedBadgeFill, RiUser3Fill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTag } from "react-icons/fa";

function Navbar() {
    const navigate = useNavigate();
    const authData = useAppStore(state => state.authData);

    const isAdmin = authData?.roles.includes(Role.ADMIN);

    const handleLogOut = useCallback(async () => {
        await logOut();
        navigate("/login");
    }, [navigate]);

    return (
        <>
        <div className="sm:bg-gradient-to-b sm:from-gray-800 sm:to-black">
            {/* Barra de navegación para móvil (abajo) */}
            <nav className="fixed bottom-0 flex h-14 w-full items-center justify-around text-white z-50 sm:hidden bg-gray-900">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center justify-center w-10 h-10 rounded-full ${
                            isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                        }`
                    }
                >
                    <img src="/icons/message.svg" alt="Mensajes" className="w-5 h-5" />
                </NavLink>

                <NavLink
                    to="/members"
                    className={({ isActive }) =>
                        `flex items-center justify-center w-10 h-10 rounded-full ${
                            isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                        }`
                    }
                >
                    <RiDatabase2Fill className="w-5 h-5" />
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center justify-center w-10 h-10 rounded-full ${
                            isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                        }`
                    }
                >
                    <RiUser3Fill className="w-5 h-5" />
                </NavLink>

                {isAdmin && (
                    <NavLink
                        to="/registers"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-10 h-10 rounded-full ${
                                isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                            }`
                        }
                    >
                        <RiVerifiedBadgeFill className="w-5 h-5" />
                    </NavLink>
                )}
                {isAdmin && (
                    <NavLink
                        to="/wazends"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-10 h-10 rounded-full ${
                                isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                            }`
                        }
                    >
                        <IoLogoWhatsapp  className="w-5 h-5" />
                    </NavLink>
                )}
                
                {/* Botón de logout para móvil */}
                <button
                    onClick={handleLogOut}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600"
                >
                    <img src="/icons/logout.svg" className="w-5 h-5" alt="Salir" />
                </button>
            </nav>
            
            {/* Barra de navegación para desktop (lateral) */}
            <nav className="hidden sm:flex fixed left-0 h-screen w-16 flex-col items-center justify-between py-6 text-white z-50">
                {/* Enlaces de navegación */}
                <div className="flex flex-col gap-6 items-center mt-7">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-10 h-10 rounded-full ${
                                isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                            }`
                        }
                    >
                        <img src="/icons/message.svg" alt="Mensajes" className="w-5 h-5" />
                    </NavLink>

                    <NavLink
                        to="/members"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-10 h-10 rounded-full ${
                                isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                            }`
                        }
                    >
                        <RiDatabase2Fill className="w-5 h-5" />
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-10 h-10 rounded-full ${
                                isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                            }`
                        }
                    >
                        <RiUser3Fill className="w-5 h-5" />
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/registers"
                            className={({ isActive }) =>
                                `flex items-center justify-center w-10 h-10 rounded-full ${
                                    isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                                }`
                            }
                        >
                            <RiVerifiedBadgeFill className="w-5 h-5" />
                        </NavLink>
                    )}
                    {isAdmin && (
                        <NavLink
                            to="/wazends"
                            className={({ isActive }) =>
                                `flex items-center justify-center w-10 h-10 rounded-full ${
                                    isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                                }`
                            }
                        >
                            <IoLogoWhatsapp  className="w-5 h-5" />
                        </NavLink>
                    )}
                    {isAdmin && (
                        <NavLink
                            to="/tags"
                            className={({ isActive }) =>
                                `flex items-center justify-center w-10 h-10 rounded-full ${
                                    isActive ? "bg-primary-600" : "bg-gray-700 hover:bg-gray-600"
                                }`
                            }
                        >
                            <FaTag  className="w-5 h-5" />
                        </NavLink>
                    )}
                </div>

                {/* Botón de salir - solo visible en versión desktop */}
                <button
                    onClick={handleLogOut}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 mb-6"
                >
                    <img src="/icons/logout.svg" className="w-5 h-5" alt="Salir" />
                </button>
            </nav>
            
            {/* Espaciador para asegurar que el contenido no quede detrás de la navbar */}
            <div className="sm:h-0 w-full sm:w-16"></div>
            </div>
        </>
    );
}

export default Navbar;