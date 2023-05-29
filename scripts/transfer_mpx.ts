import { readAssetOfAddress, readMPXValidators } from "./utils.ts";

import { Lucid, Blockfrost } from "https://deno.land/x/lucid@0.10.1/mod.ts";
import { BlockFrostAPI } from "npm:@blockfrost/blockfrost-js";
import { fromText } from "https://deno.land/x/lucid@0.10.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { parse } from "https://deno.land/std@0.188.0/flags/mod.ts";



const blockfrostKey = Deno.env.get("BLOCKFROST_KEY");

const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", blockfrostKey),
    "Preview",
);
lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./owner.sk"));

const blockfrostAPI = new BlockFrostAPI({
    projectId: blockfrostKey || "",
});


const flags = parse(Deno.args, {
    string: ["amount"],
});



const mpxValidators = await readMPXValidators(lucid);

const assetName = `${mpxValidators.mpxPolicyId}${fromText("MPX")}`;
const userAddress = await Deno.readTextFile('./owner.addr');
const userBalance = await readAssetOfAddress(blockfrostAPI, userAddress, assetName);
const amountTransferedArg = flags.amount;
if (!amountTransferedArg) {
    throw new Error("Amount to transfer not provided");
}

const amountTransfered = BigInt(amountTransferedArg);
if (BigInt(userBalance.quantity) < amountTransfered) {
    throw new Error(`Balance ${userBalance.quantity} not enough to transfer ${amountTransferedArg}}`);
}


const beneficiaryAddress = await Deno.readTextFile("./beneficiary.addr");

const tx = await lucid.newTx()
    .payToAddress(beneficiaryAddress, { [assetName]: amountTransfered })
    .complete();

const txSigned = await tx.sign().complete();
const txHash = await txSigned.submit();
await lucid.awaitTx(txHash);
console.log(`Transfer sucess at tx ${txHash}`);