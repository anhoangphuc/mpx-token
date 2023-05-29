import { readMPXValidators } from "./utils.ts";

import { Lucid, Blockfrost, Data } from "https://deno.land/x/lucid@0.10.1/mod.ts";
import { fromText } from "https://deno.land/x/lucid@0.10.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";


const blockfrostKey = Deno.env.get("BLOCKFROST_KEY");

const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", blockfrostKey),
    "Preview",
);

lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./owner.sk"));
const ownerAddr = await Deno.readTextFile("./owner.addr");
const ownerPublishKeyHash = await lucid.utils.getAddressDetails(ownerAddr)
.paymentCredential?.hash || "";
const mpxValidators = readMPXValidators(lucid, [ownerPublishKeyHash]);

const assetName = `${mpxValidators.mpxPolicyId}${fromText("MPX")}`;


const tx = await lucid.newTx()
    .attachMintingPolicy(mpxValidators.mpxPolicy)
    .mintAssets({ [assetName]: BigInt(10) }, Data.void())
    .addSigner(ownerAddr)
    .complete();

const txSigned = await tx.sign().complete();
const txHash = await txSigned.submit();
await lucid.awaitTx(txHash);
console.log(`Mint sucess at tx ${txHash}`);