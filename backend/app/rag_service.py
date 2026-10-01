import math
import re
from typing import List, Dict, Any, Tuple, Optional
from .config import GEMINI_API_KEY, OPENAI_API_KEY
from .database import get_db

NOT_FOUND_MESSAGE = "I couldn't find this information in the available college data."

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "tell", "give", "know", "please"
}

GENERIC_WORDS = {
    "timings", "timing", "time", "times", "date", "dates", "schedule", "schedules",
    "conducted", "college", "details", "rules", "rule", "info", "information",
    "announcement", "notice", "available", "when", "where", "how", "what", "which"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into meaningful lowercased tokens."""
    tokens = re.findall(r"\b[a-zA-Z0-9_\-\.\:]+\b", text.lower())
    return tokens

def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Search stored knowledge items using BM25-style keyword relevance,
    exact phrase matching, subject-grounded scoring, and category/title weighting.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, content, source_type, category, file_path, created_at FROM knowledge")
        records = [dict(row) for row in cursor.fetchall()]

    if not records:
        return []

    query_clean = query.lower().strip()
    all_query_tokens = tokenize(query)
    query_tokens = [t for t in all_query_tokens if t not in STOPWORDS]
    if not query_tokens:
        query_tokens = all_query_tokens

    # Subject-specific tokens (excluding generic inquiry words)
    subject_tokens = [t for t in query_tokens if t not in GENERIC_WORDS]

    scored_items: List[Tuple[float, Dict[str, Any]]] = []

    for item in records:
        title_text = item["title"].lower()
        category_text = item["category"].lower()
        content_text = item["content"].lower()

        title_tokens = tokenize(title_text)
        category_tokens = tokenize(category_text)
        content_tokens = tokenize(content_text)
        all_doc_tokens = set(title_tokens + category_tokens + content_tokens)

        # If user asked about specific subjects (e.g. 'swimming', 'hostel', 'exam'),
        # require at least one subject token to exist in the document!
        if subject_tokens:
            has_subject_match = any(st in all_doc_tokens or any(st in doc_t for doc_t in all_doc_tokens) for st in subject_tokens)
            if not has_subject_match:
                continue

        score = 0.0

        # Exact substring matches (Huge bonus)
        if query_clean in content_text or query_clean in title_text:
            score += 20.0

        # Title & Category matching
        for token in query_tokens:
            if token in title_tokens:
                score += 6.0
            elif any(token in tt for tt in title_tokens):
                score += 3.0

            if token in category_tokens:
                score += 4.0

        # Content keyword occurrences
        token_count = len(content_tokens)
        if token_count > 0:
            match_count = sum(1 for token in query_tokens if token in content_tokens)
            score += (match_count / len(query_tokens)) * 8.0
            for token in query_tokens:
                freq = content_tokens.count(token)
                if freq > 0:
                    score += math.log(1 + freq) * 2.0

        # Minimum relevance threshold
        if score >= 3.0:
            scored_items.append((score, item))

    # Sort descending by score
    scored_items.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored_items[:top_k]]

def extract_answer_locally(query: str, relevant_items: List[Dict[str, Any]]) -> str:
    """
    Extractive answer generator for offline/local RAG when no LLM API key is set.
    Picks the most informative sentences answering the question.
    """
    if not relevant_items:
        return NOT_FOUND_MESSAGE

    query_tokens = [t for t in tokenize(query) if t not in STOPWORDS]
    if not query_tokens:
        query_tokens = tokenize(query)

    best_sentence = ""
    highest_sentence_score = 0.0

    for item in relevant_items:
        text = item["content"]
        # Split into sentences or lines
        sentences = re.split(r"(?<=[.!?\n])\s+", text)
        for sent in sentences:
            sent_clean = sent.strip()
            if not sent_clean or len(sent_clean) < 8:
                continue
            sent_tokens = tokenize(sent_clean)
            overlap = sum(1 for t in query_tokens if t in sent_tokens)
            
            # Additional bonus if sentence contains numbers, dates, times for questions like 'when' / 'what time'
            bonus = 0.0
            if any(q in query.lower() for q in ["when", "time", "date", "schedule"]):
                if re.search(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}:\d{2}|am|pm|\d{4})\b", sent_clean, re.I):
                    bonus += 2.0

            sent_score = overlap + bonus
            if sent_score > highest_sentence_score:
                highest_sentence_score = sent_score
                best_sentence = sent_clean

    if highest_sentence_score >= 1.0 and best_sentence:
        return best_sentence

    # If full content is short (e.g. notice), return the top content item
    first_item_content = relevant_items[0]["content"].strip()
    if len(first_item_content) < 300:
        return first_item_content

    return relevant_items[0]["content"][:300].strip() + "..."

async def generate_llm_answer(query: str, relevant_items: List[Dict[str, Any]]) -> str:
    """
    Generates answer using Google Gemini or OpenAI when API keys are available in .env.
    Falls back to smart local extractive RAG if no key or on network failure.
    """
    if not relevant_items:
        return NOT_FOUND_MESSAGE

    context_parts = []
    for item in relevant_items:
        context_parts.append(
            f"--- Title: {item['title']} (Category: {item['category']}, Type: {item['source_type']}) ---\n{item['content']}"
        )
    knowledge_context = "\n\n".join(context_parts)

    system_instruction = (
        "You are Campus AI, an intelligent, helpful, and concise assistant for college students.\n"
        "Your task is to answer the user's question accurately using ONLY the provided college knowledge context.\n"
        "Rules:\n"
        "1. If the answer is present in the knowledge context, answer directly and concisely.\n"
        f"2. If the information is NOT present in the knowledge context, you MUST respond exactly with: '{NOT_FOUND_MESSAGE}'\n"
        "3. Do not make up facts or extrapolate beyond the provided knowledge."
    )

    prompt = f"{system_instruction}\n\nCollege Knowledge:\n{knowledge_context}\n\nStudent Question: {query}\n\nAnswer:"

    # 1. Try Google Gemini if GEMINI_API_KEY is present
    if GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"[RAG] Gemini genai SDK error: {e}, trying google.generativeai fallback")
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=GEMINI_API_KEY)
                model = legacy_genai.GenerativeModel("gemini-1.5-flash")
                resp = model.generate_content(prompt)
                if resp and resp.text:
                    return resp.text.strip()
            except Exception as e2:
                print(f"[RAG] Gemini legacy fallback error: {e2}")

    # 2. Try OpenAI if OPENAI_API_KEY is present
    if OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"College Knowledge:\n{knowledge_context}\n\nStudent Question: {query}"}
                ],
                temperature=0.1
            )
            ans = response.choices[0].message.content
            if ans:
                return ans.strip()
        except Exception as e:
            print(f"[RAG] OpenAI error: {e}")

    # 3. Local Smart Extractive RAG (Zero-dependency, offline, instant)
    return extract_answer_locally(query, relevant_items)

async def ask_campus_ai(query: str) -> Dict[str, Any]:
    """
    Complete RAG Pipeline:
    1. Search database for relevant knowledge
    2. If none found, return standard not found message
    3. If found, generate concise answer using LLM or local RAG
    4. Return structured response with sources and answer
    """
    relevant_items = search_knowledge_base(query)

    if not relevant_items:
        return {
            "answer": NOT_FOUND_MESSAGE,
            "found": False,
            "sources": []
        }

    answer = await generate_llm_answer(query, relevant_items)

    # Format sources for transparency
    sources = [
        {
            "id": item["id"],
            "title": item["title"],
            "category": item["category"],
            "source_type": item["source_type"]
        }
        for item in relevant_items
    ]

    return {
        "answer": answer,
        "found": answer.strip() != NOT_FOUND_MESSAGE,
        "sources": sources
    }
