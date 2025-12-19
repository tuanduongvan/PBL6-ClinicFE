'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { notificationsAPI, Notification } from '@/services/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NOTIFICATION_POLL_INTERVAL = 10000; // 10 seconds

interface NotificationCenterProps {
  userId?: number;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const data = await notificationsAPI.getMyNotifications();
      // Only update state if request wasn't aborted and component is still mounted
      if (!abortControllerRef.current?.signal.aborted) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error: any) {
      // Ignore all network and abort errors silently
      // The API function already handles these, so this catch is just a safety net
      if (
        error?.code === 'ERR_CANCELED' || 
        error?.code === 'ERR_NETWORK' ||
        error?.message === 'Request aborted' || 
        error?.message === 'Network Error' ||
        error?.name === 'AbortError' ||
        error?.name === 'NetworkError'
      ) {
        return;
      }
      // Only log unexpected errors
      console.error('Unexpected error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    // Strict check: only proceed if userId is a valid positive number
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      // Clear any existing interval if userId becomes invalid
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    // Check if user is authenticated (has token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      // No token means not logged in, don't make API calls
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Start polling
    pollingIntervalRef.current = setInterval(fetchNotifications, NOTIFICATION_POLL_INTERVAL);

    return () => {
      // Clear interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [userId, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
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
      router.push('/patient/my-appointments');
    } else if (notification.type === 'appointment_request') {
      router.push('/doctor/dashboard');
    }
    
    setIsOpen(false);
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
        return '✅';
      case 'appointment_rejected':
        return '❌';
      case 'appointment_cancelled':
        return '🚫';
      case 'appointment_request':
        return '📅';
      default:
        return '🔔';
    }
  };

  // Strict check: only render if userId is a valid positive number
  if (!userId || typeof userId !== 'number' || userId <= 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có thông báo</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-accent transition-colors",
                    !notification.is_read && "bg-accent/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm",
                          !notification.is_read && "font-semibold"
                        )}>
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

