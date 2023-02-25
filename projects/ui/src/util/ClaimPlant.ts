import {
  BeanstalkSDK,
  FarmToMode,
  TokenValue,
  FarmWorkflow,
} from '@beanstalk/sdk';
import { ethers } from 'ethers';
import { DepositCrate } from '~/state/farmer/silo';
 
export enum ClaimPlantAction {
  MOW = 'MOW',
  PLANT = 'PLANT',
  ENROOT = 'ENROOT',
  HARVEST = 'HARVEST',
  RINSE = 'RINSE',
  CLAIM = 'CLAIM',
}

export type ClaimPlantActionData = {
  /**
   * workflow steps to execute
   */
  workflow: FarmWorkflow
  /**
   * function to estimate gas of the transaction
   */
  estimateGas: () => Promise<ethers.BigNumber>;
}

type ClaimBeansParams<T> = {
  amount?: TokenValue;
  toMode?: FarmToMode;
} & T;

type ClaimPlantActionParamMap = {
  [ClaimPlantAction.HARVEST]: ClaimBeansParams<{ plotIds: string[] }>;
  [ClaimPlantAction.CLAIM]: ClaimBeansParams<{ seasons: string[] }>;
  [ClaimPlantAction.RINSE]: ClaimBeansParams<{ tokenIds: string[] }>;
  [ClaimPlantAction.MOW]: { account: string };
  [ClaimPlantAction.PLANT]: {};
  [ClaimPlantAction.ENROOT]: { crates: { [addr: string]: DepositCrate[] } };
}

export type ClaimPlantActionMap = {
  [action in ClaimPlantAction]: (...params: (Partial<ClaimPlantActionParamMap[action]>)[]) => ClaimPlantActionData 
}

export type ClaimPlantActionDataMap = Partial<{ [action in ClaimPlantAction]: ClaimPlantActionData }>;

type ClaimPlantFunction<T extends ClaimPlantAction> = (
  sdk: BeanstalkSDK, ...parameters: (ClaimPlantActionParamMap[T])[]
) => ClaimPlantActionData;

const harvest: ClaimPlantFunction<ClaimPlantAction.HARVEST> = (sdk, { plotIds, amount, toMode }) => {
  const { beanstalk } = sdk.contracts;

  const farm = sdk.farm.create('Harvest');
  farm.add(async (_amountInStep: ethers.BigNumber) => ({
    name: 'harvest',
    amountOut: amount?.toBigNumber() || _amountInStep,
    prepare: () => ({
      target: beanstalk.address,
      callData: beanstalk.interface.encodeFunctionData('harvest', [
        plotIds,
        toMode || FarmToMode.INTERNAL,
      ]),
    }),
    decode: (data: string) => beanstalk.interface.decodeFunctionData('harvest', data),
    decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('harvest', result),
  }));

  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.harvest(plotIds, toMode || FarmToMode.INTERNAL)
  };
};

const claim: ClaimPlantFunction<ClaimPlantAction.CLAIM> = (sdk, { seasons, toMode }) => {
  const { beanstalk } = sdk.contracts;
  const { BEAN } = sdk.tokens;
  const farm = sdk.farm.create('ClaimWithdrawal');

  if (seasons.length === 1) {
    farm.add(new sdk.farm.actions.ClaimWithdrawal(
      sdk.tokens.BEAN.address,
      seasons[0],
      toMode || FarmToMode.INTERNAL,
    ));

    return { 
      workflow: farm.copy(),
      estimateGas: () => beanstalk.estimateGas.claimWithdrawal(BEAN.address, seasons[0], toMode || FarmToMode.INTERNAL),
    };
  } 
  farm.add(new sdk.farm.actions.ClaimWithdrawals(
    sdk.tokens.BEAN.address,
    seasons,
    toMode || FarmToMode.INTERNAL
  ));

  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.claimWithdrawals(BEAN.address, seasons, toMode || FarmToMode.INTERNAL),
  };
};

const rinse: ClaimPlantFunction<ClaimPlantAction.RINSE> = (sdk, { tokenIds, amount, toMode }) => {
  const { beanstalk } = sdk.contracts;
  const farm = sdk.farm.create('ClaimFertilized');

  farm.add(async (_amountInStep: ethers.BigNumber) => ({
    name: 'claimFertilized',
    amountOut: amount?.toBigNumber() || _amountInStep,
    prepare: () => ({
      target: beanstalk.address,
      callData: beanstalk.interface.encodeFunctionData('claimFertilized', [
        tokenIds,
        toMode || FarmToMode.INTERNAL,
      ])
    }),
    decode: (data: string) => beanstalk.interface.decodeFunctionData('claimFertilized', data),
    decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('claimFertilized', result),
  }));
 
  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.claimFertilized(tokenIds, toMode || FarmToMode.INTERNAL)
  };
};

const mow: ClaimPlantFunction<ClaimPlantAction.MOW> = (sdk, { account }) => {
  const { beanstalk } = sdk.contracts;
  const farm = sdk.farm.create('Mow');

  farm.add(async (_amountInStep: ethers.BigNumber) => ({
    name: 'update',
    amountOut: _amountInStep,
    prepare: () => ({
      target: beanstalk.address,
      callData: beanstalk.interface.encodeFunctionData('update', [
        account
      ]),
    }),
    decode: (data: string) => beanstalk.interface.decodeFunctionData('update', data),
    decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('update', result),
  }));

  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.update(account)
  };
};

const plant: ClaimPlantFunction<ClaimPlantAction.PLANT> = (sdk) => {
  const { beanstalk } = sdk.contracts;
  const farm = sdk.farm.create('Plant');

  farm.add(async (_amountInStep: ethers.BigNumber) => ({
    name: 'plant',
    amountOut: _amountInStep,
    prepare: () => ({
      target: beanstalk.address,
      callData: beanstalk.interface.encodeFunctionData('plant', undefined),
    }),
    decode: (data: string) => beanstalk.interface.decodeFunctionData('plant', data),
    decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('plant', result),
  }));
  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.plant()
  };
};

const enroot: ClaimPlantFunction<ClaimPlantAction.ENROOT> = (sdk, { crates }) => {
  const { beanstalk } = sdk.contracts;
  const callData: string[] = [];
  const farm = sdk.farm.create('EnrootDeposit(s)');

  [...sdk.tokens.unripeTokens].forEach((urToken) => {
    const _crates = crates[urToken.address];
    if (_crates.length === 1) {
      const encoded = beanstalk.interface.encodeFunctionData('enrootDeposit', [
        urToken.address,
        _crates[0].season.toString(),
        urToken.fromHuman(_crates[0].amount.toString()).toBlockchain(),
      ]);

      farm.add(async (_amountInStep: ethers.BigNumber) => ({
        name: 'enrootDeposit',
        amountOut: _amountInStep,
        prepare: () => ({ 
          target: beanstalk.address,
          callData: encoded
        }),
        decode: (data: string) => beanstalk.interface.decodeFunctionData('enrootDeposit', data),
        decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('enrootDeposit', result),
      }));
      callData.push(encoded);
    } else if (_crates.length > 1) {
      const encoded = beanstalk.interface.encodeFunctionData('enrootDeposits', [
        urToken.address,
        _crates.map((crate) => crate.season.toString()),
        _crates.map((crate) => urToken.fromHuman(crate.amount.toString()).toBlockchain())
      ]);

      farm.add(async (_amountInStep: ethers.BigNumber) => ({
        name: 'enrootDeposits',
        amountOut: _amountInStep,
        prepare: () => ({ 
          target: beanstalk.address,
          callData: encoded
        }),
        decode: (data: string) => beanstalk.interface.decodeFunctionData('enrootDeposits', data),
        decodeResult: (result: string) => beanstalk.interface.decodeFunctionResult('enrootDeposits', result)
      }));
      callData.push(encoded);
    }
  });

  return {
    workflow: farm.copy(),
    estimateGas: () => beanstalk.estimateGas.farm([
      ...callData
    ])
  };
};

export type ClaimPlantResult = {
  estimate: ethers.BigNumber,
  execute: () => Promise<ethers.ContractTransaction>,
  actionsPerformed: Set<ClaimPlantAction>,
}

// -------------------------------------------------------------------------

class ClaimPlant {
  private static actionsMap: { [key in ClaimPlantAction]: ClaimPlantFunction<key> } = {
    [ClaimPlantAction.RINSE]: rinse,
    [ClaimPlantAction.HARVEST]: harvest,
    [ClaimPlantAction.CLAIM]: claim,
    [ClaimPlantAction.MOW]: mow,
    [ClaimPlantAction.PLANT]: plant,
    [ClaimPlantAction.ENROOT]: enroot,
  }

  static getAction(action: ClaimPlantAction) {
    return ClaimPlant.actionsMap[action] as ClaimPlantFunction<typeof action>;
  }

  static presets = {
    claimBeans: [
      ClaimPlantAction.RINSE,
      ClaimPlantAction.HARVEST,
      ClaimPlantAction.CLAIM
    ],
    plant: [
      ClaimPlantAction.PLANT,
    ],
    none: [],
  }

  private static deduplicate(
    primaryActions: ClaimPlantActionDataMap,
    _secondaryActions: ClaimPlantActionDataMap,
    filterMow?: boolean
  ) {
    const actionsPerformed = new Set<ClaimPlantAction>([
      ...Object.keys(primaryActions), 
      ...Object.keys(_secondaryActions)
    ] as ClaimPlantAction[]);
  
    /// --- Deduplicate actions --- 
    // If the same action exists in both primary and secondary, we use the one in primary
    const set = new Set<ClaimPlantAction>();
    Object.keys(_secondaryActions).forEach((key) => set.add(key as ClaimPlantAction));
    Object.keys(primaryActions).forEach((key) => set.delete(key as ClaimPlantAction));
  
    const secondaryActions = [...set].reduce<ClaimPlantActionDataMap>((prev, curr) => {
      prev[curr] = _secondaryActions[curr];
      return prev;
    }, {});
  
     /**
     * Make sure that if we are calling 'enroot' or 'plant', we are not also calling mow.
     * 'Mow' is executed by default if enrooting or planting on the contract side.
     */
     const enrooting = ClaimPlantAction.ENROOT in primaryActions || ClaimPlantAction.ENROOT in secondaryActions;
     const planting = ClaimPlantAction.PLANT in primaryActions || ClaimPlantAction.PLANT in secondaryActions;
     const claimingWithdrawals = ClaimPlantAction.CLAIM in primaryActions || ClaimPlantAction.CLAIM in secondaryActions;
  
    if (enrooting || planting || claimingWithdrawals || filterMow) {
      if (ClaimPlantAction.MOW in primaryActions) delete primaryActions[ClaimPlantAction.MOW];
      if (ClaimPlantAction.MOW in secondaryActions) delete secondaryActions[ClaimPlantAction.MOW];
      actionsPerformed.delete(ClaimPlantAction.MOW);
    }

    return {
      primaryActions,
      secondaryActions,
      actionsPerformed,
    };
  }

  static async build(
    /** */
    sdk: BeanstalkSDK,
    /** 
     * ClaimPlantActions required to precede any arbitrary function call when calling Farm
     */
    _primaryActions: ClaimPlantActionDataMap,
    /** 
     * Additional ClaimPlantActions that don't affect the main operation
     */
    _secondaryActions: ClaimPlantActionDataMap,
    /** 
     * workflow that executes some function call if performed in isolation
     * Ex: if performing a deposit, pass in FarmWorkflow with only the steps to perform a deposit
     */
    operation: FarmWorkflow,
    /** */
    amountIn: TokenValue,
    /** */
    options: {
      slippage: number
      value?: ethers.BigNumber
    },
    filterMow?: boolean,
  ): Promise<ClaimPlantResult> {
    const { 
      primaryActions, 
      secondaryActions, 
      actionsPerformed 
    } = ClaimPlant.deduplicate(_primaryActions, _secondaryActions, filterMow);
  
    /// --- Construct workflow ---
    const farm = sdk.farm.create();

    Object.values(secondaryActions).forEach(({ workflow }) => { 
      farm.add(workflow.copy());
    });
    const primary = Object.values(primaryActions);
    primary.forEach(({ workflow }) => {
      farm.add(workflow.copy());
    });
  
    if (primary.length > 1) {
      farm.add(ClaimPlant.injectOnlyLocal('pre-x', amountIn), { onlyLocal: true });
    }
    farm.add(operation.copy());
    
    const estimate = await farm.estimate(amountIn);
    
    const summary = farm.summarizeSteps();
    const mapped = summary.map((step) => ({
      name: step.name,
      amountOut: step.amountOut.toString(),
    }));
    console.table(mapped);
    console.log(farm.generators);
  
    const execute = () => farm.execute(amountIn, options);
  
    return { 
      estimate, 
      execute, 
      actionsPerformed
    };
  }

  static injectOnlyLocal(name: string, amount: TokenValue) {
    return () => ({
      name,
      amountOut: amount.toBigNumber(),
      prepare: () => ({ target: '', callData: '' }),
      decode: () => undefined,
      decodeResult: () => undefined,
    });
  }

  static injectOnlyLocalAndAddAmount(name: string, amount: TokenValue) {
    return async (_amountInStep: ethers.BigNumber, _context: any) => {
      const total = ethers.BigNumber.from(amount.toBlockchain()).add(_amountInStep);
      return {
        name,
        amountOut: total,
        prepare: () => ({ target: '', callData: '' }),
        decode: () => undefined,
        decodeResult: () => undefined,
      };
    };
  }
}

export default ClaimPlant;
