import { useEffect, useState } from "react";
import Input from "./Input";
import axios from "axios";
import { Contract } from "ethers";
import { getLPData } from "../../web3";

const Form = () => {
	const [farm, setFarm] = useState<string>("");
	const [coin1, setCoin1] = useState<string>("");
	const [coin2, setCoin2] = useState<string>("");
	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<number>(0);

	useEffect(() => {
		async function fetchBalance(address: string) {
			const { data } = await axios.post(
				"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/vejoe",
				{ query: `{ users( where: { id: "${address}" } ) { veJoeBalance } }` }
			);

			if (!data.data.users[0]) return;

			setBalance(Math.floor(data.data.users[0].veJoeBalance));

			if (!data.data.users) return;
		}
		fetchBalance(address);
	}, [address]);

	useEffect(() => {
		console.log(getLPData(3).then((e) => console.log(e)));
	}, []);

	return (
		<div className="bg-joe-light-blue justify-center flex-col p-4 w-[650px] h-96 text-white text-md font-semibold">
			Calculate Boost
			<div className="w-full flex flex-col gap-y-1 mt-2">
				<select className="bg-joe-dark-blue h-8 border border-joe-purple focus:outline-none text-xs">
					<option value="" selected>
						Select Farm
					</option>
				</select>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name="Coin 1"
						placeholder="Select a farm to continue..."
						onChange={(e) => setCoin1(e.target.value)}
						value={coin1}
						disabled={!farm}
					/>
					<Input
						name="Coin 2"
						placeholder="Select a farm to continue..."
						onChange={(e) => setCoin2(e.target.value)}
						value={coin2}
						disabled={!farm}
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
