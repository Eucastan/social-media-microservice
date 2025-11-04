export const pagination = (page = 1, size = 10) => {
    const limit = Number(size) > 0 ? Number(size) : 10;
    const offset = (Number(page) > 0 ? (Number(page) - 1) * limit : 0);
    return {limit, offset};
}