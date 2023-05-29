import blueprint from "../plutus.json" assert { type: "json" };

import {
    Lucid,
} from "https://deno.land/x/lucid@0.10.1/mod.ts";
import { MPXValidators } from "./types.ts";
export function readMPXValidators(lucid: Lucid): MPXValidators {
    const mpx = blueprint.validators.find((v) => v.title === "mpx_token.mpx_token");
    if (!mpx) {
        throw new Error("mpx_token.mpx_token not found");
    }
    return {
        mpxPolicyId: lucid.utils.mintingPolicyToId({
            type: 'PlutusV2',
            script: mpx.compiledCode,
        }),
        mpxPolicy: {
            type: 'PlutusV2',
            script: mpx.compiledCode,
        }
    }
}