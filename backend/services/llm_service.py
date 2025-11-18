import openai
import ollama

def queryOllama(model: str, prompt: str) -> str:    
    response = ollama.chat(
        model=model, 
        messages=[{"role": "user", "content": prompt}]
    )
    
    return (response["message"]["content"]).strip()

def queryOpenAI(model: str, prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return (response.choices[0].message.content).strip()