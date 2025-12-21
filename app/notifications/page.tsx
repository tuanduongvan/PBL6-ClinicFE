'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { notificationsAPI, Notification } from '@/services/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCheck, Bell, CheckCircle2, X, Calendar, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoggedIn) {
      router.push('/');
      return;
    }

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsAPI.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải thông báo. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

    fetchNotifications();
  }, [isLoggedIn]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể đánh dấu đã đọc. Vui lòng thử lại.',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({
        title: 'Thành công',
        description: 'Đã đánh dấu tất cả thông báo là đã đọc.',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'appointment_confirmed' || 
        notification.type === 'appointment_rejected' ||
        notification.type === 'appointment_cancelled') {
      if (user?.role?.id === 3) {
        router.push('/patient/my-appointments');
      }
    } else if (notification.type === 'appointment_request') {
      if (user?.role?.id === 2) {
        router.push('/doctor/dashboard');
      }
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return 'Vừa xong';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'appointment_rejected':
        return <X className="w-6 h-6 text-red-500" />;
      case 'appointment_cancelled':
        return <Ban className="w-6 h-6 text-orange-500" />;
      case 'appointment_request':
        return <Calendar className="w-6 h-6 text-blue-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return 'Xác nhận lịch hẹn';
      case 'appointment_rejected':
        return 'Từ chối lịch hẹn';
      case 'appointment_cancelled':
        return 'Hủy lịch hẹn';
      case 'appointment_request':
        return 'Yêu cầu lịch hẹn';
      default:
        return 'Thông báo';
    }
  };

  if (!isMounted) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Thông báo
              </h1>
              <p className="text-muted-foreground">
                Xem tất cả thông báo của bạn
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chưa có thông báo
            </h3>
            <p className="text-muted-foreground">
              Các thông báo mới sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "bg-card rounded-lg border border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                  !notification.is_read && "bg-accent/30 border-primary/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        {!notification.is_read && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm mb-2",
                      !notification.is_read && "font-semibold"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

