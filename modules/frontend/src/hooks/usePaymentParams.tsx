import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function usePaymentParams() {
    const [params] = useSearchParams();
    const [purchaseStatus, setPurchaseStatus] = useState<string | null>(
        params.get("purchase_status"),
    );
    const [purchaseAmount, setPurchaseAmount] = useState<string | null>(
        params.get("purchase_amount"),
    );

    useEffect(() => {
        setPurchaseStatus(params.get("purchase_status"));
        setPurchaseAmount(params.get("purchase_amount"));
    }, [params]);

    return { purchaseStatus, purchaseAmount };
}

export default usePaymentParams;
