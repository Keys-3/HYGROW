import { Client } from "@gradio/client";

let client = null;

export async function getGrowthClient() {
    if (!client) {
        client = await Client.connect(
            "sam120904/hydrogrow-ai-growth-prediction"
        );
    }

    return client;
}