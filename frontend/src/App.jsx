import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import ErrorPanel from './components/ErrorPanel';

function App() {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (errors.length > 0) {
      setShowErrorPanel(true);
    }
  }, [errors]);

  const handleCodeGenerated = (result) => {
    setGeneratedCode(result);
    setErrors([]);

    addNotification({
      type: 'success',
      message: `Generated ${result.components?.length || 0} component(s) successfully!`
    });
  };

  const handleError = (error) => {
    const errorObj = {
      id: Date.now(),
      type: error.name || 'RENDER_ERROR',
      message: error.message || 'Unknown error occurred',
      componentName: error.componentName || 'Unknown',
      severity: 'high',
      timestamp: new Date().toISOString()
    };

    setErrors(prev => [...prev, errorObj]);

    addNotification({
      type: 'error',
      message: `Error in ${errorObj.componentName}: ${errorObj.message}`
    });
  };

  const handleErrorFixed = (fixResult) => {
    if (fixResult.success) {
      setErrors(prev => prev.filter(error =>
        error.componentName !== fixResult.component?.name
      ));

      setGeneratedCode(prev => ({
        ...prev,
        components: prev?.components?.map(comp =>
          comp.name === fixResult.component?.name ? fixResult.component : comp
        ) || [],
        allComponents: fixResult.allComponents,
        mainApp: fixResult.mainApp
      }));

      addNotification({
        type: 'success',
        message: `Fixed ${fixResult.component?.name} successfully!`
      });
    }
  };

  const handleGitHubResult = (result) => {
    addNotification({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
  };

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <div style={appStyle}>
      <Header onGitHubResult={handleGitHubResult} />

      <div style={mainContentStyle}>
        <Sidebar
          onCodeGenerated={handleCodeGenerated}
          onLoading={setIsLoading}
        />

        <Preview
          generatedCode={generatedCode}
          onError={handleError}
          isLoading={isLoading}
        />
      </div>

      {showErrorPanel && (
        <ErrorPanel
          errors={errors}
          onErrorFixed={handleErrorFixed}
          onDismiss={() => setShowErrorPanel(false)}
        />
      )}

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div style={notificationContainerStyle}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            ...notificationStyle,
            backgroundColor: getNotificationColor(notification.type),
          }}
          onClick={() => onRemove(notification.id)}
        >
          <span style={notificationIconStyle}>
            {getNotificationIcon(notification.type)}
          </span>
          <span style={notificationMessageStyle}>
            {notification.message}
          </span>
          <span style={notificationCloseStyle}>✕</span>
        </div>
      ))}
    </div>
  );
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'error': return '#f44336';
    case 'warning': return '#ff9800';
    case 'info': return '#2196F3';
    default: return '#666';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  backgroundColor: '#f5f5f5',
};

const mainContentStyle = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const notificationContainerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px',
};

const notificationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  borderRadius: '8px',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  animation: 'slideIn 0.3s ease-out',
};

const notificationIconStyle = {
  fontSize: '16px',
};

const notificationMessageStyle = {
  flex: 1,
  fontSize: '14px',
  lineHeight: '1.4',
};

const notificationCloseStyle = {
  fontSize: '12px',
  opacity: 0.7,
  marginLeft: '8px',
};

export default App;