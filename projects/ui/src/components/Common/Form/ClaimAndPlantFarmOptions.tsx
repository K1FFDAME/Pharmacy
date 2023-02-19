import React, { useCallback, useState } from 'react';
import { useFormikContext } from 'formik';
import SelectionAccordion from '~/components/Common/Selection/SelectionAccordion';
import { ClaimPlantAction } from '~/hooks/beanstalk/useClaimAndPlantActions';
import useFarmerClaimPlantOptions from '~/hooks/farmer/useFarmerClaimAndPlantOptions';

import ClaimPlantAccordionPill from '~/components/Common/Selection/ClaimPlantOptionPill';
import ClaimPlantAccordionCard from '~/components/Common/Selection/ClaimPlantOptionCard';
import { ClaimAndPlantFormState } from '.';

const presets = {
  claim: {
    options: new Set([
      ClaimPlantAction.RINSE,
      ClaimPlantAction.HARVEST,
      ClaimPlantAction.CLAIM,
    ]),
    variant: 'pill',
  } as const,
  plant: {
    options: new Set([
      ClaimPlantAction.PLANT
    ]),
    variant: 'card',
  } as const,
};

const ClaimAndPlantFarmActions: React.FC<{
  preset: keyof typeof presets;
}> = ({ preset }) => {
  /// Formik
  const { values: { farmActions }, setFieldValue } = useFormikContext<ClaimAndPlantFormState>();

  /// State
  const [local, setLocal] = useState<Set<ClaimPlantAction>>(new Set(farmActions.selected));

  /// Helpers
  const { options } = useFarmerClaimPlantOptions();

  /// Handlers
  const handleOnToggle = useCallback((item: ClaimPlantAction) => {
    const copy = new Set([...local]);
    if (copy.has(item)) {
      copy.delete(item);
    } else {
      copy.add(item);
    }
    setLocal(copy);
    setFieldValue('farmActions.selected', Array.from(copy));
  }, [setFieldValue, local]);

  return (
    <SelectionAccordion<ClaimPlantAction>
      title="Add Claimable Assets to this transaction"
      options={presets[preset].options}
      selected={local}
      onToggle={handleOnToggle}
      sx={{ borderRadius: 1 }}
      direction="row"
      render={(item, selected) => {
        const sharedProps = { option: item, summary: options[item], selected };

        switch (presets[preset].variant) {
          case 'card': {
            return (
              <ClaimPlantAccordionCard {...sharedProps} />
            );
          }
          case 'pill': {
            return (
              <ClaimPlantAccordionPill {...sharedProps} />
            );
          }
          default:
            return null;
        }
      }}
    />
  );
};

export default ClaimAndPlantFarmActions;
