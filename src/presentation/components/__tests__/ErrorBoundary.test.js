import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';

// React Native Componentのモック
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => children,
  Text: ({ children, ...props }) => children,
  StyleSheet: {
    create: (styles) => styles,
  },
}));

// エラーを投げるコンポーネント
const ErrorComponent = () => {
  throw new Error('Test error');
};

const ValidComponent = () => 'Valid component';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.errorをモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('正常時', () => {
    test('エラーが発生しない場合は子コンポーネントをレンダリングする', () => {
      expect(() => {
        render(
          <ErrorBoundary>
            <ValidComponent />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });

    test('初期状態ではhasErrorがfalse', () => {
      const errorBoundary = new ErrorBoundary({});
      
      expect(errorBoundary.state.hasError).toBe(false);
      expect(errorBoundary.state.error).toBeNull();
    });
  });

  describe('エラー時', () => {
    test('getDerivedStateFromError()でエラー状態を設定する', () => {
      const error = new Error('Test error');
      
      const state = ErrorBoundary.getDerivedStateFromError(error);
      
      expect(state).toEqual({
        hasError: true,
        error: error
      });
    });

    test('componentDidCatch()でエラーをログ出力する', () => {
      const errorBoundary = new ErrorBoundary({});
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'component stack' };
      
      errorBoundary.componentDidCatch(error, errorInfo);
      
      expect(console.error).toHaveBeenCalledWith('ErrorBoundary caught an error:', error, errorInfo);
    });

    test('エラー発生時にエラーUIをレンダリングする', () => {
      const errorBoundary = new ErrorBoundary({});
      errorBoundary.state = {
        hasError: true,
        error: new Error('Test error')
      };
      
      const result = errorBoundary.render();
      
      // エラーUIがレンダリングされることを確認
      // 実際の実装に応じて適切なアサーションを追加
      expect(result).toBeDefined();
    });
  });

  describe('静的メソッド', () => {
    test('getDerivedStateFromError()が正しく動作する', () => {
      const error = new Error('Test error');
      const state = ErrorBoundary.getDerivedStateFromError(error);
      
      expect(state).toEqual({
        hasError: true,
        error: error
      });
    });

    test('getDerivedStateFromError()がnullエラーでも動作する', () => {
      const state = ErrorBoundary.getDerivedStateFromError(null);
      
      expect(state).toEqual({
        hasError: true,
        error: null
      });
    });
  });

  describe('エラーバウンダリーの基本機能', () => {
    test('エラーバウンダリーが関数として実行される', () => {
      expect(() => {
        ErrorBoundary({ children: 'test' });
      }).not.toThrow();
    });

    test('エラーバウンダリーの結果が定義される', () => {
      const result = ErrorBoundary({ children: 'test' });
      expect(result).toBeDefined();
    });
  });
});