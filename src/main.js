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

function calculateProfit(revenue, productItem) {
    return revenue - productItem.purchase_price;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
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

    console.log(groupedProducts);

    let groupedSales = data.purchase_records.reduce((acc, product) => {
        const seller_id = product.seller_id;
        if (!acc[seller_id]){
            acc[seller_id] = {
                seller_id: seller_id,
                name: getName(data.sellers.find(seller => seller.id == seller_id)),
                sales_count: 0,
                revenue: 0,
                profit: 0,
                products_sold: {}
            };
        }
        acc[seller_id].sales_count++;
        product.items.forEach(purchase => {
            let revenue = calculateRevenue(purchase);
            acc[seller_id].revenue += revenue;
            acc[seller_id].profit += calculateProfit(revenue, groupedProducts[purchase.sku]);
            acc[seller_id].products_sold[purchase.sku] = (acc[seller_id].products_sold[purchase.sku] || 0) + 1;
        });
        return acc;
    }, {});

    console.log(groupedSales);

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}

function getName (seller) {
    return `${seller.first_name} ${seller.last_name}` ?? 'ИМЯ НЕ НАЙДЕНО';
}