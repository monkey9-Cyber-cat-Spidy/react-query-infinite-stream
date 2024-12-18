module.exports = { paginate: (items, cursor) => items.slice(cursor, cursor + 20) };
