import { StitchToolClient } from "@google/stitch-sdk";
import { verifyStitchMcp, StitchVerificationReport } from "../core/stitch-verify.js";

export async function stitchVerify(): Promise<StitchVerificationReport> {
  return verifyStitchMcp(process.env, new StitchToolClient());
}
