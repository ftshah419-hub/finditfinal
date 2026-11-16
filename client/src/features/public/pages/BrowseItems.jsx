import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import BrowseItemsView from '../../user/pages/BrowseItemsView';
import ItemDetailsModal from '../../user/components/ItemDetailsModal';
import '../../user/styles/userDesignTokens.css';

export const BrowseItems = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="w-full pt-20 flex-1 px-margin max-w-7xl mx-auto py-space-md">
        <BrowseItemsView
          user={null}
          onViewItem={(item) => setSelectedItem(item)}
          onClaimItem={() => navigate('/login')}
        />
      </main>

      <PublicFooter />

      <ItemDetailsModal
        isOpen={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenClaim={() => navigate('/login')}
      />
    </div>
  );
};

export default BrowseItems;
