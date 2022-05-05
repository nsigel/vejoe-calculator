import { useFormik } from "formik";
import { useEffect, useState } from "react";
import Input from "./Input";
import axios from "axios";

const Form = () => {
	const [poolIDs, setPoolIds] = useState([]);

	const formik = useFormik({
		initialValues: { farm: "", coin1: "", coin2: "", address: "", balance: "" },
		onSubmit: (values) => {
			console.log(values);
		},
	});

	async function fetchPools() {
		const { data } = await axios.post(
			"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/boosted-master-chef",
			{ query: "{ pools { id pair } }" }
		);

		setPoolIds(
			data.data.pools.map((pool: { id: number; pair: string }) => pool.id)
		);
	}

	useEffect(() => {
		fetchPools().catch(console.error);
	}, []);

	useEffect(() => {
		async function fetchBalance(address: string) {
			const { data } = await axios.post(
				"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/vejoe",
				{ query: `{ users( where: { id: "${address}" } ) { veJoeBalance } }` }
			);

			if (!data.data.users) return;

			formik.setFieldValue(
				"balance",
				Math.floor(data.data.users[0].veJoeBalance)
			);
		}

		if (formik.values.address) {
			fetchBalance(formik.values.address);
		}
	}, [formik]);

	return (
		<div className="bg-joe-light-blue justify-center flex-col p-4 w-[650px] h-96 text-white text-md font-semibold">
			Calculate Boost
			<form
				className="w-full flex flex-col gap-y-1 mt-2"
				onSubmit={formik.handleSubmit}
			>
				<select className="bg-joe-dark-blue h-8 border border-joe-purple focus:outline-none text-xs">
					<option value="" selected>
						Select Farm
					</option>
				</select>

				<div className="flex justify-between gap-x-2 w-full">
					<Input
						disabled={!formik.values.farm}
						name="coin1"
						onChange={formik.handleChange}
						value={formik.values.coin1}
						placeholder="Select a farm to continue..."
					/>
					<Input
						disabled={!formik.values.farm}
						name="coin2"
						onChange={formik.handleChange}
						value={formik.values.coin2}
						placeholder="Select a farm to continue..."
					/>
				</div>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name="address"
						onChange={formik.handleChange}
						value={formik.values.address}
					/>
					<Input
						name="balance"
						onChange={formik.handleChange}
						value={formik.values.balance}
					/>
				</div>
				<button
					type="submit"
					className="bg-joe-purple h-16 rounded-sm my-2 text-white text-xs font-semibold"
				>
					Calculate APR!
				</button>
			</form>
			Your APR:
		</div>
	);
};

export default Form;
