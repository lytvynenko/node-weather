var config = {
    local: {
        mode: 'local',
        forecastURL:'https://api.forecast.io/forecast/edc069313d79a42d1262ad106cf203f6/',
        forecastURLBroken:'https://api.forecast.io/forecast_broken/edc069313d79a42d1262ad106cf203f6/',
        port: 3000
    },
    staging: {
        mode: 'staging',
        forecastURL:'https://api.forecast.io/forecast/edc069313d79a42d1262ad106cf203f6/',
        port: 4000
    },
    production: {
        mode: 'production',
        forecastURL:'https://api.forecast.io/forecast/edc069313d79a42d1262ad106cf203f6/',
        port: 5000
    }
}
module.exports = function(mode) {
    return config[mode || process.argv[2] || 'local'] || config.local;
}