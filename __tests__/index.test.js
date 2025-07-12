// index.jsのテスト
jest.mock('expo', () => ({
  registerRootComponent: jest.fn()
}));

jest.mock('../App', () => 'App');

describe('index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // モジュールキャッシュをクリア
  });

  test('index.jsが正常に実行される', () => {
    expect(() => {
      require('../index');
    }).not.toThrow();
  });

  test('registerRootComponentが呼ばれる', () => {
    const { registerRootComponent } = require('expo');
    require('../index');
    
    expect(registerRootComponent).toHaveBeenCalled();
  });

  test('Appコンポーネントが登録される', () => {
    const { registerRootComponent } = require('expo');
    const App = require('../App');
    require('../index');
    
    expect(registerRootComponent).toHaveBeenCalledWith(App.default || App);
  });
});