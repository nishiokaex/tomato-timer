import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.logErrorToServer(error, errorInfo);
  }

  logErrorToServer = async (error, errorInfo) => {
    try {
      const errorData = {
        message: `ErrorBoundary caught error: ${error.message}`,
        exception: {
          name: error.name,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }
      };

      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (logError) {
      console.error('Failed to log error to server:', logError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>
            申し訳ございません。予期しないエラーが発生しました。
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default ErrorBoundary;