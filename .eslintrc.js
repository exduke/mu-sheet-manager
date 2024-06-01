module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "globals": {

    },
    "overrides": [
        {
            "files": ['*.vue'],
            "parser": "vue-eslint-parser",
            "extends": [
                "eslint:recommended",
                "plugin:vue/essential"
            ],
            "parserOptions": {
                "ecmaVersion": 12,
                "sourceType": "module"
            },
            "plugins": [
                "vue"
            ],
            "rules": {
                "no-unused-vars": 'off',
                // 'vue/valid-v-for': 'off',
                // 'vue/no-multiple-template-root': 'off',
            },
        },
        {
            "files": ['*.js'],
            "parser": "@babel/eslint-parser",
        }
    ],
};
