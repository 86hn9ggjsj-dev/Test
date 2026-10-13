from conftest import make_market

from polybot import filters
from polybot.config import Config
from polybot.polymarket import BookLevel, OrderBook, parse_book, parse_market

GAMMA_RAW = {
    "id": "123", "question": "Will it rain in NYC on Friday?", "slug": "rain-nyc",
    "outcomes": '["Yes", "No"]', "outcomePrices": '["0.35", "0.65"]',
    "clobTokenIds": '["111", "222"]', "endDate": "2099-01-01T12:00:00Z",
    "liquidityNum": 12000.5, "volume24hr": 3400, "resolutionSource": "https://www.weather.gov",
    "description": "This market resolves per NOAA.", "acceptingOrders": True, "enableOrderBook": True,
    "orderMinSize": 5, "orderPriceMinTickSize": 0.01, "negRisk": False, "closed": False,
}


def test_parse_gamma_market():
    m = parse_market(GAMMA_RAW)
    assert m.outcomes == ["Yes", "No"]
    assert m.token_ids == ["111", "222"]
    assert m.prices == [0.35, 0.65]
    assert m.liquidity == 12000.5
    assert m.end_date.year == 2099


def test_parse_rejects_non_binary():
    assert parse_market({**GAMMA_RAW, "outcomes": '["A","B","C"]'}) is None


def test_resolved_outcome():
    m = parse_market({**GAMMA_RAW, "closed": True, "outcomePrices": '["0", "1"]'})
    assert m.resolved_outcome() == 1


def test_book_sorting_and_fills():
    book = parse_book("t", {"bids": [{"price": "0.40", "size": "10"}, {"price": "0.45", "size": "10"}],
                            "asks": [{"price": "0.55", "size": "10"}, {"price": "0.50", "size": "10"}]})
    assert book.best_bid == 0.45 and book.best_ask == 0.50
    shares, avg = book.fill_buy(7.5)  # 10 @ 0.50 = $5, luego $2.5 @ 0.55
    assert round(shares, 4) == round(10 + 2.5 / 0.55, 4)
    assert 0.50 < avg < 0.55
    assert book.fill_buy(1000) is None  # sin profundidad
    proceeds, _ = book.fill_sell(15)  # 10 @ 0.45 + 5 @ 0.40
    assert round(proceeds, 4) == 6.5


def test_filters():
    cfg = Config()
    assert filters.rejection_reason(make_market(), cfg) is None
    assert "liquidez" in filters.rejection_reason(make_market(liquidity=5000), cfg)  # debe ser > 5000
    assert "resuelve" in filters.rejection_reason(make_market(hours=1.5), cfg)
    assert "fuente" in filters.rejection_reason(make_market(resolution_source="", description="vibes"), cfg)
    assert "volumen" in filters.rejection_reason(make_market(volume=10), cfg)
    assert "extremo" in filters.rejection_reason(make_market(price=0.99), cfg)


def test_book_mid():
    b = OrderBook("t", [BookLevel(0.4, 1)], [BookLevel(0.6, 1)])
    assert b.mid == 0.5
