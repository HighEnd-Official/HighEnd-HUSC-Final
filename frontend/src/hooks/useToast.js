import { useState, useCallback } from "react";

export function useToast() {
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
    }, []);

    const hideToast = useCallback(() => setToast(null), []);

    return { toast, showToast, hideToast };
}