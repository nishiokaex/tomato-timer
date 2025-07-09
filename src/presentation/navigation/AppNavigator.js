import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { TimerScreen } from '../screens/TimerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

// アイコンをテキストで代用（react-iconsはWeb版でのみ動作するため）
const getTabIcon = (routeName, focused) => {
  const icons = {
    Timer: focused ? '🍅' : '🍅',
    Statistics: focused ? '📊' : '📊',
    Settings: focused ? '⚙️' : '⚙️'
  };
  return icons[routeName] || '●';
};

export const AppNavigator = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icon = getTabIcon(route.name, focused);
            return <span style={{ fontSize: size || 24 }}>{icon}</span>;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#757575',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            tabBarLabel: t('timer.pomodoro'),
            headerTitle: t('app.title'),
          }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            tabBarLabel: t('statistics.title'),
            headerTitle: t('statistics.title'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: t('settings.title'),
            headerTitle: t('settings.title'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};