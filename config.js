exports.config = {
  redisHost: (process.env.ES_REDIS_HOST === undefined ? 'localhost' : process.env.ES_REDIS_HOST),
  redisPort: (process.env.ES_REDIS_PORT === undefined ? 6379 : process.env.ES_REDIS_PORT),
  redisPwd:  (process.env.ES_REDIS_PWD  === undefined ? '' : process.env.ES_REDIS_PWD),
  host:      (process.env.ES_HOST       === undefined ? 'localhost' : process.env.ES_HOST),
  port:      (process.env.ES_PORT       === undefined ? 4000 : process.env.ES_PORT)
};
