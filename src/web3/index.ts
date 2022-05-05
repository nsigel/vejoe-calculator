import { ethers } from "ethers";

import BoostedMasterChief from "../contracts/BoostedMasterChef.json";
import JoeLPToken from "../contracts/JoeLPToken.json";
import IERC20 from "../contracts/IERC20.json";

const RPC_URL = "https://api.avax.network/ext/bc/C/rpc";

const BMC_ADDRESS = "0x4483f0b6e2F5486D06958C20f8C39A7aBe87bf8F";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const BMC_CONTRACT = new ethers.Contract(
	BMC_ADDRESS,
	BoostedMasterChief,
	provider
);

export async function getLPData(poolID: number) {
	const { lpToken } = await BMC_CONTRACT.poolInfo(poolID);

	const LP_CONTRACT = new ethers.Contract(lpToken, JoeLPToken, provider);

	const TOKEN_0_CONTRACT = new ethers.Contract(
		await LP_CONTRACT.token0(),
		IERC20,
		provider
	);
	const TOKEN_1_CONTRACT = new ethers.Contract(
		await LP_CONTRACT.token1(),
		IERC20,
		provider
	);

	return {
		token0: await LP_CONTRACT.token0(),
		token0Name: await TOKEN_0_CONTRACT.name(),
		token0Symbol: await TOKEN_0_CONTRACT.name(),
		token0Decimals: await TOKEN_0_CONTRACT.decimals(),

		token1: await LP_CONTRACT.token1(),
		token1Name: await TOKEN_1_CONTRACT.name(),
		token1Symbol: await TOKEN_1_CONTRACT.name(),
		token1Decimals: await TOKEN_1_CONTRACT.decimals(),
	};
}
