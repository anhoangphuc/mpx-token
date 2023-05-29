import blueprint from "../plutus.json" assert { type: "json" };

import {
    Lucid, applyDoubleCborEncoding, applyParamsToScript,
} from "https://deno.land/x/lucid@0.10.1/mod.ts";
import { MPXValidators } from "./types.ts";
import { BlockFrostAPI } from "npm:@blockfrost/blockfrost-js";
export function readMPXValidators(lucid: Lucid, owners: string[]): MPXValidators {
    const mpx = blueprint.validators.find((v) => v.title === "mpx_token.mpx_token");
    if (!mpx) {
        throw new Error("mpx_token.mpx_token not found");
    }
    const mpxParamed = applyParamsToScript(mpx.compiledCode, [
        owners,
    ])
    return {
        mpxPolicyId: lucid.utils.mintingPolicyToId({
            type: 'PlutusV2',
            script: applyDoubleCborEncoding(mpxParamed),
        }),
        mpxPolicy: {
            type: 'PlutusV2',
            script: applyDoubleCborEncoding(mpxParamed),
        }
    }
}

export async function readAssetOfAddress(api: BlockFrostAPI, userAddress: string, assetName = 'lovelace'): Promise<{ unit: string, quantity: string }> {
    const userInfo = await api.addresses(userAddress);
    const userAsset = userInfo.amount.filter((asset) => asset.unit === assetName)[0];
    return {
        unit: assetName,
        quantity: userAsset?.quantity || '0',
    }
}