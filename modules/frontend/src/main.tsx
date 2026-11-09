import { Toaster } from "@/components/ui/sonner";
import { WebSocketProvider } from '@/context/WebSocketContext';
import '@fontsource/poppins';
import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import Router from "./components/routing/Router";
import "./index.css";

const queryClient = new QueryClient();

const fontReg = 'Poppins, sans-serif';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebSocketProvider>
            <QueryClientProvider client={queryClient}>
                <MantineProvider
                    theme={{
                        fontFamily: fontReg,
                    }}
                >
                    <Router />
                    <Toaster
                        theme="light"
                        richColors
                        position="top-center"
                        toastOptions={{ duration: 5000, closeButton: false }}
                    />
                </MantineProvider>
            </QueryClientProvider>
        </WebSocketProvider>
    </React.StrictMode>,
);
