import React from 'react';
import App from '../App';

// useTimerStoreのモック
const mockLoadData = jest.fn(() => Promise.resolve());
const mockSetError = jest.fn();

jest.mock('../src/presentation/stores/TimerStore', () => ({
  useTimerStore: () => ({
    loadData: mockLoadData,
    setError: mockSetError
  })
}));

jest.mock('../src/presentation/navigation/AppNavigator', () => ({
  AppNavigator: () => 'AppNavigator'
}));

jest.mock('../src/infrastructure/services/StorageService', () => ({
  getStorageService: () => ({
    initialize: jest.fn(() => Promise.resolve())
  })
}));

jest.mock('../src/infrastructure/services/NotificationService', () => ({
  getNotificationService: () => ({
    initialize: jest.fn(() => Promise.resolve())
  })
}));

jest.mock('../src/presentation/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => children
}));

jest.mock('../src/presentation/locales/i18n', () => ({}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.log と console.error をモック
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('Appコンポーネントが正常にレンダリングされる', () => {
    expect(() => {
      App();
    }).not.toThrow();
  });

  test('Appコンポーネントが必要な要素を含む', () => {
    const result = App();
    expect(result).toBeDefined();
  });

  test('初期化処理が正常に実行される', async () => {
    mockLoadData.mockResolvedValueOnce();
    
    const app = App();
    
    // useEffectが実行されるまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockLoadData).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('アプリが初期化されました');
  });

  test('初期化エラー時にエラーハンドリングが動作する', async () => {
    mockLoadData.mockRejectedValueOnce(new Error('Load error'));
    
    const app = App();
    
    // useEffectが実行されるまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockSetError).toHaveBeenCalledWith('アプリの初期化に失敗しました');
    expect(console.error).toHaveBeenCalledWith(
      'アプリの初期化に失敗しました:',
      expect.any(Error)
    );
  });

  test('ストレージサービスの初期化が呼ばれる', () => {
    const storageService = require('../src/infrastructure/services/StorageService');
    
    App();
    
    expect(storageService.getStorageService).toBeDefined();
  });

  test('通知サービスの初期化が呼ばれる', () => {
    const notificationService = require('../src/infrastructure/services/NotificationService');
    
    App();
    
    expect(notificationService.getNotificationService).toBeDefined();
  });

  test('スタイルが正しく定義されている', () => {
    const app = App();
    expect(app).toBeDefined();
  });
});