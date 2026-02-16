const path = require('path');

module.exports = {
    // Точка входа - ваш главный JS файл
    entry: "./main.js",
    
    // Настройки выходного файла
    output: {
        filename: "main.js", // Имя выходного файла
        path: path.resolve(__dirname, "dist"), // Папка, куда сохранять
    },
    
    // Режим разработки (для продакшена будет 'production')
    mode: "development",
};