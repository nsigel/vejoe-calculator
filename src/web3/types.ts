import { BigNumber } from "ethers";

export interface LPData {
	token0: string;
	token0Name: string;
	token0Symbol: string;
	token0Decimals: number;

	token1: string;
	token1Name: string;
	token1Symbol: string;
	token1Decimals: number;

	totalSupply: number;

	pair: string;
	lpAddress: string;
	totalLpSupply: BigNumber;
	allocPoint: BigNumber;
	totalFactor: BigNumber;
	veJoeShareBp: BigNumber;
	poolID: number;
}

export interface ReserveData {
	_reserve0: BigNumber;
	_reserve1: BigNumber;
	_blockTimestampLast: number;
}

export interface PoolInfoData {
	accJoePerFactorPerShare: BigNumber;
	acJoePerShare: BigNumber;
	allocPoint: BigNumber;
	lastRewardTimestamp: BigNumber;
	lpToken: string;
	rewarder: string;
	totalFactor: BigNumber;
	totalLpSupply: BigNumber;
	veJoeShareBp: number;
}
