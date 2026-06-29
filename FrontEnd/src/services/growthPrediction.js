const BACKEND_URL = "http://192.168.1.11:3000";

export async function predictGrowth(data) {

    const response = await fetch(
        `${BACKEND_URL}/growth`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    return response.json();
}