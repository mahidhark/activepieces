import {
  Template,
  TemplateTelemetryEventType,
  TemplateType,
  UncategorizedFolderId,
} from '@activepieces/shared';
import { t } from 'i18next';
import { Plus, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApSidebarToggle } from '@/components/custom/ap-sidebar-toggle';
import { InputWithIcon } from '@/components/custom/input-with-icon';
import { Button } from '@/components/ui/button';
import { flowHooks } from '@/features/flows';
import { templatesTelemetryApi, templatesHooks } from '@/features/templates';
import { platformHooks } from '@/hooks/platform-hooks';
import { useEmbedding } from '@/components/providers/embed-provider';

import { AllCategoriesView } from './all-categories-view';
import { CategoryFilterCarousel } from './category-filter-carousel';
import { EmptyTemplatesView } from './empty-templates-view';
import { SelectedCategoryView } from './selected-category-view';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { data: templateCategories } = templatesHooks.useTemplateCategories();
  const { platform } = platformHooks.useCurrentPlatform();
  const { embedState } = useEmbedding();
  const isEmbedded = embedState.isEmbedded;
  const isShowingOfficialTemplates = false;
  const { templates, isLoading, search, setSearch, category, setCategory } =
    templatesHooks.useTemplates(TemplateType.CUSTOM);
  const selectedCategory = category as string;
  const { data: allOfficialTemplates, isLoading: isAllTemplatesLoading } =
    templatesHooks.useAllOfficialTemplates();
  const { mutate: createFlow, isPending: isCreateFlowPending } =
    flowHooks.useStartFromScratch(UncategorizedFolderId);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleTemplateSelect = (template: Template) => {
    navigate(`/templates/${template.id}`);
    if (template.type === TemplateType.OFFICIAL) {
      templatesTelemetryApi.sendEvent({
        eventType: TemplateTelemetryEventType.VIEW,
        templateId: template.id,
      });
    }
  };

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, Template[]> = {} as Record<
      string,
      Template[]
    >;

    if (isShowingOfficialTemplates) {
      allOfficialTemplates?.forEach((template: Template) => {
        if (template.categories?.length) {
          template.categories?.forEach((category: string) => {
            if (!grouped[category]) {
              grouped[category] = [];
            }
            grouped[category].push(template);
          });
        }
      });
    }

    return grouped;
  }, [allOfficialTemplates, isShowingOfficialTemplates]);

  const categories = useMemo(() => {
    return ['All', ...(templateCategories || [])];
  }, [templateCategories]);

  const selectedCategoryTemplates = useMemo(() => {
    if (selectedCategory === 'All') {
      return [...(templates || []), ...(isEmbedded ? [] : (allOfficialTemplates || []))];
    }
    const customFiltered = (templates || []).filter(
      (v) => v.categories && v.categories.includes(selectedCategory),
    );
    const officialFiltered = isEmbedded
      ? []
      : (allOfficialTemplates || []).filter(
          (v) => v.categories && v.categories.includes(selectedCategory),
        );
    return [...customFiltered, ...officialFiltered];
  }, [selectedCategory, templates, allOfficialTemplates, isEmbedded]);

  const showLoading =
    isLoading || (isShowingOfficialTemplates && isAllTemplatesLoading);
  const showAllCategories =
    isShowingOfficialTemplates && selectedCategory === 'All';
  const hasTemplates = selectedCategoryTemplates && selectedCategoryTemplates.length > 0;
  const showCategoryTitleForOfficialTemplates =
    isShowingOfficialTemplates && selectedCategory !== 'All';

  return (
    <div>
      <div>
        <div className="sticky top-0 z-10 bg-background mb-6 pt-4">
          <div className="flex flex-row w-full justify-between gap-2">
            <ApSidebarToggle />
            <InputWithIcon
              icon={<Search className="text-gray-500 w-4 h-4" />}
              type="text"
              value={search}
              onChange={handleSearchChange}
              className="bg-sidebar-accent w-[50%]"
              placeholder={t('Search templates by name or description')}
            />
            <div className="flex flex-row justify-end w-[50%]">
              <Button
                variant="outline"
                className="gap-2 h-full"
                onClick={() => createFlow()}
                disabled={isCreateFlowPending}
              >
                <Plus className="w-4 h-4" />
                {t('Start from scratch')}
              </Button>
            </div>
          </div>
          {categories && !isEmbedded && (
            <CategoryFilterCarousel
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setCategory}
            />
          )}
        </div>

        {!hasTemplates && !showLoading ? (
          <EmptyTemplatesView />
        ) : showAllCategories ? (
          <AllCategoriesView
            templatesByCategory={templatesByCategory}
            categories={categories}
            onCategorySelect={setCategory}
            onTemplateSelect={handleTemplateSelect}
            isLoading={showLoading}
            hideHeader={!isShowingOfficialTemplates}
          />
        ) : (
          <SelectedCategoryView
            category={selectedCategory}
            templates={selectedCategoryTemplates}
            onTemplateSelect={handleTemplateSelect}
            isLoading={showLoading}
            showCategoryTitle={showCategoryTitleForOfficialTemplates}
          />
        )}
      </div>
    </div>
  );
};

export { TemplatesPage };
