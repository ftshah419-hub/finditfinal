import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import UserNavbar from '../components/UserNavbar';
import UserDashboardView from './UserDashboardView';
import BrowseItemsView from './BrowseItemsView';
import ReportLostItemView from './ReportLostItemView';
import ReportFoundItemView from './ReportFoundItemView';
import MyReportsView from './MyReportsView';
import MyClaimsView from './MyClaimsView';
import AISmartMatchView from './AISmartMatchView';
import ItemDetailsModal from '../components/ItemDetailsModal';
import SubmitClaimModal from '../components/SubmitClaimModal';
import NotificationDrawer from '../components/NotificationDrawer';
import UserProfileModal from '../components/UserProfileModal';
import userApi from '../services/userApi';
import '../styles/userDesignTokens.css';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('user-home-overview');

  // Live Backend Stats & Feeds
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentNotifications: [],
    topAIMatch: null,
    liveCampusItems: []
  });

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals & Drawers State
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fetch Dashboard Statistics and Notifications on Mount
  const loadDashboardData = async () => {
    try {
      const res = await userApi.getDashboardStats();
      if (res.data) {
        setDashboardData(res.data);
        setUnreadCount(res.data.stats?.unreadNotifications || 0);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await userApi.getNotifications();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const handleNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Universal Fixed Top Navigation */}
      <UserNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadCount}
        onOpenNotifications={() => {
          loadNotifications();
          setNotificationsOpen(true);
        }}
        onOpenProfile={() => setProfileOpen(true)}
        onSearchClick={() => setActiveTab('browse-items')}
      />

      {/* Main Responsive Canvas */}
      <main className="w-full pt-20 flex-1 bg-surface px-margin py-space-md">
        {activeTab === 'user-home-overview' && (
          <UserDashboardView
            user={user}
            stats={dashboardData.stats}
            recentNotifications={dashboardData.recentNotifications}
            topAIMatch={dashboardData.topAIMatch}
            liveCampusItems={dashboardData.liveCampusItems}
            onNavigate={setActiveTab}
            onViewItem={(item) => setSelectedItemForDetails(item)}
            onClaimItem={(item) => setSelectedItemForClaim(item)}
          />
        )}

        {activeTab === 'browse-items' && (
          <BrowseItemsView
            user={user}
            onViewItem={(item) => setSelectedItemForDetails(item)}
            onClaimItem={(item) => setSelectedItemForClaim(item)}
          />
        )}

        {activeTab === 'report-lost-item' && (
          <ReportLostItemView
            onNavigate={setActiveTab}
            onReportSuccess={() => loadDashboardData()}
          />
        )}

        {activeTab === 'report-found-item' && (
          <ReportFoundItemView
            onNavigate={setActiveTab}
            onReportSuccess={() => loadDashboardData()}
          />
        )}

        {activeTab === 'my-reports' && (
          <MyReportsView
            onNavigate={setActiveTab}
            onViewItem={(item) => setSelectedItemForDetails(item)}
            onClaimItem={(item) => setSelectedItemForClaim(item)}
          />
        )}

        {activeTab === 'my-claims' && (
          <MyClaimsView
            user={user}
            onNavigate={setActiveTab}
            onViewItem={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {activeTab === 'ai-smart-match' && (
          <AISmartMatchView
            user={user}
            onOpenClaim={(item) => setSelectedItemForClaim(item)}
            onViewItem={(item) => setSelectedItemForDetails(item)}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ItemDetailsModal
        isOpen={Boolean(selectedItemForDetails)}
        item={selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        onOpenClaim={(item) => {
          setSelectedItemForDetails(null);
          setSelectedItemForClaim(item);
        }}
        currentUser={user}
      />

      <SubmitClaimModal
        isOpen={Boolean(selectedItemForClaim)}
        item={selectedItemForClaim}
        onClose={() => setSelectedItemForClaim(null)}
        onSuccess={() => {
          loadDashboardData();
          loadNotifications();
          setActiveTab('my-claims');
        }}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationRead={handleNotificationRead}
        onViewItem={(item) => setSelectedItemForDetails(item)}
      />

      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

export default UserDashboard;
