import axios from "axios";
import NodeCache from "node-cache";
import { BuyRequest } from "../types";
import { pool } from "../db";

const cache = new NodeCache({ stdTTL: 300 }); // 5 мин

export const getItemsFunc = async (_, res) => {
    const cacheKey = "skinport_items";

    const cached = cache.get(cacheKey);
    if (cached) {
        console.log("кешированные данные отправлены клиенту");
        return res.json(cached).status(200);
    }

    try {
        console.log("старт выполнения запроса к апи");
        const { data: tradableData } = await axios.get("https://api.skinport.com/v1/items", {
            params: {
                tradable: true, // торгуемые
            },
        });

        const { data: nonTradableData } = await axios.get("https://api.skinport.com/v1/items", {
            params: {
                tradable: false, // неторгуемые
            },
        });
        console.log("конец выполнения запроса к апи");

        const result = [
            ...tradableData.map((item: any) => ({
                market_hash_name: item.market_hash_name,
                tradableMinPrice: item.min_price,
                nonTradableMinPrice: null,
            })),
            ...nonTradableData.map((item: any) => ({
                market_hash_name: item.market_hash_name,
                tradableMinPrice: null,
                nonTradableMinPrice: item.min_price,
            })),
        ];

        cache.set(cacheKey, result);

        res.json(result).status(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "фейл при запросе к апи" });
    }
};

export const buyFunc = async (req, res) => {
    const { userId, amount } = req.body as BuyRequest;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query("SELECT balance FROM users WHERE id = $1 FOR UPDATE", [userId]);
        console.log("🚀 ~ buyFunc ~ result:", result);

        const user = result.rows[0];
        if (!user) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "юзера нет" });
        }

        if (user.balance <= 0 || user.balance < amount) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "денег не достаточно" });
        }

        await client.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, userId]);

        await client.query("COMMIT");
        res.json({ success: true }).status(200);
    } catch (err) {
        console.log("🚀 ~ buyFunc ~ err:", err)
        
        await client.query("ROLLBACK");
        res.status(500).json({ error: "500" });
    } finally {
        client.release();
    }
};
