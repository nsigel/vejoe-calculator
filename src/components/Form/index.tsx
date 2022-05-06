import { useEffect, useState } from "react";
import axios from "axios";

import Input from "./Input";
import { balancePair, getLPs, getPairData } from "../../web3";
import { LPData } from "../../utils/types";

const Form = () => {
	const [selectedPool, setSelectedPool] = useState<LPData>();

	const [coin0, setCoin0] = useState<string>("");
	const [coin1, setCoin1] = useState<string>("");
	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<number>(0);
	const [total, setTotal] = useState<number>(0);

	const [pools, setPools] = useState<LPData[]>([]);

	useEffect(() => {
		const getPools = async () => {
			const pools = await getLPs();
			setPools(pools);
		};
		getPools();
	}, []);

	useEffect(() => {
		async function fetchBalance(address: string) {
			const { data } = await axios.post(
				"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/vejoe",
				{
					query: `{ users( where: { id: "${address.toLowerCase()}" } ) { veJoeBalance } }`,
				}
			);

			if (!data.data.users[0]) return;

			setBalance(Math.floor(data.data.users[0].veJoeBalance));

			if (!data.data.users) return;
		}
		fetchBalance(address);
	}, [address]);

	useEffect(() => {
		setTotal(Number(coin0) + Number(coin1));
	}, [coin0, coin1]);

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
							setCoin0(e.target.value);
							const pair = await balancePair(
								selectedPool!.lpAddress,
								Number.parseFloat(e.target.value),
								0
							);
							setCoin1(pair!.toString());
						}}
						value={coin0}
						type="number"
						disabled={!selectedPool}
					/>
					<Input
						name={selectedPool?.token1Name || "Select a farm..."}
						placeholder={!selectedPool ? "Select a farm to continue..." : ""}
						onChange={async (e) => {
							setCoin1(e.target.value);
							const pair = await balancePair(
								selectedPool!.lpAddress,
								Number.parseFloat(e.target.value),
								1
							);
							console.log(pair);
							setCoin1(pair!.toString());
						}}
						value={coin1}
						type="number"
						disabled={!selectedPool}
					/>
				</div>
				<Input
					name="total"
					onChange={(e) => setTotal(Number(e.target.value))}
					placeholder={!selectedPool ? "Select a farm to continue..." : ""}
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
