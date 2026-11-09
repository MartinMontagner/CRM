import { cn } from "@/lib/utils";

interface StepCirclesProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}


export const StepCircles: React.FC<StepCirclesProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-between w-full mb-6 relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-primary-600 -translate-y-1/2 mx-12" />

            <div className="flex justify-between w-full z-10">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                        {/* Círculo */}
                        <div
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-semibold border-2",
                                currentStep > index
                                    ? "bg-primary-600 text-white border-primary-600"
                                    : currentStep === index
                                        ? "bg-primary-600 text-white border-primary-600"
                                        : "bg-primary-100 text-primary-600 border-primary-600"
                            )}
                        >
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};