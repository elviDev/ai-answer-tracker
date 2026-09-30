from app.analysis import analyze, answer_hash, find_mentions, similarity


def test_mentions_are_whole_word_and_case_insensitive():
    text = "Acme is great. ACME beats Acmeville. acme!"
    assert find_mentions(text, ["Acme"]) == [0, 15, 37]


def test_aliases_count_as_brand():
    result = analyze("Try Notion.so or Coda.", [], "Notion", aliases=["Notion.so"])
    assert result.brand_mentioned
    assert result.mention_count == 1


def test_rank_against_competitors():
    text = "Top picks: Globex, Acme, then Initech."
    result = analyze(text, [], "Acme", competitors=["Globex", "Initech", "Hooli"])
    assert result.brand_rank == 2
    assert result.competitor_mentions == {"Globex": 1, "Initech": 1, "Hooli": 0}
    assert 0 < result.first_mention_offset < 1


def test_not_mentioned():
    result = analyze("Nothing relevant here.", [], "Acme", competitors=["Globex"])
    assert not result.brand_mentioned
    assert result.brand_rank is None
    assert result.first_mention_offset is None


def test_citation_detected_from_source_domain():
    sources = [{"title": "Pricing", "url": "https://www.notion.so/pricing"}]
    assert analyze("", sources, "Notion").brand_cited
    assert not analyze("", [{"title": "x", "url": "https://example.com"}], "Notion").brand_cited


def test_change_detection_ignores_whitespace_and_case():
    assert answer_hash("Hello   World") == answer_hash("hello world")
    assert similarity("a b c d", "a b c d") == 1.0
    assert similarity("a b c d", "a b x d") < 1.0
