/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // Расчет выручки от операции
    const { discount, sale_price, quantity } = purchase;
    return sale_price * (1 - discount / 100) * quantity;
}

function calculateProfit(purchase, revenue, productItem) {
    return revenue - productItem.purchase_price * purchase.quantity;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    const BONUS_RATES = {
        FIRST_PLACE: 0.15,
        TOP_THREE: 0.1,
        STANDARD: 0.05,
        LAST_PLACE: 0
    };
    let percent;
    if (index == 0) {
        percent = BONUS_RATES.FIRST_PLACE;
    } else if ([1,2].includes(index)) {
        percent = BONUS_RATES.TOP_THREE;
    } else if (index == total - 1) {
        percent = BONUS_RATES.LAST_PLACE;
    } else {
        percent = BONUS_RATES.STANDARD;
    }
    return profit * percent;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {

    if (!data) {
        throw new Error("Отсутствует аргумент data");
    }

    if (!options) {
        throw new Error("Отсутствует аргумент options");
    }

    if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error("Требуется непустой массив products");
    }

    if (!Array.isArray(data.purchase_records) || data.purchase_records.length === 0) {
        throw new Error("Требуется непустой массив purchase_records");
    }

    if (!Array.isArray(data.sellers) || data.sellers.length === 0) {
        throw new Error("Требуется непустой массив sellers");
    }

    const { calculateRevenue, calculateBonus } = options;

    if (typeof calculateRevenue !== 'function') {
        throw new Error("calculateRevenue должна быть функцией!");
    }

    if (typeof calculateBonus !== 'function') {
        throw new Error("calculateProfit должна быть функцией!");
    }

    let result = [];

    let groupedProducts = data.products.reduce((acc, product) => {
        const sku = product.sku;
        if (!acc[sku]){
            acc[sku] = {
                ...product
            };
            delete acc[sku].sku;
        };
        return acc;
    },{});

    let groupedSales = data.purchase_records.reduce((acc, product) => {
        const seller_id = product.seller_id;
        if (!acc[seller_id]){
            acc[seller_id] = {
                seller_id: seller_id,
                name: getName(data.sellers.find(seller => seller.id == seller_id)),
                revenue: 0,
                profit: 0,
                sales_count: 0,
                products_sold: {}
            };
        }
        acc[seller_id].sales_count++;
        acc[seller_id].revenue += product.total_amount;

        product.items.forEach(purchase => {
            let revenue = calculateRevenue(purchase);
            acc[seller_id].profit += calculateProfit(purchase, revenue, groupedProducts[purchase.sku]);
            acc[seller_id].products_sold[purchase.sku] = (acc[seller_id].products_sold[purchase.sku] || 0) + purchase.quantity;
        });
        return acc;
    }, {});

    result = Object.values(groupedSales);
    result.forEach((seller) => {
        seller.top_products = Object.entries(seller.products_sold)
        .sort((a,b) => {
            if (a[1] !== b[1]) return b[1] - a[1];
            // return a[0].localeCompare(b[0]);
        })
        .slice(0,10)
        .map(arr => {
            return  {
                sku: arr[0],
                quantity: arr[1],
            };
        });

    });
    result.sort((a,b) => {
        if (a.profit > b.profit) {
            return -1;
        }
        if (a.profit < b.profit) {
            return 1;
        }
        return 0;
    });
    result.forEach((seller, index) => {
        seller.bonus = calculateBonusByProfit(index, result.length, seller);
        seller.bonus = +seller.bonus.toFixed(2);
        seller.profit = +seller.profit.toFixed(2);
        seller.revenue = +seller.revenue.toFixed(2);
        delete seller.products_sold;
    });

    return result;
}

function getName (seller) {
    return `${seller.first_name} ${seller.last_name}` ?? 'ИМЯ НЕ НАЙДЕНО';
}