import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { balancePair, tokenPrice, totalJoePerSec } from "../web3";
import { LPData, ReserveData } from "../web3/types";

type Props = {
	poolData: LPData;
	totalAllocPoint: BigNumber;
	token0: number;
	token1: number;
	veJoe: number;
	joePrice: number;
	reserve: ReserveData;
	token0Price: number;
	token1Price: number;
};

const Result = ({
	poolData,
	totalAllocPoint,
	token0,
	token1,
	veJoe,
	joePrice,
	reserve,
	token0Price,
	token1Price,
}: Props) => {
	const token0Reserve =
		Number(reserve._reserve0) / 10 ** poolData.token0Decimals;
	const totalSupply = Number(poolData.totalSupply) / 10 ** 18;
	const userLiquidity = (token0 / token0Reserve) * totalSupply;

	const totalVeJoe = Number(totalJoePerSec) / 10 ** 18;
	const farmJoePerSec =
		(totalVeJoe * Number(poolData.allocPoint)) / Number(totalAllocPoint); // checked

	const farmBaseJoePerSec =
		farmJoePerSec * (1 - Number(poolData.veJoeShareBp) / 10000);

	const farmVeJoePerSec =
		farmJoePerSec * (Number(poolData.veJoeShareBp) / 10000);

	const totalLpSupply = Number(poolData.totalLpSupply) / 10 ** 18;
	const baseRewardPerSec = (farmBaseJoePerSec * userLiquidity) / totalLpSupply;
	const rewardBoostedPerSec =
		((Math.sqrt(veJoe * userLiquidity) * farmVeJoePerSec) /
			Number(poolData.totalFactor)) *
		10 ** 18;

	const getAnnualizedReturn = (n: number) => n * 3600 * 24 * 365;

	const boostedAPR =
		((rewardBoostedPerSec * joePrice * 3600 * 24 * 365) /
			(token0Price * token0) /
			2) *
		100;

	const baseAPR =
		(getAnnualizedReturn(baseRewardPerSec * joePrice) /
			(token0Price * token0) /
			2) *
		100;
	const annualizedReturn =
		token0 * token0Price * 2 * (boostedAPR / 100 + baseAPR / 100);

	return (
		<div className="flex flex-col text-xs font-normal mt-1">
			{poolData && totalAllocPoint && token0 && token1 && veJoe ? (
				<div className="flex flex-row w-full gap-x-4">
					<div>
						<div className="text-gray-500 mb-1">Base APR</div>
						{baseAPR.toFixed(2)}%
					</div>
					<div>
						<div className="text-gray-500 mb-1">Estimated Boosted APR</div>
						{boostedAPR.toFixed(2)}%
					</div>
					<div>
						<div className="text-gray-500 mb-1">
							Estimated Annualized Return
						</div>
						${annualizedReturn.toFixed(2)}
					</div>
					<div>
						<div className="text-gray-500 mb-1">Base Reward Per Year</div>
						{(baseRewardPerSec * 3600 * 24 * 365).toFixed(2)} JOE
					</div>
				</div>
			) : null}
		</div>
	);
};

export default Result;
