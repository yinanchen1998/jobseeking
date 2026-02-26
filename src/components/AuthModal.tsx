import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, Lock, LogOut, User as UserIcon } from 'lucide-react';
import { sendCode, login, logout, getCurrentUser, type User } from '@/services/auth';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (user: User) => void;
}

export function AuthModal({ open, onOpenChange, onLogin }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 检查当前登录状态
  useEffect(() => {
    if (open) {
      checkUser();
    }
  }, [open]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const result = await sendCode(phone);
      if (result.success) {
        toast.success(result.message);
        setCountdown(60);
        // 开发模式下显示验证码
        if (result.devCode) {
          toast.info(`开发模式 - 验证码: ${result.devCode}`, { duration: 10000 });
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !code) {
      toast.error('请填写手机号和验证码');
      return;
    }

    setLoading(true);
    try {
      const result = await login(phone, code);
      if (result.success && result.user) {
        toast.success('登录成功');
        setCurrentUser(result.user);
        onLogin?.(result.user);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    toast.success('已退出登录');
    onOpenChange(false);
  };

  // 如果已登录，显示用户信息
  if (currentUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>用户信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">{currentUser.phone}</p>
              <p className="text-sm text-gray-500">用户ID: {currentUser.userId}</p>
            </div>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>手机号登录</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 手机号输入 */}
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                maxLength={11}
              />
            </div>
          </div>

          {/* 验证码输入 */}
          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                  maxLength={6}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSendCode}
                disabled={countdown > 0 || loading}
                className="w-32"
              >
                {loading && countdown === 0 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  '获取验证码'
                )}
              </Button>
            </div>
          </div>

          {/* 登录按钮 */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            登录
          </Button>

          <p className="text-xs text-center text-gray-500">
            未注册的手机号将自动创建账号
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
