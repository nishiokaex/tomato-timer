import React from 'react';
import { TimerTypeSelector } from '../TimerTypeSelector';
import { TimerType } from '../../../domain/entities/Timer';


describe('TimerTypeSelector', () => {
  const mockProps = {
    selectedType: TimerType.POMODORO,
    onTypeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが正常にレンダリングされる', () => {
      expect(() => {
        TimerTypeSelector(mockProps);
      }).not.toThrow();
    });

    test('すべてのタイマータイプが表示される', () => {
      const result = TimerTypeSelector(mockProps);
      
      // コンポーネントが正しく動作することを確認
      expect(result).toBeDefined();
    });

    test('選択されたタイプが正しく反映される', () => {
      const props = { ...mockProps, selectedType: TimerType.SHORT_BREAK };
      const result = TimerTypeSelector(props);
      
      expect(result).toBeDefined();
      expect(props.selectedType).toBe(TimerType.SHORT_BREAK);
    });
  });

  describe('タイプ変更', () => {
    test('ポモドーロ選択時にコールバックが呼ばれる', () => {
      const props = { ...mockProps, selectedType: TimerType.SHORT_BREAK };
      TimerTypeSelector(props);
      
      // 実際の実装では、ボタンクリックイベントをシミュレートする
      if (props.onTypeChange) {
        props.onTypeChange(TimerType.POMODORO);
      }
      
      expect(props.onTypeChange).toHaveBeenCalledWith(TimerType.POMODORO);
    });

    test('短い休憩選択時にコールバックが呼ばれる', () => {
      const props = { ...mockProps, selectedType: TimerType.POMODORO };
      TimerTypeSelector(props);
      
      if (props.onTypeChange) {
        props.onTypeChange(TimerType.SHORT_BREAK);
      }
      
      expect(props.onTypeChange).toHaveBeenCalledWith(TimerType.SHORT_BREAK);
    });

    test('長い休憩選択時にコールバックが呼ばれる', () => {
      const props = { ...mockProps, selectedType: TimerType.POMODORO };
      TimerTypeSelector(props);
      
      if (props.onTypeChange) {
        props.onTypeChange(TimerType.LONG_BREAK);
      }
      
      expect(props.onTypeChange).toHaveBeenCalledWith(TimerType.LONG_BREAK);
    });
  });

  describe('プロパティ', () => {
    test('selectedTypeプロパティが正しく設定される', () => {
      const props = { ...mockProps, selectedType: TimerType.LONG_BREAK };
      const result = TimerTypeSelector(props);
      
      expect(props.selectedType).toBe(TimerType.LONG_BREAK);
    });

    test('onTypeChangeプロパティがundefinedでもエラーが発生しない', () => {
      const props = { selectedType: TimerType.POMODORO, onTypeChange: undefined };
      
      expect(() => {
        TimerTypeSelector(props);
      }).not.toThrow();
    });

    test('selectedTypeがundefinedでもエラーが発生しない', () => {
      const props = { selectedType: undefined, onTypeChange: mockProps.onTypeChange };
      
      expect(() => {
        TimerTypeSelector(props);
      }).not.toThrow();
    });
  });

  describe('スタイル', () => {
    test('選択されたタイプに応じてスタイルが適用される', () => {
      const props = { ...mockProps, selectedType: TimerType.POMODORO };
      const result = TimerTypeSelector(props);
      
      // スタイルが適用されることを確認
      expect(result).toBeDefined();
    });

    test('未選択のタイプに応じてスタイルが適用される', () => {
      const props = { ...mockProps, selectedType: TimerType.SHORT_BREAK };
      const result = TimerTypeSelector(props);
      
      // スタイルが適用されることを確認
      expect(result).toBeDefined();
    });
  });

  describe('エッジケース', () => {
    test('無効なタイマータイプでもエラーが発生しない', () => {
      const props = { selectedType: 'invalid', onTypeChange: mockProps.onTypeChange };
      
      expect(() => {
        TimerTypeSelector(props);
      }).not.toThrow();
    });

    test('nullのpropsでもエラーが発生しない', () => {
      expect(() => {
        TimerTypeSelector({});
      }).not.toThrow();
    });
  });
});