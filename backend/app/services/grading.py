"""Server-side answer checking for the five exercise types."""
import re
import unicodedata

from ..models import Exercise


def _fold(text: str) -> str:
    """Lowercase, strip accents/punctuation and collapse spaces: 'Él come,  pan!' == 'el come pan'."""
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def correct_answer_text(ex: Exercise) -> str:
    if ex.type == "match_pairs":
        return ", ".join(f"{a} = {b}" for a, b in ex.answer["pairs"])
    return ex.answer["answer"]


def check_answer(ex: Exercise, submitted) -> bool:
    if ex.type == "match_pairs":
        expected = {tuple(p) for p in ex.answer["pairs"]}
        try:
            given = {tuple(p) for p in submitted}
        except TypeError:
            return False
        return given == expected
    if not isinstance(submitted, str):
        return False
    if ex.type == "type_answer":
        # accents optional for typed answers (like Duolingo's "you have a typo" leniency)
        return _fold(submitted) == _fold(ex.answer["answer"])
    return _fold(submitted) == _fold(ex.answer["answer"])
