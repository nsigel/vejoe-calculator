import { LPData } from "./../utils/types";
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

export async function getLPData(poolID: number): Promise<LPData> {
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

	const [
		token0,
		token0Name,
		token0Symbol,
		token0Decimals,
		token1,
		token1Name,
		token1Symbol,
		token1Decimals,
		totalSupply,
	] = await Promise.all([
		LP_CONTRACT.token0(),
		TOKEN_0_CONTRACT.name(),
		TOKEN_0_CONTRACT.symbol(),
		TOKEN_0_CONTRACT.decimals(),
		LP_CONTRACT.token1(),
		TOKEN_1_CONTRACT.name(),
		TOKEN_1_CONTRACT.symbol(),
		TOKEN_1_CONTRACT.decimals(),
		TOKEN_1_CONTRACT.totalSupply(),
	]);

	return {
		token0,
		token0Name,
		token0Symbol,
		token0Decimals,
		token1,
		token1Name,
		token1Symbol,
		token1Decimals,
		totalSupply,

		pair:
			(await TOKEN_0_CONTRACT.symbol()) +
			"-" +
			(await TOKEN_1_CONTRACT.symbol()),
	};
}

export async function getLPs(): Promise<[...LPData[]]> {
	const length = await BMC_CONTRACT.poolLength();

	return Promise.all(
		Array.from(Array(Number(length)).keys()).map((poolID): Promise<LPData> => {
			return getLPData(poolID);
		})
	);
}
