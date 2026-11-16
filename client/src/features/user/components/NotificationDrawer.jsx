import React, { useState } from 'react';
import userApi from '../services/userApi';

export const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onNotificationRead,
  onViewItem
}) => {
  const [filterUnread, setFilterUnread] = useState(false);

  if (!isOpen) return null;

  const filtered = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  const handleMarkAsRead = async (notif) => {
    if (notif.isRead) return;
    try {
      await userApi.markNotificationRead(notif._id);
      if (onNotificationRead) {
        onNotificationRead(notif._id);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-on-surface/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant/30">
          {/* Top Bar */}
          <div className="p-4 px-6 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-error text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-6 py-2.5 bg-surface-container-lowest border-b border-surface-container flex items-center gap-2">
            <button
              onClick={() => setFilterUnread(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !filterUnread
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterUnread
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-on-surface-variant p-6">
                <span className="material-symbols-outlined text-[42px] text-outline-variant mb-2">
                  notifications_off
                </span>
                <p className="font-label-lg text-label-lg font-semibold text-on-surface">No notifications</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  You are all caught up on report and claim updates!
                </p>
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !notif.isRead
                      ? 'bg-primary-fixed/25 border-primary/20 hover:bg-primary-fixed/40'
                      : 'bg-surface-container-low/50 border-surface-container-high hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></span>
                      )}
                      {notif.title}
                    </h4>
                    <span className="font-code-tabular text-[11px] text-on-surface-variant shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.relatedItemId && (
                    <div className="mt-2 pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
                      <span className="text-primary font-medium truncate max-w-[200px]">
                        Ref: {typeof notif.relatedItemId === 'object' ? notif.relatedItemId.title : 'Item Record'}
                      </span>
                      {onViewItem && typeof notif.relatedItemId === 'object' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewItem(notif.relatedItemId);
                            onClose();
                          }}
                          className="text-primary hover:underline font-semibold"
                        >
                          View Item →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
