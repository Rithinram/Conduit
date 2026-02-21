import React, { createContext, useContext, useState, useCallback } from 'react';

const SurgeActionsContext = createContext({
    rescheduledAppointment: null,
    addRescheduledAppointment: () => { },
    clearRescheduledAppointment: () => { },
});

export const useSurgeActions = () => useContext(SurgeActionsContext);

export const SurgeActionsProvider = ({ children }) => {
    const [rescheduledAppointment, setRescheduledAppointment] = useState(null);

    const addRescheduledAppointment = useCallback((appointment) => {
        setRescheduledAppointment(appointment);
    }, []);

    const clearRescheduledAppointment = useCallback(() => {
        setRescheduledAppointment(null);
    }, []);

    return (
        <SurgeActionsContext.Provider value={{ rescheduledAppointment, addRescheduledAppointment, clearRescheduledAppointment }}>
            {children}
        </SurgeActionsContext.Provider>
    );
};

export default SurgeActionsContext;
