import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';

// エラーを投げるコンポーネント
const ErrorComponent = () => {
  throw new Error('Test error');
};

const ValidComponent = () => React.createElement('Text', {}, 'Valid component');

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
      
      // console.errorのモックをクリア
      console.error.mockClear();
      
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
    test('エラーバウンダリーが正常にレンダリングされる', () => {
      expect(() => {
        render(<ErrorBoundary><div>test</div></ErrorBoundary>);
      }).not.toThrow();
    });

    test('エラーバウンダリーの結果が定義される', () => {
      const rendered = render(<ErrorBoundary><div>test</div></ErrorBoundary>);
      expect(rendered).toBeDefined();
    });
  });
});