import { Client } from "@gradio/client";

async function test() {
  try {
    console.log("Connecting...");

    const client = await Client.connect(
      "sam120904/hydro-disease-detector"
    );

    console.log("✅ Connected");
    console.log(client.view_api());
  } catch (err) {
    console.error(err);
  }
}

test();