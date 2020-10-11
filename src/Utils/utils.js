export function getRandom(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

export function isNotEmpty(obj) {
    return obj !== undefined && obj !== null;
}

export function createOrAddToKey(obj, key, value) {
    if (isNotEmpty(obj[key]))
        obj[key] += value;
    else
        obj[key] = value;
    return obj;
}