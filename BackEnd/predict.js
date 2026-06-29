import { Client, handle_file } from "@gradio/client";

async function run() {
  try {
    const client = await Client.connect(
      "sam120904/hydro-disease-detector"
    );

    const result = await client.predict("/predict", {
      image: handle_file("./Tomato.jpg"),
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();