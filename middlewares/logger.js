const logger = (req, res, next) => {
    const { method, url, ip} = req;
    console.log(
        `[${new Date().toISOString()}] Effettuata richiesta ${method} all'endpoint ${url} da ip ${ip}`
    );
    next();
};

module.exports = logger;
