import { useEffect, useState } from "react";

import Input from "./Input";
import Result from "../Result";

import {
	balanceTokens,
	fetchBalance,
	getJoePrice,
	getLPReserves,
	getLPs,
	tokenPrice,
	totalAllocPoint,
} from "../../web3";
import { LPData, ReserveData } from "../../web3/types";

const Form = () => {
	const [selectedPool, setSelectedPool] = useState<LPData>();

	const [token0, setToken0] = useState<number>(0);
	const [token1, setToken1] = useState<number>(0);
	const [joePrice, setJoePrice] = useState<number>(0);

	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<number>(0);
	const [reserves, setReserves] = useState<ReserveData>();

	const [pools, setPools] = useState<LPData[]>([]);
	const [token0Price, setToken0Price] = useState<number>();
	const [token1Price, setToken1Price] = useState<number>();
	useEffect(() => {
		setToken0(0);
		setToken1(0);

		if (!selectedPool) return;

		tokenPrice(selectedPool, 0).then(setToken0Price);
		tokenPrice(selectedPool, 1).then(setToken1Price);

		getJoePrice().then(setJoePrice);
		getLPReserves(selectedPool).then(setReserves);
	}, [selectedPool, joePrice, token0Price, token1Price]);

	useEffect(() => {
		getLPs().then(setPools);
	}, []);

	useEffect(() => {
		async function getBalance() {
			if (!address) return;
			fetchBalance(address).then(setBalance);
		}
		getBalance();
	}, [address]);

	return (
		<div className="bg-joe-light-blue flex justify-start flex-col p-4 w-[576px] text-white text-lg rounded-md font-medium">
			Calculate Boost
			<div className="w-full flex flex-col gap-y-1 my-2 mb-3">
				<div className="text-gray-500 text-xs font-medium">Select Farm</div>
				<select
					className="bg-joe-dark-blue h-8 border rounded-sm border-joe-purple font-medium focus:outline-none text-xs px-1 pr-4"
					defaultValue="Select Farm"
					value={selectedPool?.pair}
					onChange={(e) => {
						setSelectedPool(pools.find((pool) => pool.pair === e.target.value));
					}}
				>
					<option value="Select Farm">Select Farm</option>
					{pools.map((pool, _) => {
						return (
							<option key={_} value={pool.pair}>
								{pool.pair}
							</option>
						);
					})}
				</select>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name={selectedPool?.token0Name || "Select a farm..."}
						placeholder={!selectedPool ? "Select a farm to continue..." : ""}
						onChange={async (e) => {
							if (!selectedPool) return;
							setToken0(e.target.valueAsNumber);

							const pair = await balanceTokens(
								selectedPool!.lpAddress,
								e.target.valueAsNumber,
								0
							);

							setToken1(pair);
						}}
						value={token0}
						type="number"
						disabled={!selectedPool}
					/>
					<Input
						name={selectedPool?.token1Name || "Select a farm..."}
						placeholder={!selectedPool ? "Select a farm to continue..." : ""}
						onChange={async (e) => {
							if (!selectedPool) return;
							setToken1(e.target.valueAsNumber);

							const pair = await balanceTokens(
								selectedPool!.lpAddress,
								e.target.valueAsNumber,
								1
							);

							setToken0(pair);
						}}
						value={token1}
						type="number"
						disabled={!selectedPool}
					/>
				</div>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name="address"
						onChange={(e) => setAddress(e.target.value)}
						value={address}
					/>
					<Input
						name="balance"
						onChange={(e) => setBalance(e.target.valueAsNumber)}
						value={balance}
						type="number"
					/>
				</div>
			</div>
			{selectedPool &&
			totalAllocPoint &&
			token0 &&
			token1 &&
			joePrice &&
			reserves &&
			token0Price &&
			token1Price &&
			balance ? (
				<>
					Your APR
					<Result
						{...{
							totalAllocPoint,
							token0,
							token1,
							joePrice,
							token0Price,
							token1Price,

							poolData: selectedPool,
							reserve: reserves,
							veJoe: balance,
						}}
					/>
				</>
			) : null}
		</div>
	);
};

export default Form;
