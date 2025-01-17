import { useMemo } from 'react';
import { Switch } from './ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useUserStore } from '@/store/userStore';
import { Theme, UserPreferenceRequest } from '@/types';

export default function Settings() {
  const { user, updatePreferences } = useUserStore();

  const settings = useMemo(() => ({
    notificationEnabled: user?.preferences?.notificationEnabled ?? true,
    theme: user?.preferences?.theme ?? Theme.DARK,
  }), [user]);

  const handleToggle = (key: keyof UserPreferenceRequest) => {
    updatePreferences({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="flex-1 h-screen overflow-hidden bg-slate-800/50 light:bg-slate-900/50">
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-light tracking-wide text-purple-100 light:text-purple-200 mb-8">
            Settings
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-purple-100">Enable Notifications</span>
                <Switch
                  checked={settings.notificationEnabled}
                  onCheckedChange={() => handleToggle('notificationEnabled')}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-purple-100">Dark Mode</span>
                <Switch
                  checked={settings.theme === Theme.LIGHT}
                  onCheckedChange={() => handleToggle('theme')}
                />
              </div>                            
            </CardContent>           
          </Card>

          <Button className="mt-6" onClick={() => updatePreferences(settings)}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}