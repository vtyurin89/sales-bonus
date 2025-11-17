/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // Расчет выручки от операции
    const { discount, sale_price, quantity } = purchase;
    const revenue = sale_price * (1 - discount / 100) * quantity;
    return Number(revenue.toFixed(2)); 
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

    // Проверка входных данных
    if (!data) {
        return null;
    }

    // Проверка наличия опций
    if (!options) {
        return null;
    }

    const { calculateRevenue, calculateBonus } = options;
    let result = [];

    let groupedSales = data.purchase_records.reduce((acc, product) => {
        const seller_id = product.seller_id;
        if (!acc[seller_id]){
            acc[seller_id] = {
                seller_id: seller_id,
                name: getName(data.sellers.find(seller => seller.id == seller_id)),
                sales_count: 0,
                revenue: 0,
            };
        }
        acc[seller_id].sales_count++;
        product.items.forEach(purchase => {
            acc[seller_id].revenue += calculateSimpleRevenue(purchase);
        })
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