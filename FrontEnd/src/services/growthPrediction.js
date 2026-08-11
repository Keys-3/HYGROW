import { BACKEND_URL } from '../utils/apiConfig';

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