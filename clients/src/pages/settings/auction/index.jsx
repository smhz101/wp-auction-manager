import ContentSection from '../components/content-section';
import AuctionForm from './auction-form';

export default function AuctionSettingPage() {
  return (
    <ContentSection
      title="Auction Mechanics"
      desc="Configure default bid increments and soft-close behavior."
    >
      <AuctionForm />
    </ContentSection>
  );
}
