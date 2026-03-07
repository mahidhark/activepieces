import { t } from 'i18next';
import { flagsHooks } from '@/hooks/flags-hooks';
const FullLogo = () => {
  const branding = flagsHooks.useWebsiteBranding();
  return (
    <div className="flex justify-center items-center py-4 bg-transparent">
      <img
        className="h-[48px] w-auto"
        src={branding.logos.fullLogoUrl}
        alt={t('logo')}
      />
    </div>
  );
};
FullLogo.displayName = 'FullLogo';
export { FullLogo };
