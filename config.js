// تكوين Supabase
const SUPABASE_CONFIG = {
    url: 'https://tgxuwhvydpjjzkrfkfco.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneHV3aHZ5ZHBqanprcmZrZmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDg4NjgsImV4cCI6MjA3NzA4NDg2OH0.NQAuGMR7DUcvHfhUbIXaycPTxHbC6SdiQ9gWrXCdBnA'
};

// عناوين العملات الرقمية
const CRYPTO_CURRENCIES = [
    {
        name: "USDT (TRC20)",
        symbol: "USDT",
        image: "https://placehold.co/50x50/26A17B/ffffff?text=USDT",
        address: "TGUs2roSYHQuNS1nhceEhFkC2ZDh6XXBzK",
        network: "TRON"
    },
    {
        name: "USDT (BEP20)",
        symbol: "USDT",
        image: "https://placehold.co/50x50/F3BA2F/ffffff?text=BNB",
        address: "0xc30cd7315a722b40d49f9c1c04fd80420ce19296",
        network: "Binance Smart Chain"
    },
    {
        name: "USDT (ERC20)",
        symbol: "USDT",
        image: "https://placehold.co/50x50/627EEA/ffffff?text=ETH",
        address: "0xc30cd7315a722b40d49f9c1c04fd80420ce19296",
        network: "Ethereum"
    },
    {
        name: "ETH (BEP20)",
        symbol: "ETH",
        image: "https://placehold.co/50x50/627EEA/ffffff?text=ETH",
        address: "0xc30cd7315a722b40d49f9c1c04fd80420ce19296",
        network: "Binance Smart Chain"
    },
    {
        name: "BTC (BEP20)",
        symbol: "BTC",
        image: "https://placehold.co/50x50/F7931A/ffffff?text=BTC",
        address: "0xc30cd7315a722b40d49f9c1c04fd80420ce19296",
        network: "Binance Smart Chain"
    }
];

// جوائز عجلة الحظ
const WHEEL_PRIZES = [
    { id: 1, name: "حظ أوفر", type: "nothing", value: 0, probability: 20 },
    { id: 2, name: "10 نقاط", type: "points", value: 10, probability: 25 },
    { id: 3, name: "دورة مجانية", type: "free_spin", value: 1, probability: 15 },
    { id: 4, name: "1 دولار", type: "dollars", value: 1, probability: 15 },
    { id: 5, name: "10 دولار", type: "dollars", value: 10, probability: 5 },
    { id: 6, name: "0.5 دولار", type: "dollars", value: 0.5, probability: 20 }
];