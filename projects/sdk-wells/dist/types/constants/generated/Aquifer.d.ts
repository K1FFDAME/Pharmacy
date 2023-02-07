import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare type CallStruct = {
    target: PromiseOrValue<string>;
    data: PromiseOrValue<BytesLike>;
};
export declare type CallStructOutput = [string, string] & {
    target: string;
    data: string;
};
export interface AquiferInterface extends utils.Interface {
    functions: {
        "boreWell(address[],(address,bytes),(address,bytes)[],address)": FunctionFragment;
        "getWellBy2Tokens(address,address,uint256)": FunctionFragment;
        "getWellByIndex(uint256)": FunctionFragment;
        "getWellByNTokens(address[],uint256)": FunctionFragment;
        "getWellsBy2Tokens(address,address)": FunctionFragment;
        "getWellsByNTokens(address[])": FunctionFragment;
        "numberOfWells()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "boreWell" | "getWellBy2Tokens" | "getWellByIndex" | "getWellByNTokens" | "getWellsBy2Tokens" | "getWellsByNTokens" | "numberOfWells"): FunctionFragment;
    encodeFunctionData(functionFragment: "boreWell", values: [
        PromiseOrValue<string>[],
        CallStruct,
        CallStruct[],
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getWellBy2Tokens", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "getWellByIndex", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getWellByNTokens", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getWellsBy2Tokens", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getWellsByNTokens", values: [PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "numberOfWells", values?: undefined): string;
    decodeFunctionResult(functionFragment: "boreWell", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWellBy2Tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWellByIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWellByNTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWellsBy2Tokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWellsByNTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "numberOfWells", data: BytesLike): Result;
    events: {
        "BoreWell(address,address[],tuple,tuple[],address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "BoreWell"): EventFragment;
}
export interface BoreWellEventObject {
    well: string;
    tokens: string[];
    wellFunction: CallStructOutput;
    pumps: CallStructOutput[];
    auger: string;
}
export declare type BoreWellEvent = TypedEvent<[
    string,
    string[],
    CallStructOutput,
    CallStructOutput[],
    string
], BoreWellEventObject>;
export declare type BoreWellEventFilter = TypedEventFilter<BoreWellEvent>;
export interface Aquifer extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AquiferInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        boreWell(tokens: PromiseOrValue<string>[], wellFunction: CallStruct, pumps: CallStruct[], auger: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getWellBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string] & {
            well: string;
        }>;
        getWellByIndex(index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string] & {
            well: string;
        }>;
        getWellByNTokens(tokens: PromiseOrValue<string>[], i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string] & {
            well: string;
        }>;
        getWellsBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[string[]] & {
            wells: string[];
        }>;
        getWellsByNTokens(tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<[string[]] & {
            wells: string[];
        }>;
        numberOfWells(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    boreWell(tokens: PromiseOrValue<string>[], wellFunction: CallStruct, pumps: CallStruct[], auger: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getWellBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    getWellByIndex(index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    getWellByNTokens(tokens: PromiseOrValue<string>[], i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    getWellsBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string[]>;
    getWellsByNTokens(tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<string[]>;
    numberOfWells(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        boreWell(tokens: PromiseOrValue<string>[], wellFunction: CallStruct, pumps: CallStruct[], auger: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string>;
        getWellBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        getWellByIndex(index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        getWellByNTokens(tokens: PromiseOrValue<string>[], i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        getWellsBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string[]>;
        getWellsByNTokens(tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<string[]>;
        numberOfWells(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "BoreWell(address,address[],tuple,tuple[],address)"(well?: null, tokens?: null, wellFunction?: null, pumps?: null, auger?: null): BoreWellEventFilter;
        BoreWell(well?: null, tokens?: null, wellFunction?: null, pumps?: null, auger?: null): BoreWellEventFilter;
    };
    estimateGas: {
        boreWell(tokens: PromiseOrValue<string>[], wellFunction: CallStruct, pumps: CallStruct[], auger: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getWellBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getWellByIndex(index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getWellByNTokens(tokens: PromiseOrValue<string>[], i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getWellsBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getWellsByNTokens(tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber>;
        numberOfWells(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        boreWell(tokens: PromiseOrValue<string>[], wellFunction: CallStruct, pumps: CallStruct[], auger: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getWellBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWellByIndex(index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWellByNTokens(tokens: PromiseOrValue<string>[], i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWellsBy2Tokens(token0: PromiseOrValue<string>, token1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWellsByNTokens(tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        numberOfWells(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
