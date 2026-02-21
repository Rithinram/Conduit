import React, { createContext, useContext, useState, useCallback } from 'react';

const QueueNotificationContext = createContext({
    triggerNotification: () => { },
    notificationState: 'idle', // idle | waiting | notified
});

export const useQueueNotification = () => useContext(QueueNotificationContext);

export const QueueNotificationProvider = ({ children }) => {
    const [notificationState, setNotificationState] = useState('idle');
    const [showToast, setShowToast] = useState(false);

    const triggerNotification = useCallback((onComplete) => {
        if (notificationState !== 'idle') return;
        setNotificationState('waiting');

        setTimeout(() => {
            setNotificationState('notified');
            setShowToast(true);
            if (onComplete) onComplete();
            setTimeout(() => setShowToast(false), 8000);
        }, 5000);
    }, [notificationState]);

    return (
        <QueueNotificationContext.Provider value={{ triggerNotification, notificationState, showToast, setShowToast }}>
            {children}
        </QueueNotificationContext.Provider>
    );
};

export default QueueNotificationContext;
