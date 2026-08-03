import httpx
import os

async def verify_recaptcha(token: str) -> bool:
    secret = os.getenv("RECAPTCHA_SECRET_KEY")
    if not secret:
        print("WARNING: RECAPTCHA_SECRET_KEY environment variable is not set.")
        return False
        
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": secret, "response": token}
        )
        result = response.json()
        return result.get("success", False)
