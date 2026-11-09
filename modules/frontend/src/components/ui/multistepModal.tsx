import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { StepCircles } from "./stepcircles";

interface StepProps {
    data: any;
    setData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

interface MultiStepModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    steps: React.FC<StepProps>[];
    stepLabels: string[];
    initialData?: any;
    editMode?: boolean;
}

export const MultiStepModal: React.FC<MultiStepModalProps> = ({
    isOpen,
    onSubmit,
    steps,
    stepLabels,
    initialData = {},
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        setFormData(initialData);
        setCurrentStep(0);
    }, [initialData, isOpen]);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // El éxito ahora se maneja en el componente padre (SupervisorModal)
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const CurrentStepComponent = steps[currentStep];

    return (
        <div className="w-full h-full">
            {/* Encabezado con círculos de progreso */}
            <div>
                <h2 className="text-xl font-bold mb-2">{stepLabels[currentStep]}</h2>
                <StepCircles currentStep={currentStep} totalSteps={steps.length} labels={stepLabels} />
            </div>

            {/* Paso actual */}
            <CurrentStepComponent
                data={formData}
                setData={setFormData}
                nextStep={nextStep}
                prevStep={prevStep}
            />

            {/* Navegación */}
            <div className="flex justify-between pt-4 gap-4">
                <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="bg-gray-500 w-1/2 hover:bg-gray-600"
                >
                    Anterior
                </Button>

                {currentStep < steps.length - 1 ? (
                    <Button
                        onClick={nextStep}
                        className="bg-primary-600 w-1/2 hover:bg-primary-700"
                    >
                        Siguiente
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enviando..." : "Enviar"}
                    </Button>
                )}
            </div>
        </div>
    );
};