import { Client } from "@gradio/client";

let client;

export async function predictGrowth({
    temperature,
    humidity,
    tds,
    ph,
}) {

    if (!client) {
        console.log("Connecting...");

        client = await Client.connect(
            "sam120904/hydrogrow-ai-growth-prediction"
        );
    }

    const result = await client.predict("/predict", {
        temperature,
        humidity,
        tds,
        ph,
    });

    return result.data;
}