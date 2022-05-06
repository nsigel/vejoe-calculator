import { useEffect, useState } from "react";
import axios from "axios";

import Input from "./Input";

import { balancePair, fetchBalance, getLPs } from "../../web3";
import { LPData } from "../../utils/types";

const Form = () => {
	const [selectedPool, setSelectedPool] = useState<LPData>();

	const [token0, setToken0] = useState<number>(0);
	const [token1, setToken1] = useState<number>(0);
	const [total, setTotal] = useState<number>(0);

	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<number>(0);

	const [pools, setPools] = useState<LPData[]>([]);

	useEffect(() => {
		async function getPools() {
			setPools(await getLPs());
		}
		getPools();
	}, []);

	useEffect(() => {
		setTotal(token0 + token1);
	}, [token0, token1]);

	useEffect(() => {
		async function getBalance() {
			fetchBalance(address).then(setBalance);
		}
		getBalance();
	}, [address]);

	return (
		<div className="bg-joe-light-blue justify-center flex-col p-4 w-[650px] h-96 text-white text-md font-semibold">
			Calculate Boost
			<div className="w-full flex flex-col gap-y-1 mt-2">
				<select
					className="bg-joe-dark-blue h-8 border border-joe-purple focus:outline-none text-xs"
					defaultValue="Select Farm"
					value={selectedPool?.pair}
					onChange={(e) => {
						setSelectedPool(pools.find((pool) => pool.pair === e.target.value));
					}}
				>
					<option value="Select Farm">Select Farm</option>
					{pools.map((pool, i) => {
						return (
							<option key={i} value={pool.pair}>
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
							setToken0(e.target.valueAsNumber);

							const pair = await balancePair(
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
							setToken1(e.target.valueAsNumber);

							const pair = await balancePair(
								selectedPool!.lpAddress,
								Number.parseFloat(e.target.value),
								1
							);
							setToken0(pair);
						}}
						value={token1}
						type="number"
						disabled={!selectedPool}
					/>
				</div>
				<Input
					name="total"
					placeholder={!selectedPool ? "Select a farm to continue..." : ""}
					onChange={(e) => setTotal(e.target.valueAsNumber)}
					disabled={!selectedPool}
					value={total}
				/>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name="address"
						onChange={(e) => setAddress(e.target.value)}
						value={address}
					/>
					<Input
						name="balance"
						onChange={(e) => setBalance(Number(e.target.value))}
						value={balance}
						type="number"
					/>
				</div>
				<button
					type="submit"
					className="bg-joe-purple h-16 rounded-sm my-2 text-white text-xs font-semibold"
				>
					Calculate APR!
				</button>
			</div>
			Your APR:
		</div>
	);
};

export default Form;
