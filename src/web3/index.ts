import axios from "axios";
import { LPData, ReserveData } from "./types";
import { ethers, BigNumber } from "ethers";

import BoostedMasterChief from "../contracts/BoostedMasterChef.json";
import JoeLPToken from "../contracts/JoeLPToken.json";
import JoeRouter from "../contracts/JoeRouter.json";
import IERC20 from "../contracts/IERC20.json";

const RPC_URL = "https://api.avax.network/ext/bc/C/rpc";

const BMC_ADDRESS = "0x4483f0b6e2F5486D06958C20f8C39A7aBe87bf8F";
const ROUTER_ADDRESS = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const BMC_CONTRACT = new ethers.Contract(
	BMC_ADDRESS,
	BoostedMasterChief,
	provider
);

const ROUTER_CONTRACT = new ethers.Contract(
	ROUTER_ADDRESS,
	JoeRouter,
	provider
);

export var totalJoePerSec: BigNumber;
export var totalAllocPoint: BigNumber;

export async function getLPReserves(poolData: LPData): Promise<ReserveData> {
	const LP_CONTRACT = new ethers.Contract(
		poolData.lpAddress,
		JoeLPToken,
		provider
	);

	const data = await LP_CONTRACT.getReserves();

	return {
		_reserve0: data[0],
		_reserve1: data[1],
		_blockTimestampLast: data[2],
	};
}

export async function poolUserInfo(
	poolID: number,
	wallet: string
): Promise<any> {
	return await BMC_CONTRACT.userInfo(poolID, wallet);
}

export async function getLPData(poolID: number): Promise<LPData> {
	const { lpToken, totalLpSupply, totalFactor, allocPoint, veJoeShareBp } =
		await BMC_CONTRACT.poolInfo(poolID);

	const LP_CONTRACT = new ethers.Contract(lpToken, JoeLPToken, provider);

	const [token0Address, token1Address] = await Promise.all([
		LP_CONTRACT.token0(),
		LP_CONTRACT.token1(),
	]);

	[totalJoePerSec, totalAllocPoint] = await Promise.all([
		BMC_CONTRACT.joePerSec(),
		BMC_CONTRACT.totalAllocPoint(),
	]);

	const TOKEN_0_CONTRACT = new ethers.Contract(token0Address, IERC20, provider);
	const TOKEN_1_CONTRACT = new ethers.Contract(token1Address, IERC20, provider);

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
		pair,
	] = await Promise.all([
		LP_CONTRACT.token0(),
		TOKEN_0_CONTRACT.name(),
		TOKEN_0_CONTRACT.symbol(),
		TOKEN_0_CONTRACT.decimals(),
		LP_CONTRACT.token1(),
		TOKEN_1_CONTRACT.name(),
		TOKEN_1_CONTRACT.symbol(),
		TOKEN_1_CONTRACT.decimals(),
		LP_CONTRACT.totalSupply(),

		(await TOKEN_0_CONTRACT.symbol()) + "-" + (await TOKEN_1_CONTRACT.symbol()),
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
		pair,

		totalLpSupply,
		totalFactor,
		allocPoint,
		veJoeShareBp,
		lpAddress: lpToken,
		poolID,
	};
}

export async function getLPs(): Promise<LPData[]> {
	const length = await BMC_CONTRACT.poolLength();

	return Promise.all(
		Array.from(Array(Number(length)).keys()).map((poolID): Promise<LPData> => {
			return getLPData(poolID);
		})
	);
}

export async function fetchBalance(address: string): Promise<number> {
	const {
		data: {
			data: { users },
		},
	} = await axios.post(
		"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/vejoe",
		{
			query: `{ users( where: {id: "${address.toLowerCase()}" } ) { veJoeBalance } }`,
		}
	);

	return Math.floor(Number(users[0]!.veJoeBalance));
}

export async function getPairData(address: string) {
	return (
		await axios.post(
			"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
			{
				query: `{ pairs(where: { id: "${address.toLowerCase()}" } ) { token0Price, token1Price, reserveUSD } }`,
			}
		)
	).data;
}

export async function getJoePrice() {
	return (
		await axios.post(
			"https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
			{
				query: `{ pairs(where: { id: "0x3bc40d4307cd946157447cd55d70ee7495ba6140" } ) { id, name, token1Price } }`,
			}
		)
	).data.data.pairs[0]!.token1Price;
}

export async function tokenPrice(lpData: LPData, token: 0 | 1) {
	const tokenAddress = lpData[`token${token}`].toLowerCase();
	const tokenPath = [
		"0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX Routing to ensure liquidity
		"0xc7198437980c041c805A1EDcbA50c1Ce5db95118", // USDT
	];
	if (!(tokenPath[0] === tokenAddress)) {
		tokenPath.unshift(tokenAddress);
	}

	const tokenInAmount = ethers.BigNumber.from("10").pow(
		lpData[`token${token}Decimals`]
	);

	const result = await ROUTER_CONTRACT.getAmountsOut(tokenInAmount, tokenPath);
	return (result[2] || result[1]) / 1 / 10 ** 6; // Return token in USDT / 10**6 (USDT Decimals)
}

export async function balanceTokens(
	address: string,
	amount: number,
	token: 0 | 1
) {
	const {
		data: { pairs },
	} = await getPairData(address);

	const token0Price = pairs[0].token0Price;
	const token1Price = pairs[0].token1Price;

	if (token) {
		return amount * token0Price;
	} else {
		return amount * token1Price;
	}
}

export async function balancePair(
	address: string,
	amount: number
): Promise<number[]> {
	const {
		data: { pairs },
	} = await getPairData(address);

	const token0Price = pairs[0].token0Price;
	const token1Price = pairs[0].token1Price;

	return [amount / 2 / token0Price, amount / 2 / token1Price];
}
