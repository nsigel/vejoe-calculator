import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { calculateBaseReward, calculateBoostedReward } from "../web3";
import { LPData } from "../web3/types";

type Props = {
	poolData?: LPData;
	totalAllocPoint?: BigNumber;
	token0?: number;
	token1?: number;
	veJoe?: number;
	joePrice?: number;
};

const Result = ({
	poolData,
	totalAllocPoint,
	token0,
	token1,
	veJoe,
	joePrice,
}: Props) => {
	const [baseReward, setBaseReward] = useState<number>(0);
	const [boostedReward, setBoostedReward] = useState<number>(0);
	const [boostedAPR, setBoostedAPR] = useState<number>(0);
	const [baseAPR, setBaseAPR] = useState<number>(0);

	useEffect(() => {
		if (!(poolData && totalAllocPoint && token0 && token1 && veJoe && joePrice))
			return;

		console.log(joePrice);

		setBaseReward(calculateBaseReward(poolData, token0, token1));
		setBoostedReward(calculateBoostedReward(poolData, token0, token1, veJoe));
	}, []);

	return (
		<div className="flex flex-col text-xs font-normal">
			{poolData && totalAllocPoint && token0 && token1 && veJoe ? (
				<div>
					<div>
						Base Reward:
						{baseReward}
					</div>
					<div>
						Boosted Reward:
						{boostedReward}
					</div>
				</div>
			) : null}
		</div>
	);
};

export default Result;
