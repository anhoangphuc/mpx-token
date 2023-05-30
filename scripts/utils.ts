import blueprint from "../plutus.json" assert { type: "json" };

import {
    Lucid, applyDoubleCborEncoding, applyParamsToScript,
} from "https://deno.land/x/lucid@0.10.1/mod.ts";
import { MPXValidators } from "./types.ts";
import { BlockFrostAPI } from "npm:@blockfrost/blockfrost-js";
export async function readMPXValidators(lucid: Lucid): Promise<MPXValidators> {
    const ownerAddr = await Deno.readTextFile("./owner.addr");
    const beneficiaryAddr = await Deno.readTextFile("./beneficiary.addr");
    const ownerPublishKeyHash = await lucid.utils.getAddressDetails(ownerAddr).paymentCredential?.hash || "";
    const beneficiaryPublishKeyHash = await lucid.utils.getAddressDetails(beneficiaryAddr).paymentCredential?.hash || "";
    const mpx = blueprint.validators.find((v) => v.title === "mpx_token.mpx_token");
    if (!mpx) {
        throw new Error("mpx_token.mpx_token not found");
    }
    const mpxParamed = applyParamsToScript(mpx.compiledCode, [
        [ownerPublishKeyHash, beneficiaryPublishKeyHash,]
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