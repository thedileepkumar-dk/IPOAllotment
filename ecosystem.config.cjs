module.exports = {
    apps: [
        {
            name: 'ipo-allotment',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3000',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
