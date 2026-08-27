from langfuse import Langfuse, observe
from openai import OpenAI

langfuse = Langfuse()
client = OpenAI()


@observe(name="openai-chat", as_type="generation")
def ask(question: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは親切なアシスタントです。"},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content


answer = ask("Langfuseとは何ですか？一文で教えてください。")
print(answer)
langfuse.flush()